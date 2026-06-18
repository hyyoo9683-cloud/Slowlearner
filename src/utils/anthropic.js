const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';

export async function getSuggestions(text, mode) {
  const systemPrompt = mode === 'korean'
    ? 'You are a friendly English learning assistant. The user is a Korean speaker learning English through daily life journaling. Given their Korean text, suggest 3 natural English sentences they could use. Return JSON only: {"suggestions": ["...", "...", "..."]}. Keep it warm, natural, not textbook-like.'
    : 'You are a friendly English learning assistant. The user wrote an English sentence. Suggest 3 more natural versions. Return JSON only: {"suggestions": ["...", "...", "..."]}. Be encouraging, not corrective in tone.';

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error: ${err}`);
  }

  const data = await resp.json();
  const raw = data.content[0].text;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format');
  return JSON.parse(match[0]).suggestions;
}
