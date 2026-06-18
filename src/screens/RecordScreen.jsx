import { useState, useRef, useEffect } from 'react';
import { getSuggestions, analyzePhoto, getStoredKey } from '../utils/gemini';
import { saveRecord, loadRecords } from '../utils/storage';

const DRAFT_KEY = 'slowrunner_draft';
function saveDraft(data) { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } }
function clearDraft() { localStorage.removeItem(DRAFT_KEY); }

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

// 공유용 카드 캔버스 생성
async function generateShareImage(englishText, words) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  // Forest background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, '#1a3d0a');
  grad.addColorStop(1, '#0f2006');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 720);

  // Draw simple trees
  const drawTree = (x, y, h) => {
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(x - 6, y, 12, h * 0.4);
    ctx.fillStyle = '#3d7a1a';
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.7);
    ctx.lineTo(x - h * 0.3, y + h * 0.1);
    ctx.lineTo(x + h * 0.3, y + h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a8a20';
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.9);
    ctx.lineTo(x - h * 0.22, y - h * 0.3);
    ctx.lineTo(x + h * 0.22, y - h * 0.3);
    ctx.closePath();
    ctx.fill();
  };
  drawTree(80, 420, 200);
  drawTree(640, 420, 180);
  drawTree(180, 480, 140);
  drawTree(540, 470, 150);

  // Card background
  ctx.fillStyle = 'rgba(10,24,4,0.85)';
  roundRect(ctx, 60, 180, 600, 360, 28);
  ctx.fill();
  ctx.strokeStyle = '#3a7a18';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 180, 600, 360, 28);
  ctx.stroke();

  // Slow Runner label
  ctx.fillStyle = '#7dc84a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 Slow Runner', 360, 230);

  // English text
  ctx.fillStyle = '#c5f07a';
  ctx.font = 'bold 26px system-ui, sans-serif';
  const lines = wrapText(ctx, englishText, 520, 26);
  lines.forEach((line, i) => {
    ctx.fillText(line, 360, 290 + i * 40);
  });

  // Word chips
  if (words.length > 0) {
    ctx.font = '18px system-ui, sans-serif';
    let wx = 360 - (words.slice(0, 3).join('  ').length * 5);
    words.slice(0, 3).forEach((w, i) => {
      const tw = ctx.measureText(w).width + 24;
      ctx.fillStyle = 'rgba(42,90,16,0.8)';
      roundRect(ctx, wx, 460, tw, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#c5f07a';
      ctx.textAlign = 'left';
      ctx.fillText(w, wx + 12, 481);
      wx += tw + 10;
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3a6a14';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('slowlearner-ashen.vercel.app', 360, 510);

  return canvas.toDataURL('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach(w => {
    const test = current ? current + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export default function RecordScreen() {
  const draft = loadDraft();
  const [mode, setMode] = useState(draft?.mode || 'korean');
  const [text, setText] = useState(draft?.text || '');
  const [photoUrl, setPhotoUrl] = useState(draft?.photoUrl || null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedWords, setSavedWords] = useState([]);
  const [savedText, setSavedText] = useState('');
  const [draftSaved, setDraftSaved] = useState(!!draft?.text);
  const [isFirstRecord, setIsFirstRecord] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!text && !photoUrl) return;
    saveDraft({ mode, text, photoUrl });
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [text, mode, photoUrl]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhotoUrl(dataUrl);
      setPhotoAnalysis(null);
      const hasKey = getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY;
      if (!hasKey) return;
      setPhotoAnalyzing(true);
      try {
        const result = await analyzePhoto(dataUrl);
        setPhotoAnalysis(result);
        if (result.sentence && !text) setText(result.sentence);
      } catch {
        // silent fail
      } finally {
        setPhotoAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSuggest = async () => {
    setError('');
    setLoading(true);
    setSuggestions([]);
    setSelected(null);
    try {
      const hasKey = getStoredKey() || import.meta.env.VITE_GEMINI_API_KEY;
      let result;
      if (!hasKey) {
        await new Promise(r => setTimeout(r, 800));
        result = DEMO_SUGGESTIONS[mode];
        setError('데모 모드예요. 설정에서 Gemini API 키를 입력하면 나만의 문장을 만들 수 있어요! ⚙️');
      } else {
        result = await getSuggestions(text, mode);
      }
      setSuggestions(result);
    } catch (e) {
      if (e.message === 'NO_KEY') {
        setError('설정에서 Gemini API 키를 입력해주세요. ⚙️');
      } else {
        setError('AI 제안을 가져오지 못했어요. 잠시 후 다시 시도해주세요.');
      }
      setSuggestions(DEMO_SUGGESTIONS[mode]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const existingRecords = loadRecords();
    const isFirst = existingRecords.length === 0;
    const englishText = selected || suggestions[0] || text;
    const words = englishText.match(/\b[a-zA-Z]{4,}\b/g)?.slice(0, 5) || [];
    saveRecord({ mood: 'sunny', photoUrl, koreanText: mode === 'korean' ? text : '', englishText, words });
    clearDraft();
    setSavedWords(words);
    setSavedText(englishText);
    setIsFirstRecord(isFirst);
    setSaved(true);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const dataUrl = await generateShareImage(savedText, savedWords);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'slowrunner.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Slow Runner 🌿', text: savedText });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'slowrunner.png';
        a.click();
      }
    } catch (e) {
      // user cancelled share
    } finally {
      setSharing(false);
    }
  };

  const handleReset = () => {
    clearDraft();
    setText('');
    setPhotoUrl(null);
    setSuggestions([]);
    setSelected(null);
    setSaved(false);
    setSavedWords([]);
    setSavedText('');
    setDraftSaved(false);
    setIsFirstRecord(false);
  };

  if (saved) {
    return (
      <div className="tab-content px-4 pt-6 pb-24 space-y-4">
        {/* First record special */}
        {isFirstRecord ? (
          <div className="text-center py-6 slide-up">
            <div className="text-6xl mb-3">🌱</div>
            <p className="text-[#c5f07a] text-2xl font-bold">첫 번째 보물 발견!</p>
            <p className="text-[#7dc84a] text-sm mt-2">숲에서 첫 발걸음을 내딛었어요</p>
            <p className="text-[#4a7a20] text-xs mt-1">앞으로 매일 조금씩 채워가요 🌿</p>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🌿</div>
            <p className="text-[#c5f07a] text-xl font-bold">기록 완료!</p>
            <p className="text-[#6aaa30] text-sm mt-1">오늘의 순간이 숲에 새겨졌어요</p>
          </div>
        )}

        {/* Saved sentence */}
        {savedText && (
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(42,90,16,0.5)', border: '1px solid #3a7a18' }}>
            <p className="text-[#c5f07a] text-sm font-medium leading-relaxed">{savedText}</p>
          </div>
        )}

        {/* Words */}
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

        {/* Share button */}
        <button onClick={handleShare} disabled={sharing}
          className="w-full py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ background: 'rgba(42,90,16,0.6)', color: '#c5f07a', border: '1px solid #3a7a18' }}>
          {sharing ? '⏳ 준비 중...' : '📤 카카오톡에 공유하기'}
        </button>

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
      <div className="flex items-center justify-between">
        <h2 className="text-[#c5f07a] font-bold text-lg">오늘의 기록</h2>
        {draftSaved && (
          <span className="text-[#4a8a20] text-xs fade-in">✓ 임시저장됨</span>
        )}
        {!draftSaved && draft?.text && text && (
          <span className="text-[#3a6a14] text-xs">임시저장 불러옴</span>
        )}
      </div>

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

      {/* Photo Analysis Result */}
      {photoAnalyzing && (
        <div className="p-3 rounded-2xl flex items-center gap-2 fade-in"
          style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #2a5010' }}>
          <span className="text-lg animate-spin">✨</span>
          <p className="text-[#6aaa30] text-sm">AI가 사진을 읽고 있어요...</p>
        </div>
      )}
      {photoAnalysis && !photoAnalyzing && (
        <div className="p-3 rounded-2xl space-y-2 slide-up"
          style={{ background: 'rgba(10,24,4,0.8)', border: '1px solid #3a7a18' }}>
          <p className="text-[#8ab84a] text-xs font-semibold">📷 사진 속 단어들</p>
          {photoAnalysis.scene && (
            <p className="text-[#6aaa30] text-xs">{photoAnalysis.scene}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {photoAnalysis.words?.map((w, i) => (
              <button key={i}
                onClick={() => setText(prev => prev ? prev + ' ' + w.english : w.english)}
                className="px-2.5 py-1 rounded-full text-xs transition-all active:scale-95"
                style={{ background: 'rgba(42,90,16,0.7)', border: '1px solid #3a7a18', color: '#c5f07a' }}>
                {w.english} <span className="text-[#4a8a20]">· {w.korean}</span>
              </button>
            ))}
          </div>
          <p className="text-[#3a6a14] text-xs">단어 탭하면 입력창에 추가돼요</p>
        </div>
      )}

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

      {error && <p className="text-yellow-500 text-xs text-center">{error}</p>}

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
