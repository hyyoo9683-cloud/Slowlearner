import { useState } from 'react';
import { getStoredKey, setStoredKey } from '../utils/gemini';
import { getFontSize, setFontSize, FONT_SIZES } from '../utils/fontSize';
import { loadOnboarding, saveOnboarding } from './OnboardingScreen';

export default function SettingsScreen() {
  const [key, setKey] = useState(getStoredKey());
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fontSize, setFontSizeState] = useState(getFontSize());

  const handleSave = () => {
    setStoredKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setKey('');
    setStoredKey('');
  };

  const handleFontSize = (id) => {
    setFontSizeState(id);
    setFontSize(id);
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('slowrunner_onboarding');
    window.location.reload();
  };

  const hasKey = getStoredKey().length > 0;
  const profile = loadOnboarding();

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-5">
      <h2 className="text-[#c5f07a] font-bold text-lg">설정</h2>

      {/* Font Size */}
      <div className="p-4 rounded-2xl space-y-3"
        style={{ background: 'rgba(10,24,4,0.85)', border: '1px solid #2a5010' }}>
        <p className="text-[#8ab84a] text-xs font-semibold">글씨 크기</p>
        <div className="flex gap-2">
          {FONT_SIZES.map(f => (
            <button key={f.id} onClick={() => handleFontSize(f.id)}
              className="flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: fontSize === f.id ? '#2a5a0a' : 'rgba(20,50,8,0.6)',
                border: fontSize === f.id ? '2px solid #7dc84a' : '1px solid #2a5010',
                color: fontSize === f.id ? '#c5f07a' : '#4a7a20',
                fontSize: f.value,
              }}>
              가
            </button>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {FONT_SIZES.map(f => (
            <span key={f.id} className="text-[10px] flex-1 text-center"
              style={{ color: fontSize === f.id ? '#7dc84a' : '#3a5a18' }}>
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* AI Key Status */}
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: hasKey ? 'rgba(20,60,10,0.8)' : 'rgba(60,20,10,0.5)', border: `1px solid ${hasKey ? '#3a7a18' : '#7a3018'}` }}>
        <span className="text-2xl">{hasKey ? '✅' : '⚠️'}</span>
        <div>
          <p className="text-[#c5f07a] text-sm font-semibold">
            {hasKey ? 'AI 기능 활성화됨' : 'AI 키 미설정'}
          </p>
          <p className="text-[#6aaa30] text-xs">
            {hasKey ? 'Gemini API로 영어 제안이 작동해요' : '키 없이도 데모 문장으로 사용 가능해요'}
          </p>
        </div>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <p className="text-[#8ab84a] text-xs font-semibold">GEMINI API 키</p>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="AIza..."
            className="w-full py-3 px-4 pr-12 rounded-2xl text-sm outline-none"
            style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010', color: '#c5f07a' }}
          />
          <button onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7a20] text-lg">
            {visible ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: saved ? '#1a6a0a' : '#2a5a0a', color: '#c5f07a', border: '1px solid #4a8a20' }}>
            {saved ? '✓ 저장됨!' : '저장하기'}
          </button>
          {hasKey && (
            <button onClick={handleClear}
              className="px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(60,20,10,0.5)', color: '#f07a7a', border: '1px solid #7a3018' }}>
              삭제
            </button>
          )}
        </div>
      </div>

      {/* How to get key */}
      <div className="p-4 rounded-2xl space-y-2"
        style={{ background: 'rgba(10,24,4,0.6)', border: '1px solid #1a4008' }}>
        <p className="text-[#c5f07a] text-sm font-semibold">🔑 무료 API 키 발급 방법</p>
        <ol className="space-y-1.5">
          {[
            'aistudio.google.com 접속',
            '"Get API key" 클릭',
            '"Create API key" 버튼',
            '키 복사 후 위에 붙여넣기',
          ].map((s, i) => (
            <li key={i} className="text-[#6aaa30] text-xs flex gap-2">
              <span className="text-[#3a7a14] font-bold w-4 flex-shrink-0">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="text-[#3a5a18] text-xs mt-2">하루 1,500번 무료 · 개인 사용에 충분해요</p>
      </div>

      {/* My Profile */}
      {profile && (
        <div className="p-4 rounded-2xl space-y-2"
          style={{ background: 'rgba(10,24,4,0.4)', border: '1px solid #1a4008' }}>
          <p className="text-[#8ab84a] text-xs font-semibold">내 프로필</p>
          <p className="text-[#6aaa30] text-xs">
            관심사: {profile.interests?.join(', ') || '-'} · 수준: {profile.level || '-'}
          </p>
          <button onClick={handleResetOnboarding}
            className="text-[#3a5a18] text-xs underline">
            온보딩 다시 하기
          </button>
        </div>
      )}

      {/* App info */}
      <div className="p-4 rounded-2xl space-y-1"
        style={{ background: 'rgba(10,24,4,0.4)', border: '1px solid #1a4008' }}>
        <p className="text-[#4a7a20] text-xs font-semibold">Slow Runner 🌿</p>
        <p className="text-[#3a5a18] text-xs">일상에서 배우는 언어 · v1.1.0</p>
      </div>
    </div>
  );
}
