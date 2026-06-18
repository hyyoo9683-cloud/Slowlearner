import { useState } from 'react';
import RedHoodCharacter from '../components/RedHoodCharacter';

const INTERESTS = [
  { id: 'nature', label: '자연·산책', emoji: '🌿' },
  { id: 'animal', label: '동물', emoji: '🐾' },
  { id: 'food', label: '음식·요리', emoji: '🍳' },
  { id: 'travel', label: '여행', emoji: '✈️' },
  { id: 'daily', label: '일상', emoji: '☕' },
  { id: 'culture', label: '문화·예술', emoji: '🎨' },
];

const LEVELS = [
  { id: 'word', label: '단어만', desc: '"apple", "beautiful" 정도는 알아요', emoji: '🌱' },
  { id: 'sentence', label: '짧은 문장', desc: '"I went to the park" 같은 문장은 써요', emoji: '🌿' },
  { id: 'paragraph', label: '어느 정도 가능', desc: '문단은 쓰는데 자연스럽지 않아요', emoji: '🌳' },
];

export function saveOnboarding(data) {
  localStorage.setItem('slowrunner_onboarding', JSON.stringify({ ...data, done: true }));
}

export function loadOnboarding() {
  try {
    return JSON.parse(localStorage.getItem('slowrunner_onboarding') || 'null');
  } catch {
    return null;
  }
}

export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState([]);
  const [level, setLevel] = useState(null);

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const handleDone = () => {
    saveOnboarding({ interests, level });
    onDone({ interests, level });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f3ee' }}>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-10 pb-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: step === i ? 24 : 8,
              height: 8,
              background: step >= i ? '#6aaa3a' : '#e0dbd2',
            }} />
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 fade-in">
          <div className="float-anim mb-6">
            <RedHoodCharacter size={120} />
          </div>
          <h1 className="text-[#3a3530] text-2xl font-bold text-center leading-tight mb-3">
            안녕하세요! 👋<br />산들로그예요
          </h1>
          <p className="text-[#7a7268] text-sm text-center leading-relaxed mb-2">
            오늘 찍은 사진 한 장,<br />
            오늘 본 풍경 한 줄.
          </p>
          <p className="text-[#b0a898] text-sm text-center leading-relaxed mb-8">
            그게 영어 일기가 돼요.<br />
            공부 말고, 내 이야기로 시작해요.
          </p>
          <div className="w-full space-y-3">
            {[
              { emoji: '📷', text: '사진 찍고 → 영어로 남기는 앱이에요' },
              { emoji: '🌍', text: '세계 뉴스로 자연스럽게 단어 익혀요' },
              { emoji: '📖', text: '나한테 맞는 책을 AI가 추천해줘요' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: '#ffffff', border: '1px solid #ede9e2', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <span className="text-xl">{item.emoji}</span>
                <p className="text-[#5a5550] text-sm">{item.text}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(1)}
            className="w-full mt-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{ background: '#c84040', color: 'white' }}>
            시작하기 🌿
          </button>
        </div>
      )}

      {/* Step 1: Interests */}
      {step === 1 && (
        <div className="flex-1 flex flex-col px-6 pb-10 fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[#b0a898] text-sm mb-1">2/3</p>
            <h2 className="text-[#3a3530] text-xl font-bold mb-2">어떤 걸 좋아하세요?</h2>
            <p className="text-[#7a7268] text-sm mb-6">
              관심사에 맞는 뉴스와 책을 추천해드려요.<br />
              <span className="text-[#b0a898]">최대 2개 선택</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(item => (
                <button key={item.id} onClick={() => toggleInterest(item.id)}
                  className="p-4 rounded-2xl text-left transition-all active:scale-95"
                  style={{
                    background: interests.includes(item.id) ? '#edf5e4' : '#ffffff',
                    border: interests.includes(item.id) ? '2px solid #6aaa3a' : '1px solid #e0dbd2',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  }}>
                  <span className="text-2xl block mb-1">{item.emoji}</span>
                  <span className="text-[#3a3530] text-sm font-medium">{item.label}</span>
                  {interests.includes(item.id) && (
                    <span className="text-[#6aaa3a] text-xs block">✓ 선택됨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)}
            disabled={interests.length === 0}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{
              background: interests.length > 0 ? '#edf5e4' : '#f0ece4',
              color: interests.length > 0 ? '#4a8a20' : '#c0b8b0',
              border: interests.length > 0 ? '1.5px solid #c8e8a0' : '1px solid #e0dbd2',
            }}>
            다음 →
          </button>
        </div>
      )}

      {/* Step 2: Level */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 pb-10 fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[#b0a898] text-sm mb-1">3/3</p>
            <h2 className="text-[#3a3530] text-xl font-bold mb-2">영어 실력이 어느 정도예요?</h2>
            <p className="text-[#7a7268] text-sm mb-6">
              솔직하게 골라주세요!<br />
              <span className="text-[#b0a898]">나중에 바꿀 수 있어요</span>
            </p>
            <div className="space-y-3">
              {LEVELS.map(item => (
                <button key={item.id} onClick={() => setLevel(item.id)}
                  className="w-full p-4 rounded-2xl text-left transition-all active:scale-95"
                  style={{
                    background: level === item.id ? '#edf5e4' : '#ffffff',
                    border: level === item.id ? '2px solid #6aaa3a' : '1px solid #e0dbd2',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="text-[#3a3530] font-semibold text-sm">{item.label}</p>
                      <p className="text-[#9a9088] text-xs mt-0.5">{item.desc}</p>
                    </div>
                    {level === item.id && <span className="ml-auto text-[#6aaa3a]">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleDone}
            disabled={!level}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{
              background: level ? '#c84040' : '#f0ece4',
              color: level ? 'white' : '#c0b8b0',
            }}>
            산들로그 시작! 🌿
          </button>
        </div>
      )}
    </div>
  );
}
