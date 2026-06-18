const MODEL = 'gemini-2.5-flash';

export function getStoredKey() {
  return localStorage.getItem('slowrunner_gemini_key') || '';
}

export function setStoredKey(key) {
  localStorage.setItem('slowrunner_gemini_key', key);
}

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('slowrunner_gemini_key');
}

async function callGemini(contents) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      }),
    }
  );

  if (!resp.ok) throw new Error(`API error: ${await resp.text()}`);
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// 텍스트 기반 영어 문장 제안
export async function getSuggestions(text, mode) {
  const prompt = mode === 'korean'
    ? `You are a friendly English learning assistant. The user is a Korean speaker learning English through daily life journaling. Given their Korean text, suggest 3 natural English sentences. Return JSON only: {"suggestions": ["...", "...", "..."]}. Keep it warm, natural, not textbook-like.\n\nKorean text: ${text}`
    : `You are a friendly English learning assistant. The user wrote an English sentence. Suggest 3 more natural versions. Return JSON only: {"suggestions": ["...", "...", "..."]}. Be encouraging, not corrective in tone.\n\nEnglish text: ${text}`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]).suggestions;
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

// 뉴스 기사 한국어 3줄 요약 + 핵심 단어
export async function summarizeNews(title, description) {
  const prompt = `You are an English learning assistant for Korean speakers. Summarize this news article.

Title: ${title}
Description: ${description || ''}

Return JSON only:
{
  "koTitle": "한국어 제목 (20자 이내)",
  "summary": ["첫 번째 요약 문장", "두 번째 요약 문장", "세 번째 요약 문장"],
  "words": ["key word 1", "key word 2", "key word 3", "key word 4"],
  "category": "세계|기술|환경|경제|문화 중 하나"
}`;

  const raw = await callGemini([{ parts: [{ text: prompt }] }]);
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]);
}
