const RSS_SOURCES = [
  {
    name: 'CNN',
    emoji: '🔴',
    url: 'https://rss.cnn.com/rss/edition.rss',
  },
  {
    name: 'FOX News',
    emoji: '🦊',
    url: 'https://moxie.foxnews.com/google-publisher/latest.xml',
  },
  {
    name: 'The New Yorker',
    emoji: '🗽',
    url: 'https://www.newyorker.com/feed/everything',
  },
];

function parseRSS(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 2) {
    const item = match[1];

    const title = decode(extract(item, 'title'));
    const description = decode(strip(extract(item, 'description') || extract(item, 'content:encoded') || ''));
    const url = extract(item, 'link') || extract(item, 'guid');
    const publishedAt = extract(item, 'pubDate');

    if (title) {
      items.push({
        title,
        description: description.slice(0, 300),
        url,
        source: source.name,
        sourceEmoji: source.emoji,
        publishedAt,
      });
    }
  }

  return items;
}

function extract(str, tag) {
  const cdataMatch = str.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
  if (cdataMatch) return cdataMatch[1].trim();
  const match = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

function strip(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const results = await Promise.allSettled(
      RSS_SOURCES.map(source =>
        fetch(source.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)' },
          signal: AbortSignal.timeout(6000),
        })
          .then(r => r.text())
          .then(xml => parseRSS(xml, source))
      )
    );

    const articles = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

    res.status(200).json({ articles });
  } catch (e) {
    res.status(200).json({ articles: [] });
  }
}
