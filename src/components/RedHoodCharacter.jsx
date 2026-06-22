import { useState, useEffect } from 'react';

const DEFAULT_COLORS = {
  hair: '#4a2c0a',
  skin: '#f8d5b0',
  eyes: '#2a1a0a',
  outfit_top: '#4a8a20',
  outfit_bottom: '#2a4a8a',
  shoes: '#3a2a1a',
  cheeks: '#f0a0a0',
};

function ChibiSVG({ colors, size }) {
  // viewBox is 0 0 120 180; scale to fit size (width-based)
  const aspect = 180 / 120;
  const w = size;
  const h = Math.round(size * aspect);

  return (
    <svg width={w} height={h} viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rc-hair-depth" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="black" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="rc-skin-highlight" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rc-body-highlight" cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rc-shoe-highlight" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hair */}
      <ellipse cx="60" cy="48" rx="32" ry="36" fill={colors.hair} />
      <ellipse cx="60" cy="18" rx="12" ry="10" fill={colors.hair} />
      <ellipse cx="60" cy="48" rx="32" ry="36" fill="url(#rc-hair-depth)" />

      {/* Face */}
      <ellipse cx="60" cy="52" rx="26" ry="26" fill={colors.skin} />
      <ellipse cx="52" cy="44" rx="10" ry="8" fill="url(#rc-skin-highlight)" />

      {/* Cheeks */}
      <ellipse cx="44" cy="58" rx="7" ry="4" fill={colors.cheeks} opacity="0.6" />
      <ellipse cx="76" cy="58" rx="7" ry="4" fill={colors.cheeks} opacity="0.6" />

      {/* Eyes */}
      <ellipse cx="51" cy="50" rx="5" ry="6" fill={colors.eyes} />
      <ellipse cx="69" cy="50" rx="5" ry="6" fill={colors.eyes} />
      <circle cx="53" cy="47" r="1.5" fill="white" />
      <circle cx="71" cy="47" r="1.5" fill="white" />

      {/* Mouth */}
      <path d="M 54 63 Q 60 68 66 63" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Neck */}
      <rect x="54" y="74" width="12" height="10" fill={colors.skin} />

      {/* Outfit top */}
      <rect x="36" y="82" width="48" height="44" rx="8" fill={colors.outfit_top} />
      <rect x="20" y="84" width="18" height="30" rx="6" fill={colors.outfit_top} />
      <rect x="82" y="84" width="18" height="30" rx="6" fill={colors.outfit_top} />
      <ellipse cx="54" cy="92" rx="18" ry="12" fill="url(#rc-body-highlight)" />

      {/* Hands */}
      <ellipse cx="29" cy="116" rx="9" ry="7" fill={colors.skin} />
      <ellipse cx="91" cy="116" rx="9" ry="7" fill={colors.skin} />

      {/* Outfit bottom */}
      <rect x="40" y="120" width="40" height="32" rx="4" fill={colors.outfit_bottom} />
      <rect x="40" y="140" width="17" height="20" rx="4" fill={colors.outfit_bottom} />
      <rect x="63" y="140" width="17" height="20" rx="4" fill={colors.outfit_bottom} />
      <ellipse cx="58" cy="128" rx="14" ry="8" fill="url(#rc-body-highlight)" />

      {/* Shoes */}
      <ellipse cx="48" cy="164" rx="12" ry="8" fill={colors.shoes} />
      <ellipse cx="72" cy="164" rx="12" ry="8" fill={colors.shoes} />
      <ellipse cx="44" cy="160" rx="6" ry="3" fill="url(#rc-shoe-highlight)" />
      <ellipse cx="68" cy="160" rx="6" ry="3" fill="url(#rc-shoe-highlight)" />
    </svg>
  );
}

