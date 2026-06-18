import { loadRecords } from '../utils/storage';

export default function GalleryScreen({ onNavigate }) {
  const records = loadRecords();
  const totalWords = records.reduce((acc, r) => acc + (r.words?.length || 0), 0);
  const days = records.length;
  const hours = Math.floor(days * 3.5);

  return (
    <div className="tab-content px-4 pt-4 pb-24">
      <h2 className="text-[#c5f07a] font-bold text-lg mb-1">나의 기록들</h2>
      <p className="text-[#4a7a20] text-xs mb-4">숲에 새겨진 나만의 이야기</p>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {records.map((r, i) => (
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

        {/* Add button */}
        <button onClick={() => onNavigate('record')}
          className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          style={{ background: 'rgba(20,50,8,0.5)', border: '2px dashed #2a5010' }}>
          <span className="text-2xl text-[#3a7a14]">+</span>
          <span className="text-[#3a6a12] text-[10px]">추가</span>
        </button>
      </div>

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

      {records.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-[#6aaa30] text-sm">아직 기록이 없어요.</p>
          <p className="text-[#3a5a18] text-xs mt-1">첫 번째 순간을 기록해봐요!</p>
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
