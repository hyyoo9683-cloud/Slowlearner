export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    // Return fallback static news when no key configured
    return res.status(200).json({ articles: [] });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=3&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({ articles: [] });
    }

    const articles = (data.articles || []).slice(0, 3).map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }));

    res.status(200).json({ articles });
  } catch (e) {
    res.status(200).json({ articles: [] });
  }
}
