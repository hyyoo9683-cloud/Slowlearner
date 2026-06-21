import { useState, useMemo } from 'react';
import { loadRecords } from '../utils/storage';
import { loadOnboarding } from './OnboardingScreen';

const ALL_BOOKS = [
  // 자연·산책
  {
    id: 'hundredyear', tags: ['nature', 'walk', 'travel', 'history'],
    type: 'easy', label: '편하게 읽어요', labelBg: '#edf5e4', labelColor: '#4a8a20', borderColor: '#c8e8a0',
    title: 'The Hundred-Year Walk', author: 'Dawn Anahid MacKeen',
    reason: '짧은 단락, 자연 묘사 위주. "walked", "saw", "felt" 같은 일상 단어가 많이 나와요.',
    aiNote: '"산책 일기 쓰는 분께 딱 맞아요 🌿"',
    analysis: { sentenceLen: 65, basicWords: 72, topicFamiliarity: 85, emotionalExpression: 60 },
    excerpt: "The forest is not a place to get lost. It is a place to find yourself. As I walked among the ancient trees, I felt the weight of the world lift from my shoulders.",
    excerptKo: "숲은 길을 잃는 곳이 아니에요. 자신을 찾는 곳이에요. 고목들 사이를 걸으며, 세상의 무게가 어깨에서 내려지는 것을 느꼈어요.",
    expressions: ['lift from my shoulders', 'ancient trees', 'find yourself'],
    expressionMeanings: { 'lift from my shoulders': '어깨에서 내려지다 (부담이 사라지다)', 'ancient trees': '고목, 오래된 나무', 'find yourself': '자신을 찾다' },
  },
  {
    id: 'sweetgrass', tags: ['nature', 'plant', 'culture', 'science'],
    type: 'challenge', label: '도전해봐요', labelBg: '#fdf5e0', labelColor: '#a07820', borderColor: '#e8d880',
    title: 'Braiding Sweetgrass', author: 'Robin Wall Kimmerer',
    reason: '자연과 감정을 연결하는 표현이 풍부해요. 모르는 단어가 좀 있지만 감성이 비슷해 끝까지 읽게 돼요.',
    aiNote: '"표현력 확 늘어나는 책이에요 ✨"',
    analysis: { sentenceLen: 75, basicWords: 62, topicFamiliarity: 90, emotionalExpression: 95 },
    excerpt: "In the old days, we were told to say thank you to the plants. Not just to acknowledge them, but to feel it — to mean it with every cell of our being.",
    excerptKo: "옛날에는 식물에게 감사하라고 배웠어요. 그저 인정하는 것이 아니라, 온 몸의 세포로 그것을 느끼고 진심으로 말하라고요.",
    expressions: ['acknowledge', 'every cell of our being', 'old days'],
    expressionMeanings: { 'acknowledge': '인정하다, 받아들이다', 'every cell of our being': '온 몸으로, 전 존재로', 'old days': '옛날, 예전' },
  },
  // 동물
  {
    id: 'animalfarm', tags: ['animal', 'story', 'daily'],
    type: 'easy', label: '편하게 읽어요', labelBg: '#edf5e4', labelColor: '#4a8a20', borderColor: '#c8e8a0',
    title: 'The Travelling Cat Chronicles', author: 'Hiro Arikawa',
    reason: '고양이와 함께하는 여행 이야기예요. 감성적이고 짧은 문장이 많아 부담 없이 읽혀요.',
    aiNote: '"동물 좋아하는 분께 눈물 주의 📖"',
    analysis: { sentenceLen: 60, basicWords: 78, topicFamiliarity: 88, emotionalExpression: 90 },
    excerpt: "Nana sat beside me, his silver tail curled neatly around his paws. He looked out at the passing scenery with the calm dignity that only cats possess.",
    excerptKo: "나나는 내 옆에 앉아 은빛 꼬리를 발 위에 가지런히 감고 있었어요. 오직 고양이만이 가질 수 있는 차분한 품위로 지나가는 풍경을 바라봤어요.",
    expressions: ['curled neatly', 'passing scenery', 'calm dignity'],
    expressionMeanings: { 'curled neatly': '가지런히 말려 있다', 'passing scenery': '지나가는 풍경', 'calm dignity': '차분한 품위' },
  },
  // 음식·요리
  {
    id: 'salt', tags: ['food', 'cook', 'culture', 'history'],
    type: 'easy', label: '편하게 읽어요', labelBg: '#edf5e4', labelColor: '#4a8a20', borderColor: '#c8e8a0',
    title: 'Salt, Fat, Acid, Heat', author: 'Samin Nosrat',
    reason: '요리 과정을 감각적으로 묘사해요. 맛·냄새·질감 관련 영어 표현을 자연스럽게 익힐 수 있어요.',
    aiNote: '"요리 좋아하면 군침 도는 영어 공부 🍳"',
    analysis: { sentenceLen: 58, basicWords: 75, topicFamiliarity: 92, emotionalExpression: 70 },
    excerpt: "The moment I tasted that soup, I understood. Good food doesn't need to be complicated. It needs salt, it needs fat, it needs acid — and it needs love.",
    excerptKo: "그 수프를 맛본 순간 알았어요. 좋은 음식이 복잡할 필요는 없어요. 소금, 지방, 산 — 그리고 사랑이 필요해요.",
    expressions: ['the moment I tasted', 'complicated', 'needs love'],
    expressionMeanings: { 'the moment I tasted': '맛보는 순간', 'complicated': '복잡한', 'needs love': '사랑이 필요하다' },
  },
  // 여행
  {
    id: 'alchemist', tags: ['travel', 'daily', 'culture'],
    type: 'easy', label: '편하게 읽어요', labelBg: '#edf5e4', labelColor: '#4a8a20', borderColor: '#c8e8a0',
    title: 'The Alchemist', author: 'Paulo Coelho',
    reason: '세계 가장 많이 읽힌 책 중 하나예요. 문장이 짧고 명확해서 영어 초급자도 읽기 좋아요.',
    aiNote: '"여행하며 읽으면 두 배로 감동이에요 ✈️"',
    analysis: { sentenceLen: 55, basicWords: 82, topicFamiliarity: 80, emotionalExpression: 88 },
    excerpt: "When you want something, all the universe conspires in helping you to achieve it. The boy had heard this from his father, and now the desert was teaching him the same lesson.",
    excerptKo: "무언가를 진심으로 원하면 온 우주가 그것을 이루도록 도와줘요. 소년은 아버지에게 이 말을 들었고, 이제 사막이 같은 교훈을 가르쳐주고 있었어요.",
    expressions: ['conspires', 'achieve it', 'teaching him'],
    expressionMeanings: { 'conspires': '힘을 합치다, 공모하다', 'achieve it': '이루다, 달성하다', 'teaching him': '그에게 가르치다' },
  },
  // 일상·감성
  {
    id: 'yearofmagical', tags: ['daily', 'emotion', 'culture'],
    type: 'challenge', label: '도전해봐요', labelBg: '#fdf5e0', labelColor: '#a07820', borderColor: '#e8d880',
    title: 'The Year of Magical Thinking', author: 'Joan Didion',
    reason: '일상의 감정을 세밀하게 묘사하는 표현이 많아요. 감성 일기를 쓰고 싶을 때 도움이 돼요.',
    aiNote: '"감성 표현 레벨업 하고 싶을 때 ☕"',
    analysis: { sentenceLen: 70, basicWords: 65, topicFamiliarity: 82, emotionalExpression: 98 },
    excerpt: "Life changes fast. Life changes in the instant. You sit down to dinner and life as you know it ends. The question of self-pity.",
    excerptKo: "삶은 빠르게 변해요. 삶은 순간적으로 변해요. 저녁 식사 자리에 앉는 순간, 내가 알던 삶이 끝나버려요.",
    expressions: ['in the instant', 'life as you know it', 'self-pity'],
    expressionMeanings: { 'in the instant': '순간적으로', 'life as you know it': '내가 알던 삶', 'self-pity': '자기 연민' },
  },
  // 문화·예술
  {
    id: 'stolenbeauty', tags: ['culture', 'art', 'history', 'travel'],
    type: 'challenge', label: '도전해봐요', labelBg: '#fdf5e0', labelColor: '#a07820', borderColor: '#e8d880',
    title: 'The Goldfinch', author: 'Donna Tartt',
    reason: '예술과 일상을 넘나드는 풍부한 묘사가 있어요. 어휘력을 키우기 좋아요.',
    aiNote: '"예술 감각 있는 분께 강추 🎨"',
    analysis: { sentenceLen: 80, basicWords: 58, topicFamiliarity: 78, emotionalExpression: 92 },
    excerpt: "Sometimes we want what we want even if we know it's going to kill us. Beauty can be a terrible thing — it ruins you for everything else.",
    excerptKo: "우리는 때로 그것이 우리를 망칠 줄 알면서도 원해요. 아름다움은 끔찍한 것이 될 수 있어요 — 다른 모든 것을 망쳐버리거든요.",
    expressions: ['ruins you', 'terrible thing', 'even if we know'],
    expressionMeanings: { 'ruins you': '망쳐버리다', 'terrible thing': '끔찍한 것', 'even if we know': '알면서도' },
  },
];

