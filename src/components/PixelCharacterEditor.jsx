import { useState, useRef } from 'react';

const COLS = 12;
const FACE_ROWS = 8;   // 얼굴
const BODY_ROWS = 8;   // 몸통
const TOTAL_ROWS = FACE_ROWS + BODY_ROWS;
const CELL = 22; // px per pixel

// 캐릭터 모양 마스크: 1=얼굴, 2=몸통, 0=바깥(회색)
const MASK = (() => {
  const grid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(0));
  // 얼굴: 가운데 원형 영역 (rows 0-7, cols 2-9)
  for (let r = 0; r < FACE_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = (COLS - 1) / 2, cy = (FACE_ROWS - 1) / 2;
      const dx = (c - cx) / 4, dy = (r - cy) / 4;
      if (dx * dx + dy * dy <= 1) grid[r][c] = 1;
    }
  }
  // 몸통: 가운데 직사각형 (rows 8-15, cols 3-8)
  for (let r = FACE_ROWS; r < TOTAL_ROWS; r++) {
    for (let c = 2; c < COLS - 2; c++) {
      grid[r][c] = 2;
    }
  }
  return grid;
})();

const PALETTE = [
  '#f8d5b0','#e8a878','#c87840','#8b4513',
  '#1a1a1a','#ffffff','#4a2c0a','#d4a050',
  '#c84040','#4a8a20','#2a4a8a','#9a4ab8',
  '#f0c030','#40a0c8','#f0a0a0','#3a2a1a',
];

function makeEmpty() {
  return Array.from({ length: TOTAL_ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      if (MASK[r][c] === 1) return '#f8d5b0'; // 기본 피부색
      if (MASK[r][c] === 2) return '#4a8a20'; // 기본 몸통색
      return null;
    })
  );
}

export default function PixelCharacterEditor() {
  const [pixels, setPixels] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('slowrunner_pixel_v2') || 'null');
      return saved || makeEmpty();
    } catch { return makeEmpty(); }
  });
  const [color, setColor] = useState('#4a2c0a');
  const [savedMsg, setSavedMsg] = useState('');
  const painting = useRef(false);

  const paint = (r, c) => {
    if (MASK[r][c] === 0) return; // 바깥 영역은 칠 안 됨
    setPixels(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = color;
      return next;
    });
  };

  const handlePointerDown = (r, c, e) => {
    e.preventDefault();
    painting.current = true;
    paint(r, c);
  };
  const handlePointerEnter = (r, c, e) => {
    if (!painting.current) return;
    e.preventDefault();
    paint(r, c);
  };
  const handlePointerUp = () => { painting.current = false; };

  const handleSave = () => {
    localStorage.setItem('slowrunner_pixel_v2', JSON.stringify(pixels));
    // 홈 캐릭터용 색상 요약도 저장
    localStorage.removeItem('slowrunner_char_colors');
    setSavedMsg('저장됐어요! ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const handleReset = () => {
    setPixels(makeEmpty());
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <p style={{ color: '#3a3530', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
        내 캐릭터 꾸미기 🎨
      </p>

      {/* 픽셀 캐릭터 그리드 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}
        onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        {/* 얼굴 라벨 */}
        <div style={{ fontSize: 10, color: '#9a9088', alignSelf: 'flex-start',
          marginLeft: (COLS * CELL - COLS * CELL) / 2 + 2, marginBottom: 2 }}>얼굴</div>
        {pixels.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((px, c) => {
              const zone = MASK[r][c];
              return (
                <div key={c}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  onPointerEnter={(e) => handlePointerEnter(r, c, e)}
                  style={{
                    width: CELL, height: CELL,
                    background: zone === 0 ? 'transparent' : (px || '#f0ece4'),
                    border: zone === 0 ? 'none' : '0.5px solid rgba(0,0,0,0.08)',
                    boxSizing: 'border-box',
                    cursor: zone === 0 ? 'default' : 'crosshair',
                    borderRadius: zone === 1 && (r === 0 || r === FACE_ROWS - 1) ? 2 : 0,
                    // 영역 구분선
                    borderTop: r === FACE_ROWS && zone !== 0 ? '2px solid rgba(0,0,0,0.15)' : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
        {/* 몸통 라벨 */}
        <div style={{ fontSize: 10, color: '#9a9088', alignSelf: 'flex-start', marginTop: 2 }}>몸통</div>
      </div>

      {/* 색상 팔레트 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, marginBottom: 12 }}>
        {PALETTE.map(c => (
          <div key={c} onClick={() => setColor(c)}
            style={{
              height: 28, borderRadius: 6, background: c, cursor: 'pointer',
              border: color === c ? '2.5px solid #4a8a20' : '1.5px solid #d0ccc8',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      {/* 현재 색상 표시 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: color,
          border: '1.5px solid #d0ccc8' }} />
        <span style={{ fontSize: 11, color: '#9a9088' }}>선택한 색으로 탭해서 칠해요</span>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleReset}
          style={{ flex: 1, padding: '9px 0', borderRadius: 14, border: '1px solid #e0dbd2',
            background: '#f8f6f2', color: '#7a7268', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          초기화
        </button>
        <button onClick={handleSave}
          style={{ flex: 2, padding: '9px 0', borderRadius: 14, border: '1.5px solid #c8e8a0',
            background: savedMsg ? '#edf5e4' : '#4a8a20',
            color: savedMsg ? '#4a8a20' : '#ffffff',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
          {savedMsg || '저장하기'}
        </button>
      </div>
    </div>
  );
}
