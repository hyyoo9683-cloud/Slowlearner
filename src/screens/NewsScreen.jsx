import { useState } from 'react';

const NEWS = [
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
    color: '#1a4a6a',
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
    color: '#1a4a2a',
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
    color: '#3a2a1a',
  },
];

export default function NewsScreen({ onNavigate }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-[#c5f07a] font-bold text-lg">오늘의 뉴스 — {NEWS.length}개</h2>
      <p className="text-[#4a7a20] text-xs -mt-2">세상 돌아가는 이야기 + 영어 표현 익히기</p>

      {NEWS.map((n, i) => (
        <div key={i} className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,24,4,0.85)', border: '1px solid #2a5010' }}>
          <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === i ? null : i)}>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: n.color, color: '#c5f07a' }}>{n.category}</span>
            <p className="text-[#c5f07a] font-bold text-sm mt-2 leading-tight">{n.title}</p>
            <p className="text-[#6aaa30] text-xs mt-1">{n.koTitle}</p>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 space-y-3 slide-up">
              <div className="space-y-1.5">
                {n.summary.map((s, j) => (
                  <p key={j} className="text-[#a0c870] text-sm leading-relaxed">
                    <span className="text-[#4a8a20] mr-1">·</span>{s}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {n.words.map((w, j) => (
                  <span key={j} className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(42,90,16,0.6)', color: '#c5f07a', border: '1px solid #3a7a18' }}>
                    {w}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onNavigate('record')}
                className="w-full py-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: 'rgba(42,90,16,0.5)', border: '1px solid #3a7a18', color: '#c5f07a' }}>
                이 뉴스로 한 줄 써보기 ✏️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
