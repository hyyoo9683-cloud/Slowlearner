import { useState, useRef, useEffect, useCallback } from 'react';
import { getSuggestions, analyzePhoto, analyzeArticle, proofreadText, getStoredKey } from '../utils/gemini';
import { saveRecord, loadRecords } from '../utils/storage';

const DRAFT_KEY = 'sandalog_draft';
function saveDraft(data) {
  try {
    const { photoUrl: _, ...rest } = data;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  } catch { }
}
function loadDraft() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; } }
function clearDraft() { localStorage.removeItem(DRAFT_KEY); }


async function generateShareImage(englishText, words) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, '#d4eac8');
  grad.addColorStop(1, '#f5f3ee');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 720, 720);

  const drawTree = (x, y, h) => {
    ctx.fillStyle = '#8a5a30';
    ctx.fillRect(x - 6, y, 12, h * 0.4);
    ctx.fillStyle = '#6aaa3a';
    ctx.beginPath();
    ctx.moveTo(x, y - h * 0.7);
    ctx.lineTo(x - h * 0.3, y + h * 0.1);
    ctx.lineTo(x + h * 0.3, y + h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a9a30';
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

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(ctx, 60, 180, 600, 360, 28);
  ctx.fill();
  ctx.strokeStyle = '#c8e8a0';
  ctx.lineWidth = 2;
  roundRect(ctx, 60, 180, 600, 360, 28);
  ctx.stroke();

  ctx.fillStyle = '#5a9a30';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 산들로그', 360, 230);

  ctx.fillStyle = '#3a3530';
  ctx.font = 'bold 26px system-ui, sans-serif';
  const lines = wrapText(ctx, englishText, 520, 26);
  lines.forEach((line, i) => {
    ctx.fillText(line, 360, 290 + i * 40);
  });

  if (words.length > 0) {
    ctx.font = '18px system-ui, sans-serif';
    let wx = 360 - (words.slice(0, 3).join('  ').length * 5);
    words.slice(0, 3).forEach((w, i) => {
      const tw = ctx.measureText(w).width + 24;
      ctx.fillStyle = '#edf5e4';
      roundRect(ctx, wx, 460, tw, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#4a8a20';
      ctx.textAlign = 'left';
      ctx.fillText(w, wx + 12, 481);
      wx += tw + 10;
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#b0a898';
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

export default function RecordScreen({ prefillText, onClearPrefill, onNavigate }) {
  const draft = loadDraft();
  const [showDraftBanner, setShowDraftBanner] = useState(!prefillText && !!draft?.text);
  const [mode, setMode] = useState(prefillText ? 'english' : (draft?.mode || 'korean'));
  const [text, setText] = useState(prefillText || '');

  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      setMode('english');
      onClearPrefill?.();
    }
  }, [prefillText]);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]); // 다중 선택 배열
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedWords, setSavedWords] = useState([]);
  const [savedText, setSavedText] = useState('');
  const [savedVocabulary, setSavedVocabulary] = useState([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isFirstRecord, setIsFirstRecord] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  // 원문 분석 모드
  const [articleText, setArticleText] = useState('');
  const [articleAnalysis, setArticleAnalysis] = useState(null);
  const [articleAnalyzing, setArticleAnalyzing] = useState(false);
  const [proofread, setProofread] = useState(null);
  const [proofreading, setProofreading] = useState(false);
  const fileRef = useRef();
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordLang, setRecordLang] = useState('ko-KR');
  const [speakingIdx, setSpeakingIdx] = useState(null);

  // Auto-save draft
  useEffect(() => {
    if (!text && !photoUrl) return;
    saveDraft({ mode, text, photoUrl });
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [text, mode, photoUrl]);

  // Auto-trigger AI suggestions (debounced) — not in article mode
  useEffect(() => {
    if (mode === 'article') return;
    if (text.length < 5) {
      setSuggestions([]);
      setSelected([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSuggest();
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [text, mode]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (croppedDataUrl) => {
    setCropSrc(null);
    try {
      const resized = await resizeImage(croppedDataUrl, 400, 0.6);
      setPhotoUrl(resized);
      setPhotoAnalysis(null);
      setPhotoAnalyzing(true);
      try {
        const forAI = await resizeImage(croppedDataUrl, 768, 0.9);
        const result = await analyzePhoto(forAI);
        setPhotoAnalysis(result);
        if (result.sentence && !text) setText(result.sentence);
      } catch {
        // AI 분석 실패해도 사진은 유지
      } finally {
        setPhotoAnalyzing(false);
      }
    } catch {
      setPhotoAnalyzing(false);
    }
  };

  const cropImgRef = useRef(null);
  const cropContainerRef = useRef(null);
  const dragRef = useRef(null); // { mode: 'move'|'resize', startX, startY, boxX, boxY, boxSize }
  // imgRect: 컨테이너 안에서 이미지가 실제 렌더되는 영역 (px)
  const [imgRect, setImgRect] = useState(null);
  // cropBox: { x, y, w, h } — imgRect 기준 px, 자유 비율
  const [cropBox, setCropBox] = useState(null);

  const initImgRect = () => {
    const img = cropImgRef.current;
    const con = cropContainerRef.current;
    if (!img || !con) return;
    const cw = con.offsetWidth;
    const ch = con.offsetHeight;
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const rw = img.naturalWidth * scale;
    const rh = img.naturalHeight * scale;
    const rx = (cw - rw) / 2;
    const ry = (ch - rh) / 2;
    const rect = { x: rx, y: ry, w: rw, h: rh };
    setImgRect(rect);
    // 초기값: 이미지 전체
    setCropBox({ x: rx, y: ry, w: rw, h: rh });
  };

  const getPoint = (e) => {
    const pt = e.touches ? e.touches[0] : e;
    const con = cropContainerRef.current;
    const cr = con.getBoundingClientRect();
    return { x: pt.clientX - cr.left, y: pt.clientY - cr.top };
  };

  // corner: 'tl'|'tr'|'bl'|'br' or null(=move)
  const handleCropPointerDown = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    const pt = getPoint(e);
    dragRef.current = { corner, startX: pt.x, startY: pt.y, box: { ...cropBox } };
  };

  const handleCropPointerMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!dragRef.current || !imgRect) return;
    const pt = getPoint(e);
    const dx = pt.x - dragRef.current.startX;
    const dy = pt.y - dragRef.current.startY;
    const { corner, box } = dragRef.current;
    const ir = imgRect;
    const MIN = 30;

    if (!corner) {
      // 이동
      const nx = Math.max(ir.x, Math.min(ir.x + ir.w - box.w, box.x + dx));
      const ny = Math.max(ir.y, Math.min(ir.y + ir.h - box.h, box.y + dy));
      setCropBox(b => ({ ...b, x: nx, y: ny }));
    } else {
      let { x, y, w, h } = box;
      if (corner === 'tl') {
        const nx = Math.max(ir.x, Math.min(x + w - MIN, x + dx));
        const ny = Math.max(ir.y, Math.min(y + h - MIN, y + dy));
        setCropBox({ x: nx, y: ny, w: x + w - nx, h: y + h - ny });
      } else if (corner === 'tr') {
        const nw = Math.max(MIN, Math.min(ir.x + ir.w - x, w + dx));
        const ny = Math.max(ir.y, Math.min(y + h - MIN, y + dy));
        setCropBox({ x, y: ny, w: nw, h: y + h - ny });
      } else if (corner === 'bl') {
        const nx = Math.max(ir.x, Math.min(x + w - MIN, x + dx));
        const nh = Math.max(MIN, Math.min(ir.y + ir.h - y, h + dy));
        setCropBox({ x: nx, y, w: x + w - nx, h: nh });
      } else if (corner === 'br') {
        const nw = Math.max(MIN, Math.min(ir.x + ir.w - x, w + dx));
        const nh = Math.max(MIN, Math.min(ir.y + ir.h - y, h + dy));
        setCropBox({ x, y, w: nw, h: nh });
      }
    }
  };

  const confirmCrop = () => {
    const img = cropImgRef.current;
    if (!img || !imgRect || !cropBox) return;
    const scaleX = img.naturalWidth / imgRect.w;
    const scaleY = img.naturalHeight / imgRect.h;
    const sx = (cropBox.x - imgRect.x) * scaleX;
    const sy = (cropBox.y - imgRect.y) * scaleY;
    const sw = cropBox.w * scaleX;
    const sh = cropBox.h * scaleY;
    const maxOut = 1200;
    const ratio = Math.min(maxOut / sw, maxOut / sh, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * ratio);
    canvas.height = Math.round(sh * ratio);
    canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    handleCropDone(canvas.toDataURL('image/jpeg', 0.9));
  };

  const resizeImage = (dataUrl, maxSize, quality = 0.8) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('이 브라우저는 음성 입력을 지원하지 않아요. Chrome을 사용해주세요.'); return; }

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const rec = new SR();
    rec.lang = recordLang;
    rec.continuous = true;
    rec.interimResults = true;
    recognitionRef.current = rec;

    let finalText = text;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      setText(finalText + interim);
    };
    rec.onerror = () => { setRecording(false); };
    rec.onend = () => { setRecording(false); setText(finalText); };
    rec.start();
    setRecording(true);
  };

  const audioRef = useRef(null);
  const speakText = async (txt, idx) => {
    // 이미 재생 중이면 중지
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (speakingIdx === idx) { setSpeakingIdx(null); return; }

    setSpeakingIdx(idx);
    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: txt }),
      });
      if (!resp.ok) throw new Error('tts failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeakingIdx(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeakingIdx(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      // Gemini TTS 실패 시 브라우저 TTS 폴백
      const utt = new SpeechSynthesisUtterance(txt);
      utt.lang = 'en-US';
      utt.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => v.lang.startsWith('en')) ;
      if (enVoice) utt.voice = enVoice;
      utt.onend = () => setSpeakingIdx(null);
      utt.onerror = () => setSpeakingIdx(null);
      window.speechSynthesis.speak(utt);
    }
  };

  const handleSuggest = async () => {
    setError('');
    setLoading(true);
    setSuggestions([]);
    setSelected([]);
    try {
      const result = await getSuggestions(text, mode);
      setSuggestions(result);
    } catch (e) {
      setError(`오류: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const existingRecords = loadRecords();
    const isFirst = existingRecords.length === 0;
    const chosenItems = selected.length > 0 ? selected : suggestions.slice(0, 1);
    const englishText = chosenItems.map(s => s.english || s.improved).filter(Boolean).join(' ') || text;
    const vocabItems = chosenItems.flatMap(s => s.vocabulary || []);
    const words = vocabItems.map(v => v.word).filter(Boolean).slice(0, 5);
    const fallbackWords = englishText.match(/\b[a-zA-Z]{4,}\b/g)?.slice(0, 5) || [];
    const finalWords = words.length > 0 ? words : fallbackWords;
    saveRecord({ mood: 'sunny', photoUrl, koreanText: mode === 'korean' ? text : '', englishText, words: finalWords });
    clearDraft();
    setSavedWords(finalWords);
    setSavedText(englishText);
    setSavedVocabulary(vocabItems);
    setIsFirstRecord(isFirst);
    setSaved(true);
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const dataUrl = await generateShareImage(savedText, savedWords);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'sandeullog.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '산들로그 🌿', text: savedText });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'sandeullog.png';
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
    setSelected([]);
    setSaved(false);
    setSavedWords([]);
    setSavedText('');
    setSavedVocabulary([]);
    setDraftSaved(false);
    setIsFirstRecord(false);
  };

  const handleRestoreDraft = () => {
    const d = loadDraft();
    if (d) {
      setText(d.text || '');
      setMode(d.mode || 'korean');
    }
    setShowDraftBanner(false);
  };

  const handleNewRecord = () => {
    clearDraft();
    setText('');
    setMode('korean');
    setShowDraftBanner(false);
  };

  if (saved) {
    return (
      <div className="tab-content px-4 pt-6 pb-24 space-y-4">
        <div className="text-center py-4 slide-up">
          <div className="text-5xl mb-2">🌿</div>
          <p className="text-[#3a3530] text-xl font-bold">오늘의 보물을 발견했어요!</p>
          {isFirstRecord && (
            <p className="text-[#6aaa3a] text-sm mt-1">첫 번째 발걸음을 내딛었어요 🌱</p>
          )}
        </div>

        {savedText && (
          <div className="p-4 rounded-2xl" style={{ background: '#edf5e4', border: '1.5px solid #c8e8a0' }}>
            <p className="text-[#3a3530] text-sm font-medium leading-relaxed">{savedText}</p>
          </div>
        )}

        {savedVocabulary.length > 0 && (
          <div>
            <p className="text-[#9a9088] text-xs font-semibold mb-2">오늘 배운 단어</p>
            <div className="flex flex-wrap gap-2">
              {savedVocabulary.map((v, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                  {v.word} <span style={{ color: '#7a9a60' }}>· {v.meaning}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {savedVocabulary.length === 0 && savedWords.length > 0 && (
          <div>
            <p className="text-[#9a9088] text-xs font-semibold mb-2">오늘 사용한 단어</p>
            <div className="flex flex-wrap gap-2">
              {savedWords.map((w, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-2xl text-center"
          style={{ background: '#fffbf0', border: '1px solid #e8d880' }}>
          <p className="text-[#a07820] text-xs">💡 오늘 배운 표현을 내일 대화에서 써보세요!</p>
        </div>

        <button onClick={handleShare} disabled={sharing}
          className="w-full py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{ background: '#ffffff', color: '#3a3530', border: '1px solid #e0dbd2', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {sharing ? '⏳ 준비 중...' : '📤 카카오톡에 공유하기'}
        </button>

        <div className="flex gap-2">
          <button onClick={() => onNavigate?.('home')}
            className="flex-1 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
            style={{ background: '#f8f6f2', color: '#7a7268', border: '1px solid #e0dbd2' }}>
            🏠 홈으로
          </button>
          <button onClick={handleReset}
            className="flex-1 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-all"
            style={{ background: '#edf5e4', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
            계속 기록하기
          </button>
        </div>
      </div>
    );
  }

  if (cropSrc) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#111' }}>
          <button onClick={() => { setCropSrc(null); setImgRect(null); setCropBox(null); }} className="text-white text-sm">취소</button>
          <p className="text-white text-sm font-semibold">사진 크롭</p>
          <button onClick={confirmCrop} className="text-[#6aaa3a] text-sm font-bold">완료</button>
        </div>
        <div
          ref={cropContainerRef}
          className="flex-1 relative overflow-hidden"
          style={{ touchAction: 'none' }}
          onMouseMove={handleCropPointerMove}
          onMouseUp={() => { dragRef.current = null; }}
          onTouchMove={handleCropPointerMove}
          onTouchEnd={() => { dragRef.current = null; }}
        >
          {/* 원본 이미지 — contain으로 전체 표시 */}
          <img
            ref={cropImgRef}
            src={cropSrc}
            alt=""
            className="absolute inset-0 w-full h-full select-none"
            style={{ objectFit: 'contain' }}
            draggable={false}
            onLoad={initImgRect}
          />
          {cropBox && imgRect && (
            <>
              {/* 어두운 오버레이 — 크롭 영역만 투명 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <defs>
                  <mask id="cm">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x={cropBox.x} y={cropBox.y} width={cropBox.w} height={cropBox.h} fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cm)" />
              </svg>
              {/* 크롭 박스 — 이동 */}
              <div
                className="absolute border-2 border-white"
                style={{ left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h, cursor: 'move', boxSizing: 'border-box' }}
                onMouseDown={e => handleCropPointerDown(e, null)}
                onTouchStart={e => handleCropPointerDown(e, null)}
              >
                {[1,2].map(n => <div key={`v${n}`} className="absolute top-0 bottom-0" style={{ left:`${n*33.3}%`, width:1, background:'rgba(255,255,255,0.35)' }} />)}
                {[1,2].map(n => <div key={`h${n}`} className="absolute left-0 right-0" style={{ top:`${n*33.3}%`, height:1, background:'rgba(255,255,255,0.35)' }} />)}
                {/* 네 모서리 핸들 */}
                {[['tl','0%','0%'],['tr','100%','0%'],['bl','0%','100%'],['br','100%','100%']].map(([c,l,t]) => (
                  <div key={c} className="absolute w-6 h-6 bg-white rounded-sm"
                    style={{ left:l, top:t, transform:'translate(-50%,-50%)', touchAction:'none' }}
                    onMouseDown={e => { e.stopPropagation(); handleCropPointerDown(e, c); }}
                    onTouchStart={e => { e.stopPropagation(); handleCropPointerDown(e, c); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <p className="text-center text-[#aaa] text-xs py-3">박스 이동 · 모서리로 크기 조절</p>
      </div>
    );
  }

  return (
    <div className="tab-content px-4 pt-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[#3a3530] font-bold text-lg">오늘의 기록</h2>
        {draftSaved && (
          <span className="text-[#6aaa3a] text-xs fade-in">✓ 임시저장됨</span>
        )}
      </div>

      {/* Draft restore banner */}
      {showDraftBanner && (
        <div className="p-3 rounded-2xl slide-up"
          style={{ background: '#fffbf0', border: '1.5px solid #e8d880' }}>
          <p className="text-[#7a5a20] text-sm font-medium mb-2">이전에 쓰던 기록이 있어요. 이어서 쓸까요?</p>
          <div className="flex gap-2">
            <button onClick={handleRestoreDraft}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#f5e070', color: '#6a4a10', border: '1px solid #d8c040' }}>
              이어쓰기
            </button>
            <button onClick={handleNewRecord}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#f8f6f2', color: '#9a9088', border: '1px solid #e0dbd2' }}>
              새로 쓰기
            </button>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex rounded-2xl overflow-hidden"
        style={{ background: '#f0ece4', border: '1px solid #e0dbd2' }}>
        {[
          { id: 'korean', label: '한국어로' },
          { id: 'english', label: '영어로' },
          { id: 'article', label: '📄 원문 분석' },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setSuggestions([]); setSelected([]); setArticleAnalysis(null); setProofread(null); }}
            className="flex-1 py-2.5 text-xs font-semibold transition-all"
            style={{
              background: mode === m.id ? '#ffffff' : 'transparent',
              color: mode === m.id ? '#3a3530' : '#9a9088',
              boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* 원문 분석 모드 */}
      {mode === 'article' && (
        <div className="space-y-3">
          <textarea
            value={articleText}
            onChange={e => setArticleText(e.target.value)}
            placeholder={'영어 기사나 글을 여기에 붙여넣어요...\n\nPaste any English article or text here.'}
            className="w-full h-36 p-4 rounded-2xl text-sm resize-none outline-none leading-relaxed"
            style={{ background: '#ffffff', border: '1px solid #e0dbd2', color: '#3a3530' }}
          />
          <button
            onClick={async () => {
              setArticleAnalyzing(true);
              setArticleAnalysis(null);
              try {
                const result = await analyzeArticle(articleText);
                setArticleAnalysis(result);
              } catch (e) {
                setError(e.message);
              } finally {
                setArticleAnalyzing(false);
              }
            }}
            disabled={articleText.length < 20 || articleAnalyzing}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: articleText.length >= 20 ? '#edf5e4' : '#f8f6f2',
              color: articleText.length >= 20 ? '#4a8a20' : '#c0b8b0',
              border: articleText.length >= 20 ? '1.5px solid #c8e8a0' : '1px solid #e8e4dc',
            }}>
            {articleAnalyzing ? '✨ 분석 중...' : '✨ AI 분석하기'}
          </button>

          {articleAnalysis && (
            <div className="space-y-3 slide-up">
              {/* 주제 + 난이도 */}
              <div className="flex gap-2 items-center">
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: '#edf5e4', color: '#4a8a20', border: '1px solid #c8e8a0' }}>
                  {articleAnalysis.topic}
                </span>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: '#f8f6f2', color: '#9a9088', border: '1px solid #e0dbd2' }}>
                  {articleAnalysis.level === 'easy' ? '🟢 쉬움' : articleAnalysis.level === 'medium' ? '🟡 중간' : '🔴 어려움'}
                </span>
              </div>

              {/* 한/영 요약 */}
              <div className="p-3 rounded-2xl space-y-2"
                style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
                <p className="text-[#9a9088] text-xs font-semibold">요약</p>
                {articleAnalysis.koSummary?.map((s, i) => (
                  <div key={i}>
                    <p className="text-[#5a5550] text-xs leading-relaxed">
                      <span className="text-[#6aaa3a] mr-1">·</span>{s}
                    </p>
                    {articleAnalysis.enSummary?.[i] && (
                      <p className="text-[#a0a898] text-xs leading-relaxed ml-3 italic">
                        {articleAnalysis.enSummary[i]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 핵심 단어 */}
              {articleAnalysis.words?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[#9a9088] text-xs font-semibold">핵심 단어</p>
                  {articleAnalysis.words.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl"
                      style={{ background: '#ffffff', border: '1px solid #ede9e2' }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#3a3530] text-sm font-semibold">{w.english}</span>
                        <span className="text-[#9a9088] text-xs">· {w.korean}</span>
                      </div>
                      {w.example && <p className="text-[#b0a898] text-xs italic">{w.example}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* 내 글 쓰기 + 첨삭 */}
              <div className="space-y-2 pt-1">
                <p className="text-[#9a9088] text-xs font-semibold">✏️ 내가 직접 요약해볼게요</p>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Write a short summary or your thoughts in English..."
                  className="w-full h-24 p-4 rounded-2xl text-sm resize-none outline-none leading-relaxed"
                  style={{ background: '#ffffff', border: '1px solid #e0dbd2', color: '#3a3530' }}
                />
                {proofread && (
                  <div className="p-3 rounded-2xl space-y-2 slide-up"
                    style={{ background: '#fffbf0', border: '1.5px solid #e8d880' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-[#a07820] text-xs font-semibold">AI 첨삭 결과</p>
                      <span className="text-sm font-bold" style={{ color: proofread.score >= 80 ? '#4a8a20' : '#c08030' }}>
                        {proofread.score}점
                      </span>
                    </div>
                    {proofread.good && (
                      <p className="text-[#4a8a20] text-xs">👍 {proofread.good}</p>
                    )}
                    {proofread.corrected && proofread.corrected !== text && (
                      <div>
                        <p className="text-[#9a9088] text-[10px] mb-1">교정된 문장</p>
                        <p className="text-[#3a3530] text-xs leading-relaxed p-2 rounded-xl"
                          style={{ background: '#ffffff', border: '1px solid #e8d880' }}>
                          {proofread.corrected}
                        </p>
                        <button onClick={() => setText(proofread.corrected)}
                          className="text-[#6aaa3a] text-xs mt-1 underline">
                          이걸로 바꾸기
                        </button>
                      </div>
                    )}
                    {proofread.feedback?.map((f, i) => (
                      <p key={i} className="text-[#7a7268] text-xs leading-relaxed">
                        <span className="text-[#c08030] mr-1">·</span>{f}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setProofreading(true);
                      setProofread(null);
                      try {
                        const result = await proofreadText(articleText, text);
                        setProofread(result);
                      } catch (e) {
                        setError(e.message);
                      } finally {
                        setProofreading(false);
                      }
                    }}
                    disabled={text.length < 5 || proofreading}
                    className="py-3 px-4 rounded-2xl text-xs font-semibold transition-all active:scale-95"
                    style={{
                      background: text.length >= 5 ? '#fffbf0' : '#f8f6f2',
                      color: text.length >= 5 ? '#a07820' : '#c0b8b0',
                      border: text.length >= 5 ? '1px solid #e8d880' : '1px solid #e8e4dc',
                    }}>
                    {proofreading ? '⏳' : '✏️ 첨삭받기'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={text.length < 2}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                    style={{
                      background: text.length >= 2 ? '#c84040' : '#f0ece4',
                      color: text.length >= 2 ? 'white' : '#c0b8b0',
                    }}>
                    기록 저장하기 🌿
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Upload — 원문 분석 모드에서는 숨김 */}
      {mode === 'article' ? null : <button onClick={() => fileRef.current?.click()}
        className="w-full rounded-2xl overflow-hidden transition-all active:scale-95"
        style={{ border: '2px dashed #d0e8b0', background: '#fafdf6' }}>
        {photoUrl ? (
          <img src={photoUrl} alt="preview" className="w-full h-40 object-cover" />
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">📷</span>
            <p className="text-[#9a9088] text-sm">사진 추가하기</p>
          </div>
        )}
      </button>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

      {photoAnalyzing && (
        <div className="p-3 rounded-2xl flex items-center gap-2 fade-in"
          style={{ background: '#f8f6f2', border: '1px solid #ede9e2' }}>
          <span className="text-lg animate-spin">✨</span>
          <p className="text-[#7a7268] text-sm">AI가 사진을 읽고 있어요...</p>
        </div>
      )}
      {photoAnalysis && !photoAnalyzing && (
        <div className="p-3 rounded-2xl space-y-2 slide-up"
          style={{ background: '#edf5e4', border: '1.5px solid #c8e8a0' }}>
          <p className="text-[#4a8a20] text-xs font-semibold">📷 사진 속 단어들</p>
          {photoAnalysis.scene && (
            <p className="text-[#7a7268] text-xs">{photoAnalysis.scene}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {photoAnalysis.words?.map((w, i) => (
              <button key={i}
                onClick={() => setText(prev => prev ? prev + ' ' + w.english : w.english)}
                className="px-2.5 py-1 rounded-full text-xs transition-all active:scale-95"
                style={{ background: '#ffffff', border: '1px solid #c8e8a0', color: '#4a8a20' }}>
                {w.english} <span className="text-[#9a9088]">· {w.korean}</span>
              </button>
            ))}
          </div>
          <p className="text-[#9a9088] text-xs">단어 탭하면 입력창에 추가돼요</p>
        </div>
      )}

      {mode !== 'article' && (
        <div className="relative">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={mode === 'korean'
              ? '오늘 어떤 순간이 있었나요? 한국어로 적어보세요...\n예: 오늘 이끼 낀 돌담을 지나쳤어요'
              : 'Write about your moment in English...\nExample: I saw baby kittens playing today'}
            className="w-full h-28 p-4 pr-14 rounded-2xl text-sm resize-none outline-none leading-relaxed"
            style={{ background: '#ffffff', border: recording ? '2px solid #e05050' : '1px solid #e0dbd2', color: '#3a3530' }}
          />
          <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1">
            <button
              onClick={toggleRecording}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: recording ? '#e05050' : '#edf5e4',
                boxShadow: recording ? '0 0 0 4px rgba(224,80,80,0.2)' : '0 1px 4px rgba(0,0,0,0.1)',
              }}
              title={recording ? '녹음 중지' : '음성 입력'}>
              {recording ? '⏹' : '🎙️'}
            </button>
            {recording && (
              <button
                onClick={() => setRecordLang(l => l === 'ko-KR' ? 'en-US' : 'ko-KR')}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: '#fff0f0', color: '#e05050', border: '1px solid #f8c0c0' }}>
                {recordLang === 'ko-KR' ? '한' : 'EN'}
              </button>
            )}
          </div>
          {recording && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[#e05050] text-xs">
                녹음 중 · {recordLang === 'ko-KR' ? '한국어' : 'English'}
                <span className="text-[#b0a898] ml-1">— 탭해서 언어 전환</span>
              </span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[#c08030] text-xs text-center">{error}</p>}

      {/* AI 로딩 인디케이터 */}
      {mode !== 'article' && loading && text.length >= 5 && (
        <div className="flex items-center gap-2 px-1 fade-in">
          <span className="text-[#6aaa3a] text-sm">🌿</span>
          <p className="text-[#6aaa3a] text-sm">표현을 찾고 있어요<span className="animate-pulse">...</span></p>
        </div>
      )}

      {/* AI 제안 버블 */}
      {mode !== 'article' && suggestions.length > 0 && (
        <div className="space-y-2 slide-up">
          <div className="flex items-center justify-between">
            <p className="text-[#9a9088] text-xs font-semibold">
              {mode === 'korean' ? '이렇게 영어로 표현할 수 있어요!' : '더 자연스러운 표현이에요!'}
            </p>
            {selected.length > 0 && (
              <button
                onClick={() => speakText(selected.map(s => s.english || s.improved).filter(Boolean).join(' '), 'all')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95"
                style={{ background: speakingIdx === 'all' ? '#edf5e4' : '#f0f7e8', color: '#4a8a20', border: '1.5px solid #c8e8a0' }}>
                {speakingIdx === 'all' ? '🔊' : '▶'} {selected.length}개 이어 듣기
              </button>
            )}
          </div>
          {suggestions.map((s, i) => {
            const isSelected = selected.includes(s);
            const mainText = s.english || s.improved || '';
            const vocabItems = s.vocabulary || [];
            const changes = s.changes || [];
            return (
              <button key={i} onClick={() => setSelected(prev => isSelected ? prev.filter(x => x !== s) : [...prev, s])}
                className="w-full text-left p-4 rounded-2xl text-sm transition-all active:scale-95 space-y-2"
                style={{
                  background: isSelected ? '#edf5e4' : '#ffffff',
                  border: isSelected ? '2px solid #6aaa3a' : '1px solid #e0dbd2',
                  outline: isSelected ? 'none' : 'none',
                  color: '#3a3530',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="leading-relaxed font-medium flex-1">
                    <span className="text-[#6aaa3a] mr-1.5 font-bold">{i + 1}.</span>{mainText}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); speakText(mainText, i); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{ background: speakingIdx === i ? '#edf5e4' : '#f8f6f2', border: speakingIdx === i ? '1.5px solid #6aaa3a' : '1px solid #e0dbd2' }}
                      title="발음 듣기">
                      <span className="text-xs">{speakingIdx === i ? '🔊' : '▶'}</span>
                    </button>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: '#6aaa3a', color: 'white' }}>
                        {selected.indexOf(s) + 1}
                      </span>
                    )}
                  </div>
                </div>
                {s.korean_translation && (
                  <p className="text-[#7a8a70] text-xs leading-relaxed pl-4">
                    🇰🇷 {s.korean_translation}
                  </p>
                )}
                {vocabItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-4">
                    {vocabItems.map((v, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-full text-[11px]"
                        style={{ background: isSelected ? '#d4edc4' : '#f0ece4', color: '#5a7a40', border: 'none' }}>
                        {v.word} · {v.meaning}
                      </span>
                    ))}
                  </div>
                )}
                {changes.length > 0 && (
                  <div className="space-y-0.5 pl-4">
                    {changes.map((c, j) => (
                      <p key={j} className="text-[11px] text-[#9a8878]">
                        <span className="line-through text-[#c09088]">{c.original}</span>
                        {' → '}
                        <span className="text-[#5a8a40] font-medium">{c.improved}</span>
                        {c.reason_korean && <span className="text-[#b0a898]"> · {c.reason_korean}</span>}
                      </p>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {mode !== 'article' && (
        <button
          onClick={handleSave}
          disabled={text.length < 2}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: text.length >= 2 ? '#c84040' : '#f0ece4',
            color: text.length >= 2 ? 'white' : '#c0b8b0',
          }}>
          {selected.length > 1 ? `${selected.length}개 문장으로 기록 저장하기 🌿` : '기록 저장하기 🌿'}
        </button>
      )}
    </div>
  );
}
