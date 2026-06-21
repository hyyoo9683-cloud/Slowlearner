const tabs = [
  { id: 'home', label: '홈', icon: '🏡' },
  { id: 'record', label: '기록', icon: '✏️' },
  { id: 'news', label: '뉴스', icon: '📰' },
  { id: 'gallery', label: '갤러리', icon: '🖼️' },
  { id: 'books', label: '책', icon: '📚' },
];

export default function BottomNav({ active, onSelect }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50">
      {/* Cloud-shaped top edge */}
      <svg viewBox="0 0 390 28" className="w-full block" style={{ marginBottom: -1 }}>
        <path
          d="M0,28 L0,20 Q15,6 35,14 Q55,22 75,12 Q95,2 115,10 Q135,18 155,8 Q175,0 195,8 Q215,16 235,8 Q255,0 275,10 Q295,20 315,12 Q335,4 355,14 Q375,22 390,18 L390,28 Z"
          fill="#ffffff"
        />
      </svg>
      <div className="flex" style={{ background: '#ffffff' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
            style={{ color: active === t.id ? '#5a9a2a' : '#b0a898' }}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
            {active === t.id && (
              <span className="w-4 h-0.5 rounded-full bg-[#5a9a2a]" />
            )}
          </button>
        ))}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)', background: '#ffffff' }} />
    </nav>
  );
}
