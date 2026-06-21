const MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.SLOW_LEARNER_API || process.env.VITE_SLOW_LEARNER_API || process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { contents, maxOutputTokens = 1024 } = req.body;
  if (!contents) return res.status(400).json({ error: 'Missing contents' });

  for (let i = 0; i < 3; i++) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens,
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );

      if (resp.status === 503 && i < 2) {
        await new Promise(r => setTimeout(r, (i + 1) * 1500));
        continue;
      }

      if (!resp.ok) {
        const err = await resp.text();
        return res.status(resp.status).json({ error: err });
      }

      const data = await resp.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = [...parts].reverse().find(p => p.text)?.text;
      if (!text) return res.status(500).json({ error: '빈 응답' });

      return res.status(200).json({ text });
    } catch (e) {
      if (i === 2) return res.status(500).json({ error: e.message });
      await new Promise(r => setTimeout(r, (i + 1) * 1500));
    }
  }
}
