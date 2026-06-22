import { useState } from 'react';

const DEFAULT_COLORS = {
  hair: '#4a2c0a',
  skin: '#f8d5b0',
  eyes: '#2a1a0a',
  outfit_top: '#4a8a20',
  outfit_bottom: '#2a4a8a',
  shoes: '#3a2a1a',
  cheeks: '#f0a0a0',
};

const PALETTE = [
  '#f8d5b0', '#e8a878', '#c87840', '#8b4513',
  '#1a1a1a', '#ffffff', '#4a2c0a', '#d4a050',
  '#c84040', '#4a8a20', '#2a4a8a', '#9a4ab8',
  '#f0c030', '#40a0c8', '#d46080', '#3a2a1a',
];

function ChibiCharacter({ colors, activeZone, onZoneClick }) {
  const zoneProps = (zone) => ({
    onClick: () => onZoneClick(zone),
    style: { cursor: 'pointer' },
    stroke: activeZone === zone ? '#4a8a20' : 'none',
    strokeWidth: 2,
  });

  return (
    <svg width="160" height="200" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hair-depth" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="black" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="skin-highlight" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="body-highlight" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="shoe-highlight" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── HAIR (back) ── */}
      <ellipse cx="60" cy="48" rx="32" ry="36" fill={colors.hair} {...zoneProps('hair')} />
      <ellipse cx="60" cy="18" rx="12" ry="10" fill={colors.hair} {...zoneProps('hair')} />
      <ellipse cx="60" cy="48" rx="32" ry="36" fill="url(#hair-depth)" style={{ pointerEvents: 'none' }} />

      {/* ── FACE / SKIN ── */}
      <ellipse cx="60" cy="52" rx="26" ry="26" fill={colors.skin} {...zoneProps('skin')} />
      <ellipse cx="52" cy="44" rx="10" ry="8" fill="url(#skin-highlight)" style={{ pointerEvents: 'none' }} />

      {/* ── CHEEKS ── */}
      <ellipse cx="44" cy="58" rx="7" ry="4" fill={colors.cheeks} opacity="0.6" {...zoneProps('cheeks')} />
      <ellipse cx="76" cy="58" rx="7" ry="4" fill={colors.cheeks} opacity="0.6" {...zoneProps('cheeks')} />

      {/* ── EYES ── */}
      <ellipse cx="51" cy="50" rx="5" ry="6" fill={colors.eyes} {...zoneProps('eyes')} />
      <ellipse cx="69" cy="50" rx="5" ry="6" fill={colors.eyes} {...zoneProps('eyes')} />
      <circle cx="53" cy="47" r="1.5" fill="white" style={{ pointerEvents: 'none' }} />
      <circle cx="71" cy="47" r="1.5" fill="white" style={{ pointerEvents: 'none' }} />

      {/* ── MOUTH (fixed) ── */}
      <path d="M 54 63 Q 60 68 66 63" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" style={{ pointerEvents: 'none' }} />

      {/* ── NECK ── */}
      <rect x="54" y="74" width="12" height="10" fill={colors.skin} style={{ pointerEvents: 'none' }} />

      {/* ── OUTFIT TOP ── */}
      <rect x="36" y="82" width="48" height="44" rx="8" fill={colors.outfit_top} {...zoneProps('outfit_top')} />
      <rect x="20" y="84" width="18" height="30" rx="6" fill={colors.outfit_top} {...zoneProps('outfit_top')} />
      <rect x="82" y="84" width="18" height="30" rx="6" fill={colors.outfit_top} {...zoneProps('outfit_top')} />
      <ellipse cx="54" cy="92" rx="18" ry="12" fill="url(#body-highlight)" style={{ pointerEvents: 'none' }} />

      {/* ── HANDS ── */}
      <ellipse cx="29" cy="116" rx="9" ry="7" fill={colors.skin} {...zoneProps('skin')} />
      <ellipse cx="91" cy="116" rx="9" ry="7" fill={colors.skin} {...zoneProps('skin')} />

      {/* ── OUTFIT BOTTOM ── */}
      <rect x="40" y="120" width="40" height="32" rx="4" fill={colors.outfit_bottom} {...zoneProps('outfit_bottom')} />
      <rect x="40" y="140" width="17" height="20" rx="4" fill={colors.outfit_bottom} {...zoneProps('outfit_bottom')} />
      <rect x="63" y="140" width="17" height="20" rx="4" fill={colors.outfit_bottom} {...zoneProps('outfit_bottom')} />
      <ellipse cx="58" cy="128" rx="14" ry="8" fill="url(#body-highlight)" style={{ pointerEvents: 'none' }} />

      {/* ── SHOES ── */}
      <ellipse cx="48" cy="164" rx="12" ry="8" fill={colors.shoes} {...zoneProps('shoes')} />
      <ellipse cx="72" cy="164" rx="12" ry="8" fill={colors.shoes} {...zoneProps('shoes')} />
      <ellipse cx="44" cy="160" rx="6" ry="3" fill="url(#shoe-highlight)" style={{ pointerEvents: 'none' }} />
      <ellipse cx="68" cy="160" rx="6" ry="3" fill="url(#shoe-highlight)" style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

export default function PixelCharacterEditor() {
  const [colors, setColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('slowrunner_char_colors') || 'null') || DEFAULT_COLORS;
    } catch {
      return DEFAULT_COLORS;
    }
  });
  const [selectedColor, setSelectedColor] = useState('#4a2c0a');
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

  const handleReset = () => {
    setColors(DEFAULT_COLORS);
    setActiveZone(null);
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <p style={{ color: '#3a3530', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
        내 캐릭터 꾸미기 🎨
      </p>

      {/* SVG Character */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <ChibiCharacter colors={colors} activeZone={activeZone} onZoneClick={handleZoneClick} />
      </div>

      {/* Hint */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9a9088', marginBottom: 12 }}>
        영역을 탭하고 색을 골라요
      </p>

      {/* Color palette */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', gap: 4, marginBottom: 14, justifyContent: 'center' }}>
        {PALETTE.map((color) => (
          <div
            key={color}
            onClick={() => setSelectedColor(color)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: color,
              border: selectedColor === color ? '2.5px solid #4a8a20' : '1.5px solid #c0b8b0',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={handleReset}
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
    </div>
  );
}
