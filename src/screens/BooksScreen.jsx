import { useState } from 'react';

const BOOKS = [
  {
    type: 'easy',
    label: '편하게 읽어요',
    labelColor: '#4a8a20',
    borderColor: '#3a7a18',
    title: 'The Hundred-Year Walk',
    author: 'Dawn Anahid MacKeen',
    reason: '짧은 단락, 자연 묘사 위주. 지금 쓰시는 "walked", "saw", "felt" 같은 단어들이 많이 나와요.',
    aiNote: '"산책 일기 쓰는 분께 딱 맞아요 🌿"',
    analysis: {
      sentenceLen: 65,
      basicWords: 72,
      topicFamiliarity: 85,
      emotionalExpression: 60,
    },
  },
  {
    type: 'challenge',
    label: '도전해봐요',
    labelColor: '#c8a020',
    borderColor: '#a08010',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    reason: '자연과 감정을 연결하는 표현이 풍부해요. 모르는 단어가 좀 있지만 감성이 비슷해서 끝까지 읽게 돼요.',
    aiNote: '"표현력 확 늘어나는 책이에요 ✨"',
    analysis: {
      sentenceLen: 75,
      basicWords: 72,
      topicFamiliarity: 90,
      emotionalExpression: 95,
    },
  },
];

const AnalysisBar = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[#6aaa30] text-xs">{label}</span>
      <span className="text-[#c5f07a] text-xs">{typeof value === 'number' && value <= 100 ? `${value}%` : value}</span>
    </div>
    <div className="h-1.5 rounded-full" style={{ background: 'rgba(42,80,16,0.4)' }}>
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);

export default function BooksScreen() {
  const [detailBook, setDetailBook] = useState(null);

  if (detailBook !== null) {
    const book = BOOKS[detailBook];
    return (
      <div className="tab-content px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setDetailBook(null)} className="text-[#6aaa30] text-sm flex items-center gap-1">
          ← 돌아가기
        </button>
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: 'rgba(10,24,4,0.85)', border: `2px solid ${book.borderColor}` }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[#c5f07a] font-bold text-base">{book.title}</h3>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: 'rgba(42,80,16,0.6)', color: book.labelColor }}>
              {book.label}
            </span>
          </div>
          <p className="text-[#6aaa30] text-xs">{book.author}</p>
          <div className="space-y-2.5 pt-1">
            <p className="text-[#8ab84a] text-xs font-semibold">AI 분석 기준</p>
            <AnalysisBar label="문장 길이" value={book.analysis.sentenceLen} color="#f5d76e" />
            <AnalysisBar label="기본 단어 비율" value={book.analysis.basicWords} color="#7dc84a" />
            <AnalysisBar label="주제 친숙도" value={book.analysis.topicFamiliarity} color="#4a9aff" />
            <AnalysisBar label="감성 표현" value={book.analysis.emotionalExpression} color="#e87070" />
          </div>
          <p className="text-[#a0c870] text-xs leading-relaxed pt-2">{book.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-[#c5f07a] font-bold text-lg">책 추천</h2>

      {/* AI recommendation card */}
      <div className="p-4 rounded-2xl"
        style={{ background: 'rgba(10,24,4,0.85)', border: '1px solid #2a5010' }}>
        <p className="text-[#c5f07a] text-sm font-semibold mb-1">📖 나의 기록을 분석했어요</p>
        <p className="text-[#6aaa30] text-xs leading-relaxed">
          자연·산책 관심사가 보여요. 이 분야에서 편하게 읽을 수 있는 책과 살짝 도전해볼 책을 골랐어요.
          유명한 책보다 <strong className="text-[#c5f07a]">지금 나에게 맞는 책</strong>이 먼저예요.
        </p>
      </div>

      {/* Book cards */}
      <p className="text-[#4a7a20] text-xs">관심사: 자연·산책 / 수준: 초급 기준 예시</p>
      <div className="grid grid-cols-2 gap-3">
        {BOOKS.map((book, i) => (
          <button key={i} onClick={() => setDetailBook(i)}
            className="text-left p-3 rounded-2xl space-y-2 transition-all active:scale-95"
            style={{ background: 'rgba(10,24,4,0.85)', border: `2px solid ${book.borderColor}` }}>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(42,80,16,0.6)', color: book.labelColor }}>
              {book.label}
            </span>
            <p className="text-[#c5f07a] text-sm font-bold leading-tight">{book.title}</p>
            <p className="text-[#6aaa30] text-[11px]">{book.author}</p>
            <p className="text-[#7dc84a] text-[11px] italic">{book.aiNote}</p>
          </button>
        ))}
      </div>

      <p className="text-[#3a5a18] text-xs text-center">
        책 탭하면 → 첫 페이지 미리보기 + AI 분석 확인 가능
      </p>
    </div>
  );
}
