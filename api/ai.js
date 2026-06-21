const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];

async function callModel(model, apiKey, contents, maxOutputTokens) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens, temperature: 0.7, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );
  return resp;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SLOW_LEARNER_API || process.env.VITE_SLOW_LEARNER_API || process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { contents, maxOutputTokens = 2048 } = req.body;
  if (!contents) return res.status(400).json({ error: 'Missing contents' });

  let lastError = '';

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const resp = await callModel(model, apiKey, contents, maxOutputTokens);

        if (resp.status === 503) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
          continue; // retry same model once, then fall through to next model
        }

        if (!resp.ok) {
          lastError = await resp.text();
          break; // non-503 error on this model → try next model
        }

        const data = await resp.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const text = [...parts].reverse().find(p => p.text)?.text;
        if (!text) { lastError = '빈 응답'; break; }

        return res.status(200).json({ text, model });
      } catch (e) {
        lastError = e.message;
        break;
      }
    }
  }

  return res.status(503).json({ error: '잠시 후 다시 시도해주세요. (AI 서버 혼잡)' });
}
