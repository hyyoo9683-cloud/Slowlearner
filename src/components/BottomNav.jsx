const tabs = [
  { id: 'home', label: '홈', icon: '🏡' },
  { id: 'record', label: '기록', icon: '✏️' },
  { id: 'news', label: '뉴스', icon: '📰' },
  { id: 'gallery', label: '갤러리', icon: '🖼️' },
  { id: 'books', label: '책', icon: '📚' },
  { id: 'settings', label: '설정', icon: '⚙️' },
];

export default function BottomNav({ active, onSelect }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50"
      style={{ background: 'rgba(15,32,6,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #2a5010' }}>
      <div className="flex">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
            style={{ color: active === t.id ? '#7dc84a' : '#4a7a20' }}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
            {active === t.id && (
              <span className="w-1 h-1 rounded-full bg-[#7dc84a]" />
            )}
          </button>
        ))}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
