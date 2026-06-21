// 관심사별 RSS 피드 매핑
const INTEREST_FEEDS = {
  nature: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/science.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
  ],
  animal: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/science.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
  ],
  food: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_travel.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
  ],
  travel: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_travel.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/travel.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
  ],
  daily: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/lifestyle.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
  ],
  culture: [
    { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition_entertainment.rss' },
    { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/entertainment.xml' },
    { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/culture' },
  ],
};

const DEFAULT_FEEDS = [
  { name: 'CNN', emoji: '🔴', url: 'http://rss.cnn.com/rss/edition.rss' },
  { name: 'FOX News', emoji: '🦊', url: 'https://moxie.foxnews.com/google-publisher/latest.xml' },
  { name: 'The New Yorker', emoji: '🗽', url: 'https://www.newyorker.com/feed/everything' },
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

function selectFeeds(interests) {
  if (!interests || interests.length === 0) return DEFAULT_FEEDS;

  // 관심사가 여러 개면 각각에서 피드 선택 후 중복 제거
  const seen = new Set();
  const feeds = [];

  for (const interest of interests) {
    const interestFeeds = INTEREST_FEEDS[interest] || DEFAULT_FEEDS;
    for (const feed of interestFeeds) {
      const key = feed.url;
      if (!seen.has(key)) {
        seen.add(key);
        feeds.push(feed);
      }
    }
  }

  return feeds.length > 0 ? feeds : DEFAULT_FEEDS;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const interests = req.query.interests
    ? req.query.interests.split(',').filter(Boolean)
    : [];

  const feeds = selectFeeds(interests);

  try {
    const results = await Promise.allSettled(
      feeds.map(source =>
        fetch(source.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)' },
          signal: AbortSignal.timeout(6000),
        })
          .then(r => r.text())
          .then(xml => parseRSS(xml, source))
      )
    );

    const articles = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    res.status(200).json({ articles, interests });
  } catch (e) {
    res.status(200).json({ articles: [] });
  }
}
