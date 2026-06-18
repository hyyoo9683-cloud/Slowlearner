import { useState } from 'react';
import { loadRecords } from '../utils/storage';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'week', label: '이번 주' },
  { id: 'month', label: '이번 달' },
];

export default function GalleryScreen({ onNavigate }) {
  const records = loadRecords();
  const [mode, setMode] = useState('gallery'); // 'gallery' | 'words'
  const [filter, setFilter] = useState('all');

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

  // Collect all words with dates
  const allWords = filtered.flatMap(r =>
    (r.words || []).map(w => ({ word: w, date: r.createdAt, sentence: r.englishText }))
  );
  const uniqueWords = [...new Map(allWords.map(w => [w.word, w])).values()];

  const totalWords = records.reduce((acc, r) => acc + (r.words?.length || 0), 0);
  const days = records.length;
  const hours = Math.floor(days * 3.5);

  return (
    <div className="tab-content px-4 pt-4 pb-24">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#c5f07a] font-bold text-lg">나의 기록들</h2>
        <div className="flex rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010' }}>
          {[
            { id: 'gallery', label: '📷 갤러리' },
            { id: 'words', label: '📝 단어장' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: mode === m.id ? '#2a5a0a' : 'transparent',
                color: mode === m.id ? '#c5f07a' : '#4a7a20',
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
              background: filter === f.id ? '#2a5a0a' : 'rgba(10,24,4,0.5)',
              border: filter === f.id ? '1px solid #7dc84a' : '1px solid #2a5010',
              color: filter === f.id ? '#c5f07a' : '#4a7a20',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery Mode */}
      {mode === 'gallery' && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {filtered.map((r, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden relative"
                style={{ background: 'rgba(20,50,8,0.8)', border: '1px solid #2a5010' }}>
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <span className="text-2xl">🌿</span>
                    <p className="text-[#4a7a20] text-[9px] text-center mt-1 leading-tight line-clamp-3">
                      {r.englishText?.slice(0, 30)}
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-8"
                  style={{ background: 'linear-gradient(transparent, rgba(10,24,4,0.8))' }}>
                  <p className="text-[#6aaa30] text-[9px] px-1.5 pb-1 absolute bottom-0">
                    {new Date(r.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
            <button onClick={() => onNavigate('record')}
              className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
              style={{ background: 'rgba(20,50,8,0.5)', border: '2px dashed #2a5010' }}>
              <span className="text-2xl text-[#3a7a14]">+</span>
              <span className="text-[#3a6a12] text-[10px]">추가</span>
            </button>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[#3a5a18] text-sm">이 기간에 기록이 없어요</p>
            </div>
          )}
        </>
      )}

      {/* Word Mode */}
      {mode === 'words' && (
        <div className="space-y-3 mb-6">
          {uniqueWords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-[#6aaa30] text-sm">아직 단어가 없어요.</p>
              <p className="text-[#3a5a18] text-xs mt-1">기록을 저장하면 단어들이 쌓여요!</p>
            </div>
          ) : (
            <>
              <p className="text-[#4a7a20] text-xs">총 {uniqueWords.length}개의 단어를 배웠어요 🌱</p>
              {uniqueWords.map((w, i) => (
                <div key={i} className="p-3 rounded-2xl"
                  style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#c5f07a] font-semibold text-sm">{w.word}</span>
                    <span className="text-[#3a5a18] text-[10px]">
                      {new Date(w.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {w.sentence && (
                    <p className="text-[#4a7a20] text-xs leading-relaxed line-clamp-2">{w.sentence}</p>
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
            style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010' }}>
            <p className="text-xl">{s.emoji}</p>
            <p className="text-[#c5f07a] font-bold text-lg">{s.value}</p>
            <p className="text-[#4a7a20] text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>

      {records.length === 0 && mode === 'gallery' && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-[#6aaa30] text-sm">아직 기록이 없어요.</p>
          <button onClick={() => onNavigate('record')}
            className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: '#2a5a0a', color: '#c5f07a' }}>
            기록 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
