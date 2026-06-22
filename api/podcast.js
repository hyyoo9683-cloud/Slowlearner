export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { rssUrl, podcastTitle } = req.body;
  if (!rssUrl) return res.status(400).json({ error: 'Missing rssUrl' });

  const apiKey = process.env.SLOW_LEARNER_API || process.env.VITE_SLOW_LEARNER_API;

  try {
    const rssResp = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Sandalog/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!rssResp.ok) throw new Error('RSS fetch failed: ' + rssResp.status);
    const rssText = await rssResp.text();

    const itemMatch = rssText.match(/<item[\s>][\s\S]*?<\/item>/);
    if (!itemMatch) return res.status(404).json({ error: 'No episodes found' });
    const item = itemMatch[0];

    const titleMatch = item.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                       item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const episodeTitle = (titleMatch?.[1] || '').trim()
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '');

    const descMatch = item.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                      item.match(/<description[^>]*>([\s\S]*?)<\/description>/);
    const descText = (descMatch?.[1] || '')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000);

    // Try podcast:transcript tag
    const transcriptMatch = item.match(/<podcast:transcript[^>]+url=["']([^"']+)["']/i);
    let transcriptText = '';
    if (transcriptMatch?.[1]) {
      try {
        const tResp = await fetch(transcriptMatch[1], { signal: AbortSignal.timeout(6000) });
        if (tResp.ok) {
          const raw = await tResp.text();
          transcriptText = raw
            .replace(/WEBVTT[\s\S]*?\n\n/, '')
            .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}/g, '')
            .replace(/^\d+\s*$/gm, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 3000);
        }
      } catch {}
    }

    const content = transcriptText || descText;
    if (!content || !apiKey) {
      return res.json({ episodeTitle, summary: null, keyExpressions: [], hasTranscript: !!transcriptText });
    }

    const prompt = `다음은 영어 팟캐스트 에피소드 내용이에요.

팟캐스트: ${podcastTitle || ''}
에피소드: ${episodeTitle}

내용:
${content}

다음 JSON 형식으로 응답해주세요:
{
  "summary": "3-4문장 한국어 요약. 어떤 내용인지 알기 쉽게 설명해주세요.",
  "keyExpressions": [
    { "english": "표현", "korean": "한국어 의미" },
    { "english": "표현", "korean": "한국어 의미" },
    { "english": "표현", "korean": "한국어 의미" }
  ],
  "level": "easy 또는 medium 또는 hard"
}`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.5, responseMimeType: 'application/json' },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!geminiResp.ok) throw new Error('Gemini error: ' + geminiResp.status);

    const geminiData = await geminiResp.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || '{}';
    let analysis;
    try { analysis = JSON.parse(rawText); } catch { analysis = { summary: null, keyExpressions: [] }; }

    return res.json({
      episodeTitle,
      summary: analysis.summary || null,
      keyExpressions: analysis.keyExpressions || [],
      level: analysis.level || 'medium',
      hasTranscript: !!transcriptText,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
