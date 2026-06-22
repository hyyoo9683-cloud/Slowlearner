import { useState } from 'react';

const DEFAULT_COLORS = {
  hair: '#4a2c0a',
  skin: '#f8d5b0',
  eyes: '#2a1a0a',
  cheeks: '#f0a0a0',
  body: '#4a8a20',
  limbs: '#3a2a1a',
};

const PALETTE = [
  '#f8d5b0', '#e8a878', '#c87840', '#8b4513',
  '#1a1a1a', '#ffffff', '#4a2c0a', '#d4a050',
  '#c84040', '#4a8a20', '#2a4a8a', '#9a4ab8',
  '#f0c030', '#40a0c8', '#d46080', '#3a2a1a',
];

// 픽셀 머리카락: 머리 원 위쪽에 찍히는 작은 정사각형들
const HAIR_PIXELS = [
  [38,8],[42,6],[46,4],[50,3],[54,3],[58,4],[62,6],[66,8],
  [36,12],[40,10],[44,8],[48,6],[52,5],[56,5],[60,7],[64,10],
];

function SimpleCharacter({ colors, activeZone, onZoneClick }) {
  const zone = (z) => ({
    onClick: () => onZoneClick(z),
    style: { cursor: 'pointer' },
    opacity: activeZone === z ? 0.85 : 1,
  });

  // 선택된 존 강조 테두리
  const outline = (z) => activeZone === z ? '#4a8a20' : 'none';

  return (
    <svg width="120" height="190" viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">

      {/* 픽셀 머리카락 */}
      {HAIR_PIXELS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={6} height={6}
          fill={colors.hair}
          stroke={outline('hair')} strokeWidth={activeZone === 'hair' ? 0.5 : 0}
          rx={1}
          onClick={() => onZoneClick('hair')}
          style={{ cursor: 'pointer' }}
        />
      ))}
      {/* 머리카락 앞쪽 픽셀 (이마 가리는 용도) */}
      {[[34,22],[38,18],[42,16],[46,14],[50,13],[54,13],[58,14],[62,16],[66,18],[70,22]].map(([x,y],i) => (
        <rect key={'f'+i} x={x} y={y} width={6} height={6}
          fill={colors.hair} rx={1}
          onClick={() => onZoneClick('hair')}
          style={{ cursor: 'pointer' }}
        />
      ))}

      {/* 얼굴 (원) */}
      <circle cx="52" cy="42" r="22"
        fill={colors.skin}
        stroke={outline('skin')} strokeWidth={activeZone === 'skin' ? 2 : 0}
        {...zone('skin')}
      />
      {/* 얼굴 하이라이트 */}
      <ellipse cx="44" cy="35" rx="7" ry="5" fill="white" opacity="0.25" style={{ pointerEvents: 'none' }} />

      {/* 볼 */}
      <ellipse cx="36" cy="46" rx="6" ry="3.5" fill={colors.cheeks} opacity="0.55"
        stroke={outline('cheeks')} strokeWidth={activeZone === 'cheeks' ? 1.5 : 0}
        {...zone('cheeks')}
      />
      <ellipse cx="68" cy="46" rx="6" ry="3.5" fill={colors.cheeks} opacity="0.55"
        stroke={outline('cheeks')} strokeWidth={activeZone === 'cheeks' ? 1.5 : 0}
        {...zone('cheeks')}
      />

      {/* 눈 */}
      <circle cx="44" cy="40" r="3.5" fill={colors.eyes}
        stroke={outline('eyes')} strokeWidth={activeZone === 'eyes' ? 1.5 : 0}
        {...zone('eyes')}
      />
      <circle cx="60" cy="40" r="3.5" fill={colors.eyes}
        stroke={outline('eyes')} strokeWidth={activeZone === 'eyes' ? 1.5 : 0}
        {...zone('eyes')}
      />
      <circle cx="45.5" cy="38.5" r="1" fill="white" style={{ pointerEvents: 'none' }} />
      <circle cx="61.5" cy="38.5" r="1" fill="white" style={{ pointerEvents: 'none' }} />

      {/* 입 */}
      <path d="M 46 50 Q 52 55 58 50" stroke="#c07050" strokeWidth="1.5" fill="none"
        strokeLinecap="round" style={{ pointerEvents: 'none' }} />

      {/* 목 */}
      <rect x="47" y="62" width="10" height="8" fill={colors.skin} style={{ pointerEvents: 'none' }} />

      {/* 몸통 (짧은 직사각형) */}
      <rect x="30" y="69" width="44" height="32" rx="5"
        fill={colors.body}
        stroke={outline('body')} strokeWidth={activeZone === 'body' ? 2 : 0}
        {...zone('body')}
      />
      {/* 몸통 하이라이트 */}
      <ellipse cx="44" cy="76" rx="10" ry="6" fill="white" opacity="0.15" style={{ pointerEvents: 'none' }} />

      {/* 팔 (선) */}
      <line x1="31" y1="73" x2="14" y2="98"
        stroke={colors.limbs} strokeWidth="5" strokeLinecap="round"
        stroke-linejoin="round"
        onClick={() => onZoneClick('limbs')} style={{ cursor: 'pointer' }}
        opacity={activeZone === 'limbs' ? 0.75 : 1}
      />
      <line x1="73" y1="73" x2="90" y2="98"
        stroke={colors.limbs} strokeWidth="5" strokeLinecap="round"
        onClick={() => onZoneClick('limbs')} style={{ cursor: 'pointer' }}
        opacity={activeZone === 'limbs' ? 0.75 : 1}
      />
      {/* 손 (작은 원) */}
      <circle cx="13" cy="101" r="4" fill={colors.skin} style={{ pointerEvents: 'none' }} />
      <circle cx="91" cy="101" r="4" fill={colors.skin} style={{ pointerEvents: 'none' }} />

      {/* 다리 (선) */}
      <line x1="43" y1="101" x2="38" y2="138"
        stroke={colors.limbs} strokeWidth="5" strokeLinecap="round"
        onClick={() => onZoneClick('limbs')} style={{ cursor: 'pointer' }}
        opacity={activeZone === 'limbs' ? 0.75 : 1}
      />
      <line x1="61" y1="101" x2="66" y2="138"
        stroke={colors.limbs} strokeWidth="5" strokeLinecap="round"
        onClick={() => onZoneClick('limbs')} style={{ cursor: 'pointer' }}
        opacity={activeZone === 'limbs' ? 0.75 : 1}
      />
      {/* 발 */}
      <ellipse cx="36" cy="141" rx="8" ry="5" fill={colors.limbs} style={{ pointerEvents: 'none' }} />
      <ellipse cx="68" cy="141" rx="8" ry="5" fill={colors.limbs} style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

