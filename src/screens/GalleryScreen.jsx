import { useState } from 'react';
import { loadRecords } from '../utils/storage';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'week', label: '이번 주' },
  { id: 'month', label: '이번 달' },
];

const TODAY = new Date().toISOString();

const SAMPLE_WORDS = [
  { word: 'came across', date: TODAY, sentence: 'I came across a lovely café on my way home.' },
  { word: 'moss-covered', date: TODAY, sentence: 'The moss-covered stones looked beautiful after the rain.' },
  { word: 'wander', date: TODAY, sentence: 'I love to wander through the forest in the morning.' },
];

function SampleRecordCard({ onNavigate }) {
  return (
    <div className="mb-6">
      <p className="text-[#c0b8b0] text-xs text-center mb-3">(예시 기록 — 기록을 추가하면 여기 나타나요)</p>
      <div
        className="rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: '#faf8f3', border: '1.5px dashed #d0c8b8', opacity: 0.85 }}
        onClick={() => onNavigate('record')}
      >
        <div style={{ background: '#c8ddb0', height: 120 }}>
          <svg viewBox="0 0 300 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="120" fill="#c8ddb0" />
            <rect y="80" width="300" height="40" fill="#8aaa60" />
            <rect x="40" y="50" width="220" height="36" rx="2" fill="#a09080" />
            {[0,1,2].map(row =>
              [0,1,2,3,4].map(col => (
                <rect
                  key={`${row}-${col}`}
                  x={42 + col * 44 + (row % 2 === 1 ? 22 : 0)}
                  y={52 + row * 11}
                  width={40}
                  height={9}
                  rx={1}
                  fill={row % 2 === 0 ? '#b8a898' : '#a89888'}
                  opacity={0.9}
                />
              ))
            )}
            <ellipse cx="80" cy="60" rx="14" ry="6" fill="#6aaa3a" opacity="0.7" />
            <ellipse cx="140" cy="68" rx="18" ry="7" fill="#5a9a2a" opacity="0.65" />
            <ellipse cx="200" cy="58" rx="12" ry="5" fill="#7aba4a" opacity="0.7" />
            <ellipse cx="240" cy="65" rx="10" ry="5" fill="#6aaa3a" opacity="0.6" />
            <rect x="22" y="20" width="6" height="36" fill="#7a5a30" />
            <polygon points="25,5 12,40 38,40" fill="#4a8a20" />
            <rect x="268" y="24" width="6" height="32" fill="#7a5a30" />
            <polygon points="271,10 258,42 284,42" fill="#4a8a20" />
          </svg>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-[#c0b8b0] text-[10px] font-medium">예시 기록 (둘러보기)</p>
          <p className="text-[#7a7268] text-sm leading-relaxed">산책 중 이끼 낀 돌담을 우연히 발견했어요.</p>
          <p className="text-[#5a5550] text-sm font-medium leading-relaxed italic">
            "I came across a moss-covered stone wall."
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['moss-covered', 'came across', 'stone wall'].map((w, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: '#edf5e4', color: '#7aaa50', border: '1px solid #c8e8a0' }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryScreen({ onNavigate }) {
  const records = loadRecords();
  const [mode, setMode] = useState('gallery');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const now = new Date();
  const filtered = records.filter(r => {
    if (filter === 'all') return true;
    const d = new Date(r.createdAt);
    if (filter === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const allWords = filtered.flatMap(r =>
    (r.words || []).map(w => ({ word: w, date: r.createdAt, sentence: r.englishText }))
  );
  const uniqueWords = [...new Map(allWords.map(w => [w.word, w])).values()];

  const totalWords = records.reduce((acc, r) => acc + (r.words?.length || 0), 0);
  const days = records.length;
  const hours = Math.floor(days * 3.5);

  if (detail) {
    return (
      <div className="tab-content px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setDetail(null)} className="text-[#6aaa3a] text-sm font-medium">← 돌아가기</button>
        {detail.photoUrl && (
          <img src={detail.photoUrl} alt="" className="w-full rounded-2xl object-cover max-h-64" />
        )}
        <div className="p-4 rounded-2xl space-y-2"
          style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <p className="text-[#b0a898] text-xs">
            {new Date(detail.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {detail.koreanText && (
            <p className="text-[#7a7268] text-sm leading-relaxed">{detail.koreanText}</p>
          )}
          {detail.englishText && (
            <p className="text-[#3a3530] text-base font-medium leading-relaxed">{detail.englishText}</p>
          )}
        </div>
        {detail.words?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {detail.words.map((w, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24">
      {/* Header + Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">나의 기록들</h2>
        <div className="flex rounded-2xl overflow-hidden"
          style={{ background: '#f0ece4', border: '1px solid #e0dbd2' }}>
          {[
            { id: 'gallery', label: '📷 갤러리' },
            { id: 'words', label: '📝 단어장' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: mode === m.id ? '#ffffff' : 'transparent',
                color: mode === m.id ? '#3a3530' : '#9a9088',
                boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === f.id ? '#edf5e4' : '#ffffff',
              border: filter === f.id ? '1.5px solid #6aaa3a' : '1px solid #e0dbd2',
              color: filter === f.id ? '#4a8a20' : '#9a9088',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery Mode */}
      {mode === 'gallery' && (
        <>
          {records.length === 0 ? (
            <SampleRecordCard onNavigate={onNavigate} />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {filtered.map((r, i) => (
                  <div key={i} onClick={() => setDetail(r)}
                    className="aspect-square rounded-2xl overflow-hidden relative cursor-pointer active:scale-95 transition-all"
                    style={{ background: '#edf5e4', border: '1px solid #d0e8b0' }}>
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <span className="text-2xl">🌿</span>
                        <p className="text-[#7a9860] text-[9px] text-center mt-1 leading-tight line-clamp-3">
                          {r.englishText?.slice(0, 30)}
                        </p>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-8"
                      style={{ background: 'linear-gradient(transparent, rgba(255,255,255,0.85))' }}>
                      <p className="text-[#8a8078] text-[9px] px-1.5 pb-1 absolute bottom-0">
                        {new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
                <button onClick={() => onNavigate('record')}
                  className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                  style={{ background: '#faf8f4', border: '2px dashed #d8d4cc' }}>
                  <span className="text-2xl text-[#b0a898]">+</span>
                  <span className="text-[#b0a898] text-[10px]">추가</span>
                </button>
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#c0b8b0] text-sm">이 기간에 기록이 없어요</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Word Mode */}
      {mode === 'words' && (
        <div className="space-y-3 mb-6">
          <p className="text-[#9a9088] text-xs">기록할 때 배운 단어들이 여기 모여요</p>
          {uniqueWords.length === 0 ? (
            <>
              <p className="text-[#c0b8b0] text-xs">(예시 단어 — 기록을 저장하면 실제 단어들이 쌓여요!)</p>
              {SAMPLE_WORDS.map((w, i) => (
                <div key={i} className="p-3 rounded-2xl"
                  style={{ background: '#faf8f3', border: '1.5px dashed #d0c8b8', opacity: 0.9 }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#3a3530] font-semibold text-sm">{w.word}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: '#f0ece4', color: '#b0a898' }}>(예시)</span>
                    </div>
                    <span className="text-[#c0b8b0] text-[10px]">
                      {new Date(w.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {w.sentence && (
                    <p className="text-[#9a9088] text-xs leading-relaxed line-clamp-2">{w.sentence}</p>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <p className="text-[#9a9088] text-xs">총 {uniqueWords.length}개의 단어를 배웠어요 🌱</p>
              {uniqueWords.map((w, i) => (
                <div key={i} className="p-3 rounded-2xl"
                  style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#3a3530] font-semibold text-sm">{w.word}</span>
                    <span className="text-[#c0b8b0] text-[10px]">
                      {new Date(w.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {w.sentence && (
                    <p className="text-[#9a9088] text-xs leading-relaxed line-clamp-2">{w.sentence}</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '총 기록', value: `${days}개`, emoji: '📝' },
          { label: '배운 단어', value: `${totalWords}개`, emoji: '💬' },
          { label: '함께한 시간', value: `${hours}분`, emoji: '⏱️' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-2xl text-center"
            style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p className="text-xl">{s.emoji}</p>
            <p className="text-[#3a3530] font-bold text-lg">{s.value}</p>
            <p className="text-[#b0a898] text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