// 기록에서 토픽 추출
function inferTopicsFromRecords(records) {
  const topicKeywords = {
    nature:  ['산책', '자연', '숲', '나무', '꽃', '공원', '바람', '하늘', 'walk', 'forest', 'tree', 'flower', 'nature', 'park', 'sky', 'moss', 'leaf'],
    animal:  ['고양이', '강아지', '동물', '새', '나비', 'cat', 'dog', 'animal', 'bird', 'puppy', 'kitten', 'pet'],
    food:    ['음식', '요리', '카페', '커피', '밥', '먹', '맛', 'food', 'cook', 'coffee', 'cafe', 'eat', 'taste', 'recipe'],
    travel:  ['여행', '방문', '도시', '해외', '거리', 'travel', 'visit', 'city', 'trip', 'street', 'abroad', 'tour'],
    daily:   ['일상', '오늘', '아침', '저녁', '집', '방', 'daily', 'morning', 'evening', 'home', 'today', 'night'],
    culture: ['전시', '영화', '음악', '책', '미술', '공연', 'art', 'movie', 'music', 'book', 'museum', 'exhibit', 'concert'],
  };

  const allText = records.map(r => `${r.koreanText || ''} ${r.englishText || ''}`).join(' ').toLowerCase();
  const scores = {};
  for (const [topic, kws] of Object.entries(topicKeywords)) {
    scores[topic] = kws.filter(kw => allText.includes(kw)).length;
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

function pickBooks(records, onboardingInterests) {
  const topics = records.length >= 2
    ? inferTopicsFromRecords(records)
    : (onboardingInterests?.length > 0 ? onboardingInterests : ['nature', 'daily']);

  const topTopics = topics.slice(0, 3);

  const scored = ALL_BOOKS.map(b => ({
    ...b,
    score: b.tags.filter(t => topTopics.includes(t)).length,
  })).sort((a, b) => b.score - a.score);

  const easy = scored.find(b => b.type === 'easy') || scored[0];
  const challenge = scored.find(b => b.type === 'challenge' && b.id !== easy?.id) || scored[1];
  return [easy, challenge].filter(Boolean);
}

const AnalysisBar = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-[#9a9088] text-xs">{label}</span>
      <span className="text-[#3a3530] text-xs font-medium">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full" style={{ background: '#f0ece4' }}>
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);

export default function BooksScreen({ onNavigate }) {
  const [detailBook, setDetailBook] = useState(null);
  const [showKo, setShowKo] = useState(false);
  const [activeExpr, setActiveExpr] = useState(null);

  const records = loadRecords();
  const profile = loadOnboarding();
  const books = useMemo(() => pickBooks(records, profile?.interests), []);

  const topTopics = records.length >= 2
    ? inferTopicsFromRecords(records).slice(0, 2)
    : (profile?.interests?.slice(0, 2) || ['자연']);

  const topicLabel = {
    nature: '자연·산책', animal: '동물', food: '음식·요리',
    travel: '여행', daily: '일상', culture: '문화·예술',
  };

  if (detailBook !== null) {
    const book = books[detailBook];
    return (
      <div className="tab-content px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => { setDetailBook(null); setShowKo(false); setActiveExpr(null); }}
          className="text-[#6aaa3a] text-sm flex items-center gap-1 font-medium">
          ← 돌아가기
        </button>
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: '#faf8f3', border: `2px solid ${book.borderColor}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-[#3a3530] font-bold text-base">{book.title}</h3>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: book.labelBg, color: book.labelColor }}>{book.label}</span>
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

        {book.excerpt && (
          <div className="p-4 rounded-2xl space-y-3"
            style={{ background: '#faf8f3', border: '1px solid #ede9e2' }}>
            <div className="flex items-center justify-between">
              <p className="text-[#3a3530] text-sm font-semibold">📖 첫 단락</p>
              <button onClick={() => setShowKo(v => !v)}
                className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                style={{
                  background: showKo ? '#edf5e4' : '#f0ece4',
                  color: showKo ? '#4a8a20' : '#9a9088',
                  border: showKo ? '1px solid #c8e8a0' : '1px solid #e0dbd2',
                }}>
                {showKo ? '영어로 보기' : '한국어로 보기'}
              </button>
            </div>
            <p className="text-[#5a5550] text-sm leading-relaxed italic">
              {showKo ? book.excerptKo : book.excerpt}
            </p>
            {book.expressions?.length > 0 && (
              <div className="pt-1 space-y-2">
                <p className="text-[#b0a898] text-xs font-semibold">핵심 표현 탭해보기</p>
                <div className="flex flex-wrap gap-2">
                  {book.expressions.map((expr, i) => (
                    <button key={i} onClick={() => setActiveExpr(activeExpr === expr ? null : expr)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: activeExpr === expr ? '#edf5e4' : '#f0ece4',
                        color: activeExpr === expr ? '#4a8a20' : '#6a6560',
                        border: activeExpr === expr ? '1.5px solid #6aaa3a' : '1px solid #e0dbd2',
                      }}>
                      {expr}
                    </button>
                  ))}
                </div>
                {activeExpr && book.expressionMeanings?.[activeExpr] && (
                  <div className="p-2.5 rounded-xl" style={{ background: '#edf5e4', border: '1px solid #c8e8a0' }}>
                    <p className="text-[#4a8a20] text-xs font-medium">"{activeExpr}"</p>
                    <p className="text-[#6a8a50] text-xs mt-0.5">{book.expressionMeanings[activeExpr]}</p>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => onNavigate?.('record')}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 mt-1"
              style={{ background: '#edf5e4', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
              이 표현으로 오늘 기록하기 ✏️
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-[#3a3530] font-bold text-lg">책 추천</h2>

      <div className="p-4 rounded-2xl"
        style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p className="text-[#3a3530] text-sm font-semibold mb-1">📖 {records.length >= 2 ? '나의 기록을 분석했어요' : '관심사 기반 추천이에요'}</p>
        <p className="text-[#7a7268] text-xs leading-relaxed">
          {records.length >= 2
            ? `기록에서 <strong>${topTopics.map(t => topicLabel[t] || t).join(', ')}</strong> 관심사가 보여요.`
            : `설정한 관심사 기반으로 골랐어요.`}
          {' '}편하게 읽을 책과 살짝 도전해볼 책을 각각 골랐어요.
        </p>
        {records.length < 2 && (
          <p className="text-[#b0a898] text-[11px] mt-1.5">기록을 2개 이상 쌓으면 내 취향에 맞게 바뀌어요 🌱</p>
        )}
      </div>

      <p className="text-[#b0a898] text-xs">
        관심사: {topTopics.map(t => topicLabel[t] || t).join(' · ')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {books.map((book, i) => (
          <div key={book.id}
            className="text-left p-3 rounded-2xl space-y-2"
            style={{ background: '#faf8f3', border: `2px solid ${book.borderColor}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: book.labelBg, color: book.labelColor }}>
              {book.label}
            </span>
            <p className="text-[#3a3530] text-sm font-bold leading-tight">{book.title}</p>
            <p className="text-[#9a9088] text-[11px]">{book.author}</p>
            <p className="text-[#7a7268] text-xs leading-snug line-clamp-2">{book.aiNote}</p>
            <button onClick={() => { setDetailBook(i); setShowKo(false); setActiveExpr(null); }}
              className="w-full py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: book.labelBg, color: book.labelColor, border: `1px solid ${book.borderColor}` }}>
              AI 분석 보기 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