export default function PixelCharacterEditor() {
  const [colors, setColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('slowrunner_char_colors') || 'null') || DEFAULT_COLORS; }
    catch { return DEFAULT_COLORS; }
  });
  const [selectedColor, setSelectedColor] = useState(PALETTE[6]);
  const [activeZone, setActiveZone] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  const handleZoneClick = (zone) => {
    setActiveZone(zone);
    setColors(prev => ({ ...prev, [zone]: selectedColor }));
  };

  const handleSave = () => {
    localStorage.setItem('slowrunner_char_colors', JSON.stringify(colors));
    localStorage.removeItem('slowrunner_pixel_character');
    setSavedMsg('저장됐어요! ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const ZONES = [
    { id: 'hair', label: '머리카락' },
    { id: 'skin', label: '피부' },
    { id: 'eyes', label: '눈' },
    { id: 'cheeks', label: '볼' },
    { id: 'body', label: '몸통' },
    { id: 'limbs', label: '팔·다리' },
  ];

  return (
    <div style={{ userSelect: 'none' }}>
      <p style={{ color: '#3a3530', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
        내 캐릭터 꾸미기 🎨
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* 캐릭터 */}
        <div style={{ flexShrink: 0 }}>
          <SimpleCharacter colors={colors} activeZone={activeZone} onZoneClick={handleZoneClick} />
        </div>

        {/* 존 선택 + 팔레트 */}
        <div style={{ flex: 1 }}>
          {/* 존 버튼 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {ZONES.map(z => (
              <button key={z.id} onClick={() => setActiveZone(activeZone === z.id ? null : z.id)}
                style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: activeZone === z.id ? '2px solid #4a8a20' : '1px solid #e0dbd2',
                  background: activeZone === z.id ? '#edf5e4' : '#f8f6f2',
                  color: activeZone === z.id ? '#4a8a20' : '#7a7268',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[z.id], display: 'inline-block', flexShrink: 0 }} />
                {z.label}
              </button>
            ))}
          </div>

          {/* 컬러 팔레트 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {PALETTE.map(color => (
              <div key={color} onClick={() => {
                setSelectedColor(color);
                if (activeZone) setColors(prev => ({ ...prev, [activeZone]: color }));
              }}
                style={{
                  height: 28, borderRadius: 6, background: color, cursor: 'pointer',
                  border: selectedColor === color ? '2.5px solid #4a8a20' : '1.5px solid #d0ccc8',
                  boxSizing: 'border-box',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#b0a898', margin: '8px 0 10px' }}>
        존 선택 후 색을 고르거나, 캐릭터를 직접 탭해요
      </p>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { setColors(DEFAULT_COLORS); setActiveZone(null); }}
          style={{ flex: 1, padding: '9px 0', borderRadius: 14, border: '1px solid #e0dbd2',
            background: '#f8f6f2', color: '#7a7268', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          초기화
        </button>
        <button onClick={handleSave}
          style={{ flex: 2, padding: '9px 0', borderRadius: 14, border: '1.5px solid #c8e8a0',
            background: savedMsg ? '#edf5e4' : '#4a8a20', color: savedMsg ? '#4a8a20' : '#ffffff',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
          {savedMsg || '저장하기'}
        </button>
      </div>
    </div>
  );
}