export default function RedHoodCharacter({ size = 135, mood = 'sunny' }) {
  const [charColors, setCharColors] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('slowrunner_char_colors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setCharColors(parsed);
        }
      }
    } catch {}
  }, []);

  if (charColors) {
    const colors = { ...DEFAULT_COLORS, ...charColors };
    return <ChibiSVG colors={colors} size={size} />;
  }

  // Eyes based on mood
  const renderEyes = () => {
    if (mood === 'fog') {
      return (
        <>
          <ellipse cx="35" cy="43" rx="2" ry="2.5" fill="#3a2010" />
          <ellipse cx="43" cy="43" rx="2" ry="2.5" fill="#3a2010" />
          <circle cx="34" cy="42" r="0.8" fill="white" />
          <circle cx="42" cy="42" r="0.8" fill="white" />
        </>
      );
    }
    if (mood === 'sunset') {
      return (
        <>
          <ellipse cx="36" cy="43" rx="2.2" ry="2.8" fill="#3a2010" />
          <ellipse cx="44" cy="43" rx="2.2" ry="2.8" fill="#3a2010" />
          <circle cx="37" cy="42" r="1" fill="white" />
          <circle cx="45" cy="42" r="1" fill="white" />
          <text x="28" y="40" fontSize="4" fill="#f5c842">✦</text>
          <text x="49" y="40" fontSize="4" fill="#f5c842">✦</text>
        </>
      );
    }
    return (
      <>
        <ellipse cx="36" cy="43" rx="2" ry="2.5" fill="#3a2010" />
        <ellipse cx="44" cy="43" rx="2" ry="2.5" fill="#3a2010" />
        <circle cx="37" cy="42" r="0.8" fill="white" />
        <circle cx="45" cy="42" r="0.8" fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'sunny') {
      return <path d="M 34 49 Q 40 55 46 49" stroke="#c07050" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'rain') {
      return <path d="M 36 51 Q 40 48 44 51" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'fog') {
      return (
        <>
          <path d="M 36 50 Q 40 52 44 50" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="40" cy="51" rx="2.5" ry="1.2" fill="#c07050" opacity="0.3" />
        </>
      );
    }
    if (mood === 'sunset') {
      return <path d="M 35 49 Q 40 53 45 49" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    return <path d="M 36 49 Q 40 53 44 49" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {mood === 'rain' && (
        <g transform="translate(50, 20)">
          <path d="M 0 10 Q 12 0 24 10" fill="#4a8adc" stroke="#2a5a9a" strokeWidth="1" />
          <path d="M 0 10 Q 6 5 12 10 Q 18 5 24 10" fill="#3a78c8" />
          <line x1="12" y1="10" x2="12" y2="24" stroke="#2a5a9a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 12 24 Q 12 28 9 28" stroke="#2a5a9a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      <ellipse cx="40" cy="58" rx="18" ry="16" fill="#c84040" />
      <path d="M 24 58 Q 40 72 56 58" fill="#a03030" />
      <ellipse cx="40" cy="44" rx="12" ry="13" fill="#f5c9a0" />
      {renderEyes()}
      {renderMouth()}
      <ellipse cx="33" cy="48" rx="3" ry="2" fill="#e8907a" opacity="0.5" />
      <ellipse cx="47" cy="48" rx="3" ry="2" fill="#e8907a" opacity="0.5" />
      <ellipse cx="40" cy="38" rx="15" ry="12" fill="#c84040" />
      <polygon points="40,10 28,38 52,38" fill="#c84040" />
      <polygon points="40,10 30,34 50,34" fill="#a03030" />
      <ellipse cx="40" cy="37" rx="16" ry="4" fill="#a03030" />
      <rect x="53" y="54" width="10" height="8" rx="2" fill="#8B6914" />
      <path d="M 53 54 Q 58 48 63 54" stroke="#8B6914" strokeWidth="2" fill="none" />
      <rect x="34" y="72" width="5" height="8" rx="2" fill="#f5c9a0" />
      <rect x="41" y="72" width="5" height="8" rx="2" fill="#f5c9a0" />
      <ellipse cx="36" cy="80" rx="4" ry="2" fill="#5c3a1e" />
      <ellipse cx="43" cy="80" rx="4" ry="2" fill="#5c3a1e" />
    </svg>
  );
}
