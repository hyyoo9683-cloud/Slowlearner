import { useState } from 'react';
import ForestBackground from '../components/ForestBackground';
import RedHoodCharacter from '../components/RedHoodCharacter';
import { loadRecords } from '../utils/storage';

const moods = [
  { id: 'sunny', label: '맑음', emoji: '☀️' },
  { id: 'rain', label: '비', emoji: '🌧️' },
  { id: 'fog', label: '안개', emoji: '🌫️' },
  { id: 'sunset', label: '노을', emoji: '🌇' },
];

const sampleNews = [
  { title: 'Arctic Ice Reaches Record Low', ko: '북극 빙하 3년 연속 최저', category: '세계' },
  { title: 'New AI Tools Help Small Farmers', ko: 'AI가 소농을 돕는다', category: '기술' },
];

export default function HomeScreen({ onNavigate }) {
  const [mood, setMood] = useState('sunny');
  const records = loadRecords();
  const recent = records.slice(-5);

  return (
    <div className="tab-content pb-24">
      {/* Forest + Character */}
      <div className="relative">
        <ForestBackground mood={mood} />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 float-anim">
          <RedHoodCharacter size={90} />
        </div>
      </div>

      {/* Mood selector */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="flex gap-2 justify-center">
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className="flex flex-col items-center px-3 py-2 rounded-2xl text-xs font-medium transition-all"
              style={{
                background: mood === m.id ? '#edf5e4' : '#ffffff',
                border: mood === m.id ? '2px solid #6aaa3a' : '2px solid #e8e4dc',
                color: mood === m.id ? '#4a8a20' : '#9a9088',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content cards */}
      <div className="px-4 mt-4 space-y-4">

        {/* Greeting + Record Button */}
        <div className="p-4 rounded-3xl space-y-3"
          style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0ece4' }}>
          <div>
            <p className="text-[#3a3530] font-semibold text-base">안녕하세요 👋</p>
            <p className="text-[#9a9088] text-sm">오늘 어떤 순간이 있었나요?</p>
          </div>
          <button
            onClick={() => onNavigate('record')}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95"
            style={{ background: '#edf5e4', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}
          >
            <span>📷</span> 오늘의 순간 기록하기
          </button>
        </div>

        {/* News Preview */}
        <div className="p-4 rounded-3xl space-y-3"
          style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0ece4' }}>
          <div className="flex justify-between items-center">
            <p className="text-[#3a3530] text-sm font-bold">오늘의 뉴스</p>
            <button onClick={() => onNavigate('news')} className="text-[#6aaa3a] text-xs font-medium">더 보기 →</button>
          </div>
          <div className="space-y-2">
            {sampleNews.map((n, i) => (
              <button key={i} onClick={() => onNavigate('news')}
                className="w-full text-left p-3 rounded-2xl transition-all active:scale-95"
                style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
                <p className="text-[#3a3530] text-sm font-semibold leading-tight">{n.title}</p>
                <p className="text-[#9a9088] text-xs mt-0.5">{n.ko} · 3줄 요약 보기</p>
              </button>
            ))}
          </div>
        </div>

        {/* Book Preview */}
        <div className="p-4 rounded-3xl"
          style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0ece4' }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#3a3530] text-sm font-bold">지금 읽으면 좋은 책</p>
            <button onClick={() => onNavigate('books')} className="text-[#6aaa3a] text-xs font-medium">더 보기 →</button>
          </div>
          <button onClick={() => onNavigate('books')}
            className="w-full text-left p-3 rounded-2xl flex items-center gap-3 active:scale-95"
            style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-[#3a3530] text-sm font-semibold">Braiding Sweetgrass</p>
              <p className="text-[#9a9088] text-xs">자연 관심사 맞춤 · 도전 추천</p>
            </div>
          </button>
        </div>

        {/* My Records Strip */}
        <div className="p-4 rounded-3xl"
          style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0ece4' }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#3a3530] text-sm font-bold">내 기록들</p>
            <button onClick={() => onNavigate('gallery')} className="text-[#6aaa3a] text-xs font-medium">모두 보기 →</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.length === 0 ? (
              <div className="w-full text-center py-3">
                <p className="text-[#c0b8b0] text-xs">아직 기록이 없어요. 첫 기록을 남겨봐요!</p>
              </div>
            ) : (
              recent.map((r, i) => (
                <div key={i} onClick={() => onNavigate('gallery')}
                  className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: '#edf5e4', border: '1px solid #c8e8a0' }}>
                  {r.photoUrl ? (
                    <img src={r.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                  )}
                </div>
              ))
            )}
          </div>
          {recent.length > 0 && (
            <p className="text-[#b0a898] text-xs mt-2">
              이번 주 {records.length}일 · "{recent[recent.length - 1]?.englishText?.slice(0, 30)}..."
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
