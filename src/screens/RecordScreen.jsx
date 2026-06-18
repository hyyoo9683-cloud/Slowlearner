import { useState, useRef } from 'react';
import { getSuggestions } from '../utils/anthropic';
import { saveRecord } from '../utils/storage';

const DEMO_SUGGESTIONS = {
  korean: [
    'I came across a moss-covered stone wall along the path.',
    'The old stone wall was draped in soft, green moss.',
    'A beautiful mossy stone wall caught my eye on my walk.',
  ],
  english: [
    'The kittens were frolicking playfully in the warm sunlight.',
    'I watched the tiny kittens tumble and leap around each other.',
    'A group of little kittens were chasing each other joyfully.',
  ],
};

export default function RecordScreen() {
  const [mode, setMode] = useState('korean');
  const [text, setText] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedWords, setSavedWords] = useState([]);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSuggest = async () => {
    setError('');
    setLoading(true);
    setSuggestions([]);
    setSelected(null);
    try {
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
      let result;
      if (!key || key === 'your_key_here') {
        await new Promise(r => setTimeout(r, 1000));
        result = DEMO_SUGGESTIONS[mode];
      } else {
        result = await getSuggestions(text, mode);
      }
      setSuggestions(result);
    } catch (e) {
      setError('AI 제안을 가져오지 못했어요. 잠시 후 다시 시도해주세요.');
      setSuggestions(DEMO_SUGGESTIONS[mode]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const englishText = selected || suggestions[0] || text;
    const words = englishText.match(/\b[a-zA-Z]{4,}\b/g)?.slice(0, 5) || [];
    saveRecord({ mood: 'sunny', photoUrl, koreanText: mode === 'korean' ? text : '', englishText, words });
    setSavedWords(words);
    setSaved(true);
  };

  const handleReset = () => {
    setText('');
    setPhotoUrl(null);
    setSuggestions([]);
    setSelected(null);
    setSaved(false);
    setSavedWords([]);
  };

  if (saved) {
    return (
      <div className="tab-content px-4 pt-6 pb-24 space-y-4">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🌿</div>
          <p className="text-[#c5f07a] text-xl font-bold">기록 완료!</p>
          <p className="text-[#6aaa30] text-sm mt-1">오늘의 순간이 숲에 새겨졌어요</p>
        </div>
        {selected && (
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(42,90,16,0.5)', border: '1px solid #3a7a18' }}>
            <p className="text-[#c5f07a] text-sm font-medium">{selected}</p>
          </div>
        )}
        {savedWords.length > 0 && (
          <div>
            <p className="text-[#8ab84a] text-xs font-semibold mb-2">오늘 사용한 단어</p>
            <div className="flex flex-wrap gap-2">
              {savedWords.map((w, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(42,90,16,0.6)', color: '#c5f07a', border: '1px solid #3a7a18' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleReset}
          className="w-full py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
          style={{ background: '#2a5a0a', color: '#c5f07a', border: '1px solid #4a8a20' }}>
          새 기록 남기기
        </button>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <h2 className="text-[#c5f07a] font-bold text-lg">오늘의 기록</h2>

      {/* Mode Toggle */}
      <div className="flex rounded-2xl overflow-hidden" style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010' }}>
        {[
          { id: 'korean', label: '한국어로 써요' },
          { id: 'english', label: '영어로 써요' },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setSuggestions([]); setSelected(null); }}
            className="flex-1 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: mode === m.id ? '#2a5a0a' : 'transparent',
              color: mode === m.id ? '#c5f07a' : '#4a7a20',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Photo Upload */}
      <button onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl overflow-hidden transition-all active:scale-95"
        style={{ border: '2px dashed #3a6a14', background: 'rgba(10,24,4,0.6)' }}>
        {photoUrl ? (
          <img src={photoUrl} alt="preview" className="w-full h-40 object-cover" />
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">📷</span>
            <p className="text-[#6aaa30] text-sm">사진 추가하기</p>
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

      {/* Text Input */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={mode === 'korean'
          ? '오늘 어떤 순간이 있었나요? 한국어로 적어보세요...\n예: 오늘 이끼 낀 돌담을 지나쳤어요'
          : 'Write about your moment in English...\nExample: I saw baby kittens playing today'}
        className="w-full h-28 p-4 rounded-2xl text-sm resize-none outline-none leading-relaxed"
        style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010', color: '#c5f07a' }}
      />

      {/* Suggest Button */}
      <button
        onClick={handleSuggest}
        disabled={text.length < 5 || loading}
        className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{
          background: text.length >= 5 ? '#2a7a0a' : 'rgba(20,50,8,0.5)',
          color: text.length >= 5 ? '#c5f07a' : '#3a5a18',
          cursor: text.length < 5 ? 'not-allowed' : 'pointer',
        }}>
        {loading ? '✨ AI가 생각하는 중...' : '✨ AI 제안 보기'}
      </button>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 slide-up">
          <p className="text-[#8ab84a] text-xs font-semibold">
            {mode === 'korean' ? '이렇게 영어로 표현할 수 있어요!' : '더 자연스러운 표현이에요!'}
          </p>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setSelected(s === selected ? null : s)}
              className="w-full text-left p-4 rounded-2xl text-sm transition-all active:scale-95"
              style={{
                background: selected === s ? 'rgba(42,120,16,0.6)' : 'rgba(20,50,8,0.8)',
                border: selected === s ? '2px solid #7dc84a' : '1px solid #2a5010',
                color: '#c5f07a',
              }}>
              <span className="text-[#4aaa20] mr-2 font-bold">{i + 1}.</span> {s}
              {selected === s && <span className="ml-2 text-[#7dc84a]">✓</span>}
            </button>
          ))}
          <button onClick={handleSave}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 mt-2"
            style={{ background: '#c84040', color: 'white' }}>
            기록 저장하기 🌿
          </button>
        </div>
      )}
    </div>
  );
}
