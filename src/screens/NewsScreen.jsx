import { useState, useEffect } from 'react';
import { summarizeNews, getSuggestions, getStoredKey } from '../utils/gemini';
import { saveRecord } from '../utils/storage';

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
  const [writing, setWriting] = useState(null); // index of news being written about
  const [writeText, setWriteText] = useState('');
  const [writeMode, setWriteMode] = useState('korean');
  const [writeSuggestions, setWriteSuggestions] = useState([]);
  const [writeSelected, setWriteSelected] = useState(null);
  const [writeLoading, setWriteLoading] = useState(false);
  const [writeSaved, setWriteSaved] = useState(false);
  const [writeError, setWriteError] = useState('');

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

  const handleStartWriting = (i) => {
    setWriting(i);
    setWriteText('');
    setWriteSuggestions([]);
    setWriteSelected(null);
    setWriteSaved(false);
    setWriteError('');
  };

  const handleWriteSuggest = async () => {
    setWriteError('');
    setWriteLoading(true);
    try {
      const result = await getSuggestions(writeText, writeMode);
      setWriteSuggestions(result);
    } catch (e) {
      setWriteError(e.message);
    } finally {
      setWriteLoading(false);
    }
  };

  const handleWriteSave = () => {
    const n = news[writing];
    const englishText = writeSelected || writeSuggestions[0] || writeText;
    const words = [...(n.words || []), ...englishText.match(/\b[a-zA-Z]{4,}\b/g) || []].slice(0, 6);
    saveRecord({
      mood: 'sunny',
      photoUrl: null,
      koreanText: writeMode === 'korean' ? writeText : '',
      englishText,
      words,
      newsTitle: n.title,
      newsKoTitle: n.koTitle,
    });
    setWriteSaved(true);
  };

  if (writing !== null && !writeSaved) {
    const n = news[writing];
    return (
      <div className="tab-content px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setWriting(null)} className="text-[#6aaa3a] text-sm font-medium">← 뉴스로 돌아가기</button>

        {/* 뉴스 요약 카드 */}
        <div className="p-3 rounded-2xl space-y-1.5"
          style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
          <p className="text-[#9a9088] text-[11px] font-semibold">{n.category}</p>
          <p className="text-[#3a3530] text-sm font-bold leading-tight">{n.koTitle}</p>
          <p className="text-[#9a9088] text-xs leading-tight italic">{n.title}</p>
          <div className="space-y-0.5 pt-1">
            {n.summary.map((s, j) => (
              <p key={j} className="text-[#7a7268] text-xs leading-relaxed">
                <span className="text-[#6aaa3a] mr-1">·</span>{s}
              </p>
            ))}
          </div>
          {n.words?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {n.words.map((w, j) => (
                <button key={j}
                  onClick={() => setWriteText(prev => prev ? prev + ' ' + w : w)}
                  className="px-2 py-0.5 rounded-full text-[11px] transition-all active:scale-95"
                  style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                  {w}
                </button>
              ))}
            </div>
          )}
          <p className="text-[#c0b8b0] text-[10px]">단어 탭하면 입력창에 추가돼요</p>
        </div>

        {/* 모드 토글 */}
        <div className="flex rounded-2xl overflow-hidden"
          style={{ background: '#f0ece4', border: '1px solid #e0dbd2' }}>
          {[{ id: 'korean', label: '한국어로 써요' }, { id: 'english', label: '영어로 써요' }].map(m => (
            <button key={m.id} onClick={() => { setWriteMode(m.id); setWriteSuggestions([]); setWriteSelected(null); }}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: writeMode === m.id ? '#ffffff' : 'transparent',
                color: writeMode === m.id ? '#3a3530' : '#9a9088',
                boxShadow: writeMode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {m.label}
            </button>
          ))}
        </div>

        <textarea
          value={writeText}
          onChange={e => setWriteText(e.target.value)}
          placeholder={writeMode === 'korean'
            ? '이 뉴스를 읽고 어떤 생각이 들었나요? 한국어로 적어보세요...'
            : 'What do you think about this news? Write in English...'}
          className="w-full h-28 p-4 rounded-2xl text-sm resize-none outline-none leading-relaxed"
          style={{ background: '#ffffff', border: '1px solid #e0dbd2', color: '#3a3530' }}
        />

        {writeError && <p className="text-[#c08030] text-xs text-center">{writeError}</p>}

        {writeSuggestions.length > 0 && (
          <div className="space-y-2 slide-up">
            <p className="text-[#9a9088] text-xs font-semibold">이렇게 영어로 표현할 수 있어요!</p>
            {writeSuggestions.map((s, i) => (
              <button key={i} onClick={() => setWriteSelected(s === writeSelected ? null : s)}
                className="w-full text-left p-3 rounded-2xl text-sm transition-all active:scale-95"
                style={{
                  background: writeSelected === s ? '#edf5e4' : '#ffffff',
                  border: writeSelected === s ? '2px solid #6aaa3a' : '1px solid #e0dbd2',
                  color: '#3a3530',
                }}>
                <span className="text-[#6aaa3a] mr-2 font-bold">{i + 1}.</span>{s}
                {writeSelected === s && <span className="ml-2 text-[#6aaa3a]">✓</span>}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleWriteSuggest} disabled={writeText.length < 5 || writeLoading}
            className="py-4 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: writeText.length >= 5 ? '#f0ece4' : '#f8f6f2',
              color: writeText.length >= 5 ? '#7a7268' : '#c0b8b0',
              border: '1px solid #e0dbd2',
            }}>
            {writeLoading ? '⏳' : '✨ AI'}
          </button>
          <button onClick={handleWriteSave} disabled={writeText.length < 2}
            className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: writeText.length >= 2 ? '#c84040' : '#f0ece4',
              color: writeText.length >= 2 ? 'white' : '#c0b8b0',
            }}>
            기록 저장하기 🌿
          </button>
        </div>
      </div>
    );
  }

  if (writeSaved) {
    return (
      <div className="tab-content px-4 pt-12 pb-24 flex flex-col items-center text-center space-y-4">
        <div className="text-5xl">🌿</div>
        <p className="text-[#3a3530] text-xl font-bold">기록 완료!</p>
        <p className="text-[#7a7268] text-sm">뉴스를 읽고 내 생각을 남겼어요</p>
        <button onClick={() => { setWriting(null); setWriteSaved(false); }}
          className="mt-4 w-full py-4 rounded-2xl font-bold text-sm active:scale-95"
          style={{ background: '#edf5e4', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
          뉴스로 돌아가기
        </button>
        <button onClick={() => onNavigate('gallery')}
          className="w-full py-4 rounded-2xl font-bold text-sm active:scale-95"
          style={{ background: '#f8f6f2', color: '#7a7268', border: '1px solid #e0dbd2' }}>
          내 기록 보기
        </button>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#3a3530] font-bold text-lg">오늘의 뉴스</h2>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: '#fff0f0', color: '#e05050', border: '1px solid #f8c0c0' }}>
              🔴 실시간
            </span>
          )}
          <button onClick={fetchNews} className="text-[#6aaa3a] text-xs font-medium">새로고침</button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: '#f0ece4' }} />
          ))}
        </div>
      )}

      {!loading && news.map((n, i) => (
        <div key={i} className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === i ? null : i)}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#edf5e4', color: '#4a8a20' }}>
                {n.category}
              </span>
              {n.needsSummary && (
                <span className="text-[#b0a898] text-xs">번역 중...</span>
              )}
            </div>
            <p className="text-[#3a3530] font-bold text-sm mt-2 leading-tight line-clamp-2">{n.title}</p>
            <p className="text-[#9a9088] text-xs mt-1">{n.koTitle}</p>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 slide-up" style={{ borderTop: '1px solid #f0ece4' }}>
              <div className="space-y-1.5 pt-3">
                {n.summary.map((s, j) => (
                  <p key={j} className="text-[#5a5550] text-sm leading-relaxed">
                    <span className="text-[#6aaa3a] mr-1">·</span>{s}
                  </p>
                ))}
              </div>
              {n.words.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {n.words.map((w, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                      {w}
                    </span>
                  ))}
                </div>
              )}
              <button onClick={() => handleStartWriting(i)}
                className="w-full py-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: '#edf5e4', border: '1px solid #c8e8a0', color: '#4a8a20' }}>
                이 뉴스로 내 생각 써보기 ✏️
              </button>
            </div>
          )}
        </div>
      ))}

      {!isLive && !loading && (
        <p className="text-center text-[#c0b8b0] text-xs pt-2">
          실시간 뉴스는 Vercel 환경변수에 NEWSAPI_KEY 설정 후 이용 가능해요
        </p>
      )}
    </div>
  );
}
