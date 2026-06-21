import { useState, useEffect } from 'react';
import { getCultureCard } from '../utils/gemini';

const FALLBACK = {
  category: '스몰토크',
  emoji: '☀️',
  title: '외국인이 날씨 얘기를 꺼내는 이유',
  description: '영국과 미국에서 날씨는 단순한 기상 정보가 아니에요. 처음 만난 사람과 어색함을 풀거나, 대화를 자연스럽게 시작하는 가장 안전한 주제예요. \'날씨 참 좋죠?\'는 사실 \'우리 편하게 이야기해요\'라는 신호예요. 한국에서 \'밥 먹었어요?\'와 비슷한 역할이에요.',
  expressions: [
    {
      english: 'Lovely weather today, isn\'t it?',
      korean: '날씨 얘기로 대화 시작하기',
      example: 'Lovely weather today, isn\'t it? Perfect for a walk.',
    },
    {
      english: 'I can\'t believe how warm it\'s been lately.',
      korean: '최근 날씨 변화로 공감대 만들기',
      example: 'I can\'t believe how warm it\'s been lately — feels like summer already!',
    },
  ],
};

export default function CultureCard({ onNavigate, onFillRecord }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCultureCard()
      .then(setCard)
      .catch(() => setCard(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const data = card || FALLBACK;

  const handleRecord = (expression) => {
    onFillRecord?.(expression.english);
    onNavigate('record');
  };

  if (loading) {
    return (
      <div className="p-4 rounded-3xl flex items-center gap-3"
        style={{ background: '#f0f7e6', border: '1px solid #97c459', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <span className="text-xl">🌿</span>
        <p className="text-[#4a6a20] text-sm">오늘의 문화를 가져오는 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: '#f0f7e6', border: '1px solid #97c459', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
            style={{ background: '#1a3d0a' }}>
            {data.emoji} {data.category}
          </span>
          <span className="text-[#7aaa40] text-xs">오늘의 문화 한 조각</span>
        </div>
        <p className="text-[#1a3d0a] font-bold text-base leading-snug">{data.title}</p>
        <p className="text-[#4a6a30] text-xs leading-relaxed mt-2">{data.description}</p>
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: '#97c459', opacity: 0.4 }} />

      {/* 표현 */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-[#1a3d0a] text-xs font-semibold">💬 이걸 알면 쓸 수 있는 표현</p>
        {data.expressions?.map((expr, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-medium"
                style={{ background: '#ffffff', border: '1.5px solid #1a3d0a', color: '#1a3d0a' }}>
                {expr.english}
              </span>
              <span className="text-[#4a6a30] text-xs pt-1">{expr.korean}</span>
            </div>
            <p className="text-[#6a8a50] text-xs italic pl-1">{expr.example}</p>
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="px-4 pb-4 space-y-2">
        {data.expressions?.map((expr, i) => (
          <button key={i} onClick={() => handleRecord(expr)}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: '#ffffff', color: '#1a3d0a', border: '1.5px solid #97c459', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            ✏️ "{expr.english.length > 22 ? expr.english.slice(0, 22) + '…' : expr.english}" 로 기록해보기
          </button>
        ))}
      </div>
    </div>
  );
}
