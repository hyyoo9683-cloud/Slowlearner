import { useState } from 'react';
import { getStoredKey, setStoredKey } from '../utils/gemini';
import { getFontSize, setFontSize, FONT_SIZES } from '../utils/fontSize';
import { loadOnboarding } from './OnboardingScreen';
import PixelCharacterEditor from '../components/PixelCharacterEditor';

export default function SettingsScreen() {
  const [key, setKey] = useState(getStoredKey());
  const [savedMsg, setSavedMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const [fontSize, setFontSizeState] = useState(getFontSize());
  const [hasKey, setHasKey] = useState(getStoredKey().length > 0);

  const handleSave = () => {
    const trimmed = key.trim();
    setStoredKey(trimmed);
    setHasKey(trimmed.length > 0);
    setSavedMsg(trimmed ? '✓ 저장됐어요!' : '키를 삭제했어요');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleClear = () => {
    setKey('');
    setStoredKey('');
    setHasKey(false);
    setSavedMsg('키를 삭제했어요');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const handleFontSize = (id) => {
    setFontSizeState(id);
    setFontSize(id);
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem('slowrunner_onboarding');
    window.location.reload();
  };

  const profile = loadOnboarding();

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-5">
      <h2 className="text-[#3a3530] font-bold text-lg">설정</h2>

      {/* Font Size */}
      <div className="p-4 rounded-2xl space-y-3"
        style={{ background: '#faf8f3', border: '1px solid #ede9e2', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p className="text-[#7a7268] text-xs font-semibold">글씨 크기</p>
        <div className="flex gap-2">
          {FONT_SIZES.map(f => (
            <button key={f.id} onClick={() => handleFontSize(f.id)}
              className="flex-1 py-3 rounded-2xl font-bold transition-all active:scale-95"
              style={{
                background: fontSize === f.id ? '#edf5e4' : '#f8f6f2',
                border: fontSize === f.id ? '2px solid #6aaa3a' : '1px solid #e0dbd2',
                color: fontSize === f.id ? '#4a8a20' : '#b0a898',
                fontSize: f.value,
                lineHeight: 1,
              }}>
              가
            </button>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {FONT_SIZES.map(f => (
            <span key={f.id} className="text-[10px] flex-1 text-center"
              style={{ color: fontSize === f.id ? '#6aaa3a' : '#c0b8b0' }}>
              {f.label}
            </span>
          ))}
        </div>
        <p className="text-[#c0b8b0] text-xs text-center">탭하면 앱 전체 글씨가 바뀌어요</p>
      </div>

      {/* Pixel Character Editor */}
      <div className="p-4 rounded-2xl"
        style={{ background: '#faf8f3', border: '1px solid #ede9e2' }}>
        <PixelCharacterEditor />
      </div>

      {/* AI Key Status */}
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{
          background: hasKey ? '#edf5e4' : '#fff5f5',
          border: `1px solid ${hasKey ? '#c8e8a0' : '#f8c0c0'}`
        }}>
        <span className="text-2xl">{hasKey ? '✅' : '⚠️'}</span>
        <div>
          <p className="text-[#3a3530] text-sm font-semibold">
            {hasKey ? 'AI 기능 활성화됨' : 'AI 키 미설정'}
          </p>
          <p className="text-[#7a7268] text-xs">
            {hasKey ? 'Gemini API로 영어 제안이 작동해요' : '키 없이도 데모 문장으로 사용 가능해요'}
          </p>
        </div>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <p className="text-[#7a7268] text-xs font-semibold">GEMINI API 키</p>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="AIza..."
            className="w-full py-3 px-4 pr-12 rounded-2xl text-sm outline-none"
            style={{ background: '#ffffff', border: '1px solid #e0dbd2', color: '#3a3530' }}
          />
          <button onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a898] text-lg">
            {visible ? '🙈' : '👁️'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: savedMsg ? '#edf5e4' : '#f0ece4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
            {savedMsg || '저장하기'}
          </button>
          {hasKey && (
            <button onClick={handleClear}
              className="px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#fff5f5', color: '#e05050', border: '1px solid #f8c0c0' }}>
              삭제
            </button>
          )}
        </div>
      </div>

      {/* How to get key */}
      <div className="p-4 rounded-2xl space-y-2"
        style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
        <p className="text-[#3a3530] text-sm font-semibold">🔑 무료 API 키 발급 방법</p>
        <ol className="space-y-1.5">
          {[
            'aistudio.google.com 접속',
            '"Get API key" 클릭',
            '"Create API key" 버튼',
            '키 복사 후 위에 붙여넣기',
          ].map((s, i) => (
            <li key={i} className="text-[#7a7268] text-xs flex gap-2">
              <span className="text-[#6aaa3a] font-bold w-4 flex-shrink-0">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="text-[#c0b8b0] text-xs mt-2">하루 1,500번 무료 · 개인 사용에 충분해요</p>
      </div>

      {/* My Profile */}
      {profile && (
        <div className="p-4 rounded-2xl space-y-2"
          style={{ background: '#faf8f3', border: '1px solid #ede9e2' }}>
          <p className="text-[#7a7268] text-xs font-semibold">내 프로필</p>
          <p className="text-[#9a9088] text-xs">
            관심사: {profile.interests?.join(', ') || '-'} · 수준: {profile.level || '-'}
          </p>
          <button onClick={handleResetOnboarding}
            className="text-[#6aaa3a] text-xs underline">
            온보딩 다시 하기
          </button>
        </div>
      )}

      {/* App info */}
      <div className="p-4 rounded-2xl space-y-1"
        style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
        <p className="text-[#9a9088] text-xs font-semibold">산들로그 🌿</p>
        <p className="text-[#c0b8b0] text-xs">일상에서 배우는 언어 · v1.2.0</p>
      </div>
    </div>
  );
}
