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

  const allWords = filtered.flatMap(r =>
    (r.words || []).map(w => ({ word: w, date: r.createdAt, sentence: r.englishText }))
  );
  const uniqueWords = [...new Map(allWords.map(w => [w.word, w])).values()];

  const totalWords = records.reduce((acc, r) => acc + (r.words?.length || 0), 0);
  const days = records.length;
  const hours = Math.floor(days * 3.5);

  return (
    <div className="tab-content px-4 pt-4 pb-24">
      {/* Header + Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#3a3530] font-bold text-lg">나의 기록들</h2>
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
          <div className="grid grid-cols-3 gap-2 mb-6">
            {filtered.map((r, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden relative"
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

      {/* Word Mode */}
      {mode === 'words' && (
        <div className="space-y-3 mb-6">
          {uniqueWords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-[#9a9088] text-sm">아직 단어가 없어요.</p>
              <p className="text-[#c0b8b0] text-xs mt-1">기록을 저장하면 단어들이 쌓여요!</p>
            </div>
          ) : (
            <>
              <p className="text-[#9a9088] text-xs">총 {uniqueWords.length}개의 단어를 배웠어요 🌱</p>
              {uniqueWords.map((w, i) => (
                <div key={i} className="p-3 rounded-2xl"
                  style={{ background: '#ffffff', border: '1px solid #ede9e2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
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
            style={{ background: '#ffffff', border: '1px solid #ede9e2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p className="text-xl">{s.emoji}</p>
            <p className="text-[#3a3530] font-bold text-lg">{s.value}</p>
            <p className="text-[#b0a898] text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>

      {records.length === 0 && mode === 'gallery' && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-[#9a9088] text-sm">아직 기록이 없어요.</p>
          <button onClick={() => onNavigate('record')}
            className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: '#edf5e4', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
            기록 시작하기
          </button>
        </div>
      )}
    </div>
  );
}
