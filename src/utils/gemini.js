const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('slowrunner_gemini_key');
const MODEL = 'gemini-2.0-flash';

export function getStoredKey() {
  return localStorage.getItem('slowrunner_gemini_key') || '';
}

export function setStoredKey(key) {
  localStorage.setItem('slowrunner_gemini_key', key);
}

export async function getSuggestions(text, mode) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('slowrunner_gemini_key');
  if (!apiKey) throw new Error('NO_KEY');

  const prompt = mode === 'korean'
    ? `You are a friendly English learning assistant. The user is a Korean speaker learning English through daily life journaling. Given their Korean text, suggest 3 natural English sentences they could use. Return JSON only: {"suggestions": ["...", "...", "..."]}. Keep it warm, natural, not textbook-like.\n\nKorean text: ${text}`
    : `You are a friendly English learning assistant. The user wrote an English sentence. Suggest 3 more natural versions. Return JSON only: {"suggestions": ["...", "...", "..."]}. Be encouraging, not corrective in tone.\n\nEnglish text: ${text}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error: ${err}`);
  }

  const data = await resp.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]).suggestions;
}
