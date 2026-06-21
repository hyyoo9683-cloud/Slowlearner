import { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 16;
const CELL_SIZE = 20;
const STORAGE_KEY = 'slowrunner_pixel_character';

const PALETTE = [
  '#f8d5b0', '#e8a878', '#c87840', '#8b4513', '#1a1a1a', '#ffffff', '#e83030', '#3080e8',
  '#30c030', '#f0d000', '#c060d0', '#f08000', '#80c8f0', '#d4a0c0', '#806040', '#4a8a20',
];

function makeEmptyGrid() {
  return Array(GRID_SIZE * GRID_SIZE).fill(null);
}

export default function PixelCharacterEditor() {
  const [pixels, setPixels] = useState(makeEmptyGrid);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [painting, setPainting] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === GRID_SIZE * GRID_SIZE) {
          setPixels(parsed);
        }
      }
    } catch {}
  }, []);

  const paint = useCallback((idx) => {
    setPixels(prev => {
      const next = [...prev];
      next[idx] = isEraser ? null : selectedColor;
      return next;
    });
  }, [isEraser, selectedColor]);

  const handlePointerDown = (idx, e) => {
    e.preventDefault();
    setPainting(true);
    paint(idx);
  };

  const handlePointerEnter = (idx, e) => {
    if (painting) paint(idx);
  };

  const handlePointerUp = () => {
    setPainting(false);
  };

  const handleClear = () => {
    setPixels(makeEmptyGrid());
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pixels));
    setSavedMsg('저장됐어요! ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const previewSize = 48;
  const previewPixelSize = previewSize / GRID_SIZE;

  return (
    <div
      style={{ userSelect: 'none' }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <p style={{ color: '#3a3530', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
        내 캐릭터 꾸미기 🎨
      </p>

      {/* Palette */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', gap: 4, marginBottom: 10 }}>
        {PALETTE.map((color) => (
          <div
            key={color}
            onClick={() => { setSelectedColor(color); setIsEraser(false); }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: color,
              border: !isEraser && selectedColor === color
                ? '2.5px solid #4a8a20'
                : '1.5px solid #c0b8b0',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      {/* Selected color + eraser */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: isEraser ? 'transparent' : selectedColor,
          border: '1.5px solid #c0b8b0',
          backgroundImage: isEraser ? 'repeating-conic-gradient(#e0dbd2 0% 25%, #f8f6f2 0% 50%)' : undefined,
          backgroundSize: isEraser ? '8px 8px' : undefined,
        }} />
        <span style={{ fontSize: 12, color: '#7a7268' }}>
          {isEraser ? '지우개' : '선택된 색'}
        </span>
        <button
          onClick={() => setIsEraser(!isEraser)}
          style={{
            padding: '4px 12px',
            borderRadius: 10,
            border: isEraser ? '2px solid #4a8a20' : '1px solid #c0b8b0',
            background: isEraser ? '#edf5e4' : '#f8f6f2',
            color: isEraser ? '#4a8a20' : '#7a7268',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          지우개
        </button>
      </div>

      {/* Pixel grid */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gap: 1,
            background: '#e0dbd2',
            padding: 1,
            borderRadius: 4,
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        >
          {pixels.map((color, idx) => (
            <div
              key={idx}
              onPointerDown={(e) => handlePointerDown(idx, e)}
              onPointerEnter={(e) => handlePointerEnter(idx, e)}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background: color || '#faf8f3',
              }}
            />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        <button
          onClick={handleClear}
          style={{
            padding: '8px 20px',
            borderRadius: 14,
            border: '1px solid #e0dbd2',
            background: '#f8f6f2',
            color: '#7a7268',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          초기화
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 20px',
            borderRadius: 14,
            border: '1px solid #c8e8a0',
            background: savedMsg ? '#edf5e4' : '#4a8a20',
            color: savedMsg ? '#4a8a20' : '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {savedMsg || '저장하기'}
        </button>
      </div>

      {/* Preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: '#9a9088' }}>미리보기</span>
        <svg
          width={previewSize}
          height={previewSize}
          style={{ border: '1px solid #e0dbd2', borderRadius: 4 }}
        >
          <rect width={previewSize} height={previewSize} fill="#faf8f3" />
          {pixels.map((color, idx) => {
            if (!color) return null;
            const row = Math.floor(idx / GRID_SIZE);
            const col = idx % GRID_SIZE;
            return (
              <rect
                key={idx}
                x={col * previewPixelSize}
                y={row * previewPixelSize}
                width={previewPixelSize}
                height={previewPixelSize}
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
