import { useState } from 'react';

const BOOKS = [
  {
    type: 'easy',
    label: '편하게 읽어요',
    labelBg: '#edf5e4',
    labelColor: '#4a8a20',
    borderColor: '#c8e8a0',
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
    labelBg: '#fdf5e0',
    labelColor: '#a07820',
    borderColor: '#e8d880',
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
      <span className="text-[#9a9088] text-xs">{label}</span>
      <span className="text-[#3a3530] text-xs font-medium">{typeof value === 'number' && value <= 100 ? `${value}%` : value}</span>
    </div>
    <div className="h-1.5 rounded-full" style={{ background: '#f0ece4' }}>
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
        <button onClick={() => setDetailBook(null)} className="text-[#6aaa3a] text-sm flex items-center gap-1 font-medium">
          ← 돌아가기
        </button>
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: '#ffffff', border: `2px solid ${book.borderColor}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[#3a3530] font-bold text-base">{book.title}</h3>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: book.labelBg, color: book.labelColor }}>
              {book.label}
            </span>
          </div>
          <p className="text-[#9a9088] text-xs">{book.author}</p>
          <div className="space-y-2.5 pt-1">
            <p className="text-[#b0a898] text-xs font-semibold">AI 분석 기준</p>
            <AnalysisBar label="문장 길이" value={book.analysis.sentenceLen} color="#f0c040" />
            <AnalysisBar label="기본 단어 비율" value={book.analysis.basicWords} color="#6aaa3a" />
            <AnalysisBar label="주제 친숙도" value={book.analysis.topicFamiliarity} color="#60a0e0" />
            <AnalysisBar label="감성 표현" value={book.analysis.emotionalExpression} color="#e07080" />
          </div>
          <p className="text-[#7a7268] text-xs leading-relaxed pt-2">{book.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-[#3a3530] font-bold text-lg">책 추천</h2>

      <div className="p-4 rounded-2xl"
        style={{ background: '#ffffff', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p className="text-[#3a3530] text-sm font-semibold mb-1">📖 나의 기록을 분석했어요</p>
        <p className="text-[#7a7268] text-xs leading-relaxed">
          자연·산책 관심사가 보여요. 이 분야에서 편하게 읽을 수 있는 책과 살짝 도전해볼 책을 골랐어요.
          유명한 책보다 <strong className="text-[#3a3530]">지금 나에게 맞는 책</strong>이 먼저예요.
        </p>
      </div>

      <p className="text-[#b0a898] text-xs">관심사: 자연·산책 / 수준: 초급 기준 예시</p>
      <div className="grid grid-cols-2 gap-3">
        {BOOKS.map((book, i) => (
          <button key={i} onClick={() => setDetailBook(i)}
            className="text-left p-3 rounded-2xl space-y-2 transition-all active:scale-95"
            style={{ background: '#ffffff', border: `2px solid ${book.borderColor}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: book.labelBg, color: book.labelColor }}>
              {book.label}
            </span>
            <p className="text-[#3a3530] text-sm font-bold leading-tight">{book.title}</p>
            <p className="text-[#9a9088] text-[11px]">{book.author}</p>
            <p className="text-[#6aaa3a] text-[11px] italic">{book.aiNote}</p>
          </button>
        ))}
      </div>

      <p className="text-[#c0b8b0] text-xs text-center">
        책 탭하면 → AI 분석 확인 가능
      </p>
    </div>
  );
}
