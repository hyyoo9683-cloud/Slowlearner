export function getStoredKey() {
  return localStorage.getItem('slowrunner_gemini_key') || '';
}

export function setStoredKey(key) {
  localStorage.setItem('slowrunner_gemini_key', key);
}

async function callGemini(contents, maxOutputTokens = 1024) {
  const resp = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ contents, maxOutputTokens }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'AI 요청 실패');
  }

  const data = await resp.json();
  if (!data.text) throw new Error('AI 응답이 비어있어요.');
  return data.text;
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
    return JSON.parse(match[0]);
  }
}

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
  const parsed = parseJSON(raw);
  if (!parsed.suggestions) throw new Error('AI 응답 형식 오류. 다시 시도해주세요.');
  return parsed.suggestions;
}

export async function analyzePhoto(base64DataUrl) {
  const base64 = base64DataUrl.split(',')[1];
  const mimeType = base64DataUrl.split(';')[0].split(':')[1];

  const prompt = `You are an English learning assistant for Korean speakers. Look carefully at this photo and describe exactly what you see — objects, people, animals, food, places, mood, colors, textures.

Return JSON only (no markdown):
{
  "scene": "사진에 보이는 것을 구체적으로 묘사한 한국어 한 문장",
  "words": [
    {"english": "specific noun or phrase visible in photo", "korean": "한국어"},
    {"english": "specific noun or phrase visible in photo", "korean": "한국어"},
    {"english": "specific noun or phrase visible in photo", "korean": "한국어"},
    {"english": "specific noun or phrase visible in photo", "korean": "한국어"}
  ],
  "sentence": "One natural English sentence a Korean person could write in their journal about this photo"
}

Important: words must be SPECIFIC to what's actually in this photo, not generic. If you see a cat, say "tabby cat" not just "animal". If you see coffee, say "latte art" not just "drink".`;

  const raw = await callGemini([{
    parts: [
      { inline_data: { mime_type: mimeType, data: base64 } },
      { text: prompt },
    ],
  }]);
  return parseJSON(raw);
}

export async function getCultureCard() {
  const today = new Date().toISOString().slice(0, 10);
  const cached = localStorage.getItem(`sandalog_culture_${today}`);
  if (cached) return JSON.parse(cached);

  const prompt = `You are a cultural context guide for Korean people learning English.
Generate today's cultural insight card in JSON format.
Focus on practical situations: small talk, school/work culture,
social customs, holidays, food culture in English-speaking countries.

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
  const result = parseJSON(raw);
  localStorage.setItem(`sandalog_culture_${today}`, JSON.stringify(result));
  return result;
}

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
  return parseJSON(raw);
}

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
Be encouraging and specific. Score out of 100.`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  return parseJSON(raw);
}

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
  return parseJSON(raw);
}
