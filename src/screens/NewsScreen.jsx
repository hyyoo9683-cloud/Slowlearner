import { useState, useEffect } from 'react';
import { summarizeNews, getStoredKey } from '../utils/gemini';

const FALLBACK_NEWS = [
  {
    category: '🌍 세계',
    title: 'Arctic Ice Reaches Record Low for Third Year Running',
    koTitle: '북극 빙하, 3년 연속 최저 기록',
    summary: [
      '북극 해빙 면적이 올해도 역대 최소 수준을 기록했어요.',
      '과학자들은 이 추세가 기후 변화의 직접적인 영향이라고 보고 있어요.',
      '전 세계 해수면 상승 속도에도 영향을 줄 것으로 예상돼요.',
    ],
    words: ['record low', 'arctic ice', 'climate change', 'sea level'],
  },
  {
    category: '💡 기술',
    title: 'New AI Tools Help Small Farmers Boost Crop Yields',
    koTitle: 'AI 농업 도구가 소농의 수확량을 늘린다',
    summary: [
      '스타트업들이 저비용 AI 도구를 농부들에게 제공하고 있어요.',
      '날씨 예측과 병충해 감지를 AI로 자동화해 수확량을 올려요.',
      '특히 개발도상국 농부들에게 큰 혜택이 돌아가고 있어요.',
    ],
    words: ['crop yield', 'precision farming', 'affordable', 'harvest'],
  },
  {
    category: '🎨 문화',
    title: 'Urban Gardens Are Transforming City Mental Health',
    koTitle: '도시 텃밭이 도시인의 정신 건강을 바꾼다',
    summary: [
      '도시 곳곳에 생겨나는 텃밭이 스트레스 해소에 도움이 된다는 연구가 나왔어요.',
      '흙을 만지고 식물을 기르는 행위 자체가 치유 효과가 있다고 해요.',
      '외로움을 느끼는 도시인들을 연결하는 커뮤니티 역할도 한대요.',
    ],
    words: ['urban garden', 'mental health', 'stress relief', 'community'],
  },
];

const CATEGORY_EMOJI = {
  '세계': '🌍', '기술': '💡', '환경': '🌱', '경제': '📈', '문화': '🎨',
};

export default function NewsScreen({ onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/news');
      if (!resp.ok) throw new Error('fetch failed');
      const data = await resp.json();

      if (data.articles && data.articles.length > 0) {
        setIsLive(true);
        // Show raw articles first, then summarize with AI
        const rawNews = data.articles.map(a => ({
          category: '🌍 뉴스',
          title: a.title?.replace(/ - .*$/, '') || '',
          koTitle: '번역 중...',
          summary: [a.description || '내용 없음'],
          words: [],
          raw: a,
          needsSummary: true,
        }));
        setNews(rawNews);
        // Summarize with AI if key available
        const hasKey = getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY;
        if (hasKey) {
          summarizeAll(rawNews, data.articles);
        }
      }
    } catch {
      // Use fallback
    } finally {
      setLoading(false);
    }
  };

  const summarizeAll = async (rawNews, articles) => {
    setSummarizing(true);
    const updated = [...rawNews];
    for (let i = 0; i < articles.length; i++) {
      try {
        const a = articles[i];
        const result = await summarizeNews(a.title, a.description);
        const emoji = CATEGORY_EMOJI[result.category] || '🌍';
        updated[i] = {
          ...updated[i],
          category: `${emoji} ${result.category}`,
          koTitle: result.koTitle,
          summary: result.summary,
          words: result.words,
          needsSummary: false,
        };
        setNews([...updated]);
      } catch {
        updated[i] = { ...updated[i], needsSummary: false };
        setNews([...updated]);
      }
    }
    setSummarizing(false);
  };

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#c5f07a] font-bold text-lg">오늘의 뉴스</h2>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(42,90,16,0.6)', color: '#7dc84a', border: '1px solid #3a7a18' }}>
              🔴 실시간
            </span>
          )}
          <button onClick={fetchNews} className="text-[#4a7a20] text-xs">새로고침</button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: 'rgba(20,50,8,0.6)' }} />
          ))}
        </div>
      )}

      {!loading && news.map((n, i) => (
        <div key={i} className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,24,4,0.85)', border: '1px solid #2a5010' }}>
          <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(42,80,16,0.6)', color: '#c5f07a' }}>
                {n.category}
              </span>
              {n.needsSummary && (
                <span className="text-[#4a7a20] text-xs">번역 중...</span>
              )}
            </div>
            <p className="text-[#c5f07a] font-bold text-sm mt-2 leading-tight line-clamp-2">{n.title}</p>
            <p className="text-[#6aaa30] text-xs mt-1">{n.koTitle}</p>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 slide-up">
              <div className="space-y-1.5">
                {n.summary.map((s, j) => (
                  <p key={j} className="text-[#a0c870] text-sm leading-relaxed">
                    <span className="text-[#4a8a20] mr-1">·</span>{s}
                  </p>
                ))}
              </div>
              {n.words.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {n.words.map((w, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(42,90,16,0.6)', color: '#c5f07a', border: '1px solid #3a7a18' }}>
                      {w}
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => onNavigate('record')}
                className="w-full py-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(42,90,16,0.5)', border: '1px solid #3a7a18', color: '#c5f07a' }}>
                이 뉴스로 한 줄 써보기 ✏️
              </button>
            </div>
          )}
        </div>
      ))}

      {!isLive && !loading && (
        <p className="text-center text-[#3a5a18] text-xs pt-2">
          실시간 뉴스는 Vercel 환경변수에 NEWSAPI_KEY 설정 후 이용 가능해요
        </p>
      )}
    </div>
  );
}
