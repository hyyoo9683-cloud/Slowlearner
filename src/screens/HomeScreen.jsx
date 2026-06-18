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
      <div className="px-4 -mt-2 relative z-10">
        <div className="flex gap-2 justify-center">
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className="flex flex-col items-center px-3 py-2 rounded-2xl text-xs font-medium transition-all"
              style={{
                background: mood === m.id ? '#2a5a0a' : 'rgba(42,80,16,0.4)',
                border: mood === m.id ? '2px solid #7dc84a' : '2px solid transparent',
                color: mood === m.id ? '#c5f07a' : '#6aaa30',
              }}
            >
              <span className="text-lg">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="mx-3 mt-4 rounded-3xl p-4 space-y-5"
        style={{ background: 'rgba(10,24,4,0.85)', border: '1px solid #2a5010' }}>

        {/* Greeting */}
        <div>
          <p className="text-[#c5f07a] font-semibold text-base">안녕하세요 👋</p>
          <p className="text-[#6aaa30] text-sm">오늘 어떤 순간이 있었나요?</p>
        </div>

        {/* Record Button */}
        <button
          onClick={() => onNavigate('record')}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'rgba(42,90,16,0.6)', border: '1px solid #3a7a18', color: '#c5f07a' }}
        >
          <span>📷</span> 오늘의 순간 기록하기
        </button>

        {/* News Preview */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[#8ab84a] text-xs font-semibold uppercase tracking-wider">오늘의 뉴스</p>
            <button onClick={() => onNavigate('news')} className="text-[#4a8a20] text-xs">더 보기 →</button>
          </div>
          <div className="space-y-2">
            {sampleNews.map((n, i) => (
              <button key={i} onClick={() => onNavigate('news')}
                className="w-full text-left p-3 rounded-2xl transition-all active:scale-95"
                style={{ background: 'rgba(30,60,10,0.8)', border: '1px solid #2a5010' }}>
                <p className="text-[#c5f07a] text-sm font-semibold leading-tight">{n.title}</p>
                <p className="text-[#6aaa30] text-xs mt-0.5">{n.ko} · 3줄 요약 보기</p>
              </button>
            ))}
          </div>
        </div>

        {/* Book Preview */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[#8ab84a] text-xs font-semibold uppercase tracking-wider">지금 읽으면 좋은 책</p>
            <button onClick={() => onNavigate('books')} className="text-[#4a8a20] text-xs">더 보기 →</button>
          </div>
          <button onClick={() => onNavigate('books')}
            className="w-full text-left p-3 rounded-2xl flex items-center gap-3 active:scale-95"
            style={{ background: 'rgba(30,60,10,0.8)', border: '1px solid #2a5010' }}>
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-[#c5f07a] text-sm font-semibold">Braiding Sweetgrass</p>
              <p className="text-[#6aaa30] text-xs">자연 관심사 맞춤 · 도전 추천</p>
            </div>
          </button>
        </div>

        {/* My Records Strip */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[#8ab84a] text-xs font-semibold uppercase tracking-wider">내 기록들</p>
            <button onClick={() => onNavigate('gallery')} className="text-[#4a8a20] text-xs">모두 보기 →</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recent.length === 0 ? (
              <div className="w-full text-center py-3">
                <p className="text-[#4a7a20] text-xs">아직 기록이 없어요. 첫 기록을 남겨봐요!</p>
              </div>
            ) : (
              recent.map((r, i) => (
                <div key={i} onClick={() => onNavigate('gallery')}
                  className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden cursor-pointer"
                  style={{ background: 'rgba(42,80,16,0.6)', border: '1px solid #3a6a14' }}>
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
            <p className="text-[#4a7a20] text-xs mt-2">
              이번 주 {records.length}일 · "{recent[recent.length - 1]?.englishText?.slice(0, 30)}..."
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
