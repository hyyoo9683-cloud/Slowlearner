import { useState, useEffect } from 'react';

const DEFAULT_COLORS = {
  hair: '#4a2c0a',
  skin: '#f8d5b0',
  eyes: '#2a1a0a',
  cheeks: '#f0a0a0',
  body: '#4a8a20',
  limbs: '#3a2a1a',
};

const HAIR_PIXELS = [
  [38,8],[42,6],[46,4],[50,3],[54,3],[58,4],[62,6],[66,8],
  [36,12],[40,10],[44,8],[48,6],[52,5],[56,5],[60,7],[64,10],
];

function CustomCharSVG({ colors, size }) {
  const scale = size / 120;
  const h = Math.round(190 * scale);
  return (
    <svg width={size} height={h} viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
      {HAIR_PIXELS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={6} height={6} fill={colors.hair} rx={1} />
      ))}
      {[[34,22],[38,18],[42,16],[46,14],[50,13],[54,13],[58,14],[62,16],[66,18],[70,22]].map(([x,y],i) => (
        <rect key={'f'+i} x={x} y={y} width={6} height={6} fill={colors.hair} rx={1} />
      ))}
      <circle cx="52" cy="42" r="22" fill={colors.skin} />
      <ellipse cx="44" cy="35" rx="7" ry="5" fill="white" opacity="0.25" />
      <ellipse cx="36" cy="46" rx="6" ry="3.5" fill={colors.cheeks} opacity="0.55" />
      <ellipse cx="68" cy="46" rx="6" ry="3.5" fill={colors.cheeks} opacity="0.55" />
      <circle cx="44" cy="40" r="3.5" fill={colors.eyes} />
      <circle cx="60" cy="40" r="3.5" fill={colors.eyes} />
      <circle cx="45.5" cy="38.5" r="1" fill="white" />
      <circle cx="61.5" cy="38.5" r="1" fill="white" />
      <path d="M 46 50 Q 52 55 58 50" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="47" y="62" width="10" height="8" fill={colors.skin} />
      <rect x="30" y="69" width="44" height="32" rx="5" fill={colors.body} />
      <ellipse cx="44" cy="76" rx="10" ry="6" fill="white" opacity="0.15" />
      <line x1="31" y1="73" x2="14" y2="98" stroke={colors.limbs} strokeWidth="5" strokeLinecap="round" />
      <line x1="73" y1="73" x2="90" y2="98" stroke={colors.limbs} strokeWidth="5" strokeLinecap="round" />
      <circle cx="13" cy="101" r="4" fill={colors.skin} />
      <circle cx="91" cy="101" r="4" fill={colors.skin} />
      <line x1="43" y1="101" x2="38" y2="138" stroke={colors.limbs} strokeWidth="5" strokeLinecap="round" />
      <line x1="61" y1="101" x2="66" y2="138" stroke={colors.limbs} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="36" cy="141" rx="8" ry="5" fill={colors.limbs} />
      <ellipse cx="68" cy="141" rx="8" ry="5" fill={colors.limbs} />
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
    return <CustomCharSVG colors={colors} size={size} />;
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
