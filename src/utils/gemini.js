const MODEL = 'gemini-2.5-flash';

export function getStoredKey() {
  return localStorage.getItem('slowrunner_gemini_key') || '';
}

export function setStoredKey(key) {
  localStorage.setItem('slowrunner_gemini_key', key);
}

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_SLOW_LEARNER_API || localStorage.getItem('slowrunner_gemini_key');
}

async function callGemini(contents, retries = 3) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  for (let i = 0; i < retries; i++) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 512, temperature: 0.7, responseMimeType: 'application/json' },
        }),
      }
    );

    if (resp.status === 503 && i < retries - 1) {
      await new Promise(r => setTimeout(r, (i + 1) * 1500));
      continue;
    }

    if (!resp.ok) throw new Error(`API error: ${await resp.text()}`);
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI 응답이 비어있어요. 잠시 후 다시 시도해주세요.');
    return text;
  }
  throw new Error('서버가 혼잡해요. 잠시 후 다시 시도해주세요.');
}

// 텍스트 기반 영어 문장 제안
export async function getSuggestions(text, mode) {
  const prompt = mode === 'korean'
    ? `You are a friendly English learning assistant. The user is a Korean speaker learning English through daily life journaling. Given their Korean text, suggest 3 natural English sentences with Korean translations and vocabulary.

Return JSON only:
{
  "suggestions": [
    {
      "english": "natural English sentence",
      "korean_translation": "한국어 번역",
      "vocabulary": [{"word": "word", "meaning": "뜻"}]
    }
  ]
}

Keep it warm, natural, not textbook-like. Include 2-3 vocabulary items per suggestion from words used in the sentence.

Korean text: ${text}`
    : `You are a friendly English learning assistant. The user wrote an English sentence. Suggest 3 more natural improved versions with Korean translations and explanations of changes.

Return JSON only:
{
  "suggestions": [
    {
      "improved": "improved sentence",
      "korean_translation": "한국어 번역",
      "changes": [{"original": "original word/phrase", "improved": "improved word/phrase", "reason_korean": "변경 이유"}]
    }
  ]
}

Be encouraging, not corrective in tone. Include 1-2 change explanations per suggestion.

English text: ${text}`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.suggestions) return parsed.suggestions;
  } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
  const parsed = JSON.parse(match[0]);
  return parsed.suggestions;
}

// 사진 분석 — 관련 영어 단어 + 예문 제안
export async function analyzePhoto(base64DataUrl) {
  const base64 = base64DataUrl.split(',')[1];
  const mimeType = base64DataUrl.split(';')[0].split(':')[1];

  const prompt = `You are a friendly English learning assistant for Korean speakers. Analyze this photo and suggest vocabulary related to what you see.

Return JSON only:
{
  "scene": "one short Korean sentence describing the scene",
  "words": [
    {"english": "stone wall", "korean": "돌담"},
    {"english": "moss", "korean": "이끼"},
    {"english": "path", "korean": "길"},
    {"english": "sunlight", "korean": "햇빛"}
  ],
  "sentence": "One natural English sentence describing this scene"
}

Keep words simple and useful for daily journaling. Max 4 words.`;

  const raw = await callGemini([{
    parts: [
      { inline_data: { mime_type: mimeType, data: base64 } },
      { text: prompt },
    ],
  }]);

  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]);
}

// 오늘의 문화 한 조각
export async function getCultureCard() {
  const today = new Date().toISOString().slice(0, 10);
  const cached = localStorage.getItem(`sandalog_culture_${today}`);
  if (cached) return JSON.parse(cached);

  const prompt = `You are a cultural context guide for Korean people learning English.
Generate today's cultural insight card in JSON format.
Focus on practical situations: small talk, school/work culture,
social customs, holidays, food culture in English-speaking countries.
Choose topics that help Koreans feel less lost in real conversations with foreigners.

Return ONLY this JSON, no markdown:
{
  "category": "교육 | 스몰토크 | 문화행사 | 식문화 | 직장문화 | 일상습관",
  "emoji": "(relevant emoji)",
  "title": "(Korean title, question format preferred, under 25 chars)",
  "description": "(Korean, 3-4 sentences, background context, warm tone, no judgment)",
  "expressions": [
    {
      "english": "(natural expression)",
      "korean": "(Korean explanation)",
      "example": "(one example sentence in English)"
    },
    {
      "english": "(natural expression)",
      "korean": "(Korean explanation)",
      "example": "(one example sentence in English)"
    }
  ]
}`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI 응답 형식 오류');
  const result = JSON.parse(match[0]);
  localStorage.setItem(`sandalog_culture_${today}`, JSON.stringify(result));
  return result;
}

// 영어 원문 분석 — 한/영 요약 + 핵심 단어
export async function analyzeArticle(text) {
  const prompt = `You are an English learning assistant for Korean speakers. Analyze this English text.

Text: ${text.slice(0, 2000)}

Return JSON only:
{
  "koSummary": ["한국어 요약 1문장", "한국어 요약 2문장", "한국어 요약 3문장"],
  "enSummary": ["English summary sentence 1", "English summary sentence 2", "English summary sentence 3"],
  "words": [{"english": "word", "korean": "뜻", "example": "example sentence"}],
  "level": "easy|medium|hard",
  "topic": "짧은 주제 (10자 이내)"
}
Keep words to 4 items. Choose words that are useful and interesting for Korean learners.`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
  return JSON.parse(match[0]);
}

// 영어 글 첨삭 — 문법/자연스러움/표현 피드백
export async function proofreadText(original, userText) {
  const prompt = `You are a friendly English writing tutor for Korean learners. Review the student's English writing.

${original ? `Original article context: ${original.slice(0, 500)}\n\n` : ''}Student's writing: ${userText}

Return JSON only:
{
  "corrected": "corrected version of the student's text",
  "feedback": ["specific feedback point 1 in Korean", "specific feedback point 2 in Korean"],
  "good": "one thing they did well, in Korean",
  "score": 85
}
Be encouraging and specific. Score out of 100. If the text is already good, say so warmly.`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
  return JSON.parse(match[0]);
}

// 뉴스 기사 한국어 3줄 요약 + 핵심 단어
export async function summarizeNews(title, description) {
  const prompt = `You are an English learning assistant for Korean speakers. Summarize this news article.

Title: ${title}
Description: ${description || ''}

Return JSON only:
{
  "koTitle": "한국어 제목 (20자 이내)",
  "summary": ["첫 번째 한국어 요약", "두 번째 한국어 요약", "세 번째 한국어 요약"],
  "enSummary": ["First English summary sentence", "Second English summary sentence", "Third English summary sentence"],
  "words": ["key word 1", "key word 2", "key word 3", "key word 4"],
  "category": "세계|기술|환경|경제|문화 중 하나"
}`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]);
}
