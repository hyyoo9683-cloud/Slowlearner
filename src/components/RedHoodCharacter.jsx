export default function RedHoodCharacter({ size = 80, mood = 'sunny' }) {
  // Eyes based on mood
  const renderEyes = () => {
    if (mood === 'fog') {
      // Eyes shifted sideways (looking around)
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
      // Sparkling eyes
      return (
        <>
          <ellipse cx="36" cy="43" rx="2.2" ry="2.8" fill="#3a2010" />
          <ellipse cx="44" cy="43" rx="2.2" ry="2.8" fill="#3a2010" />
          <circle cx="37" cy="42" r="1" fill="white" />
          <circle cx="45" cy="42" r="1" fill="white" />
          {/* sparkles near eyes */}
          <text x="28" y="40" fontSize="4" fill="#f5c842">✦</text>
          <text x="49" y="40" fontSize="4" fill="#f5c842">✦</text>
        </>
      );
    }
    // Default eyes (sunny, rain)
    return (
      <>
        <ellipse cx="36" cy="43" rx="2" ry="2.5" fill="#3a2010" />
        <ellipse cx="44" cy="43" rx="2" ry="2.5" fill="#3a2010" />
        <circle cx="37" cy="42" r="0.8" fill="white" />
        <circle cx="45" cy="42" r="0.8" fill="white" />
      </>
    );
  };

  // Mouth based on mood
  const renderMouth = () => {
    if (mood === 'sunny') {
      // Wide happy smile
      return <path d="M 34 49 Q 40 55 46 49" stroke="#c07050" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'rain') {
      // Slight frown
      return <path d="M 36 51 Q 40 48 44 51" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    if (mood === 'fog') {
      // Slightly open mouth / neutral
      return (
        <>
          <path d="M 36 50 Q 40 52 44 50" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="40" cy="51" rx="2.5" ry="1.2" fill="#c07050" opacity="0.3" />
        </>
      );
    }
    if (mood === 'sunset') {
      // Gentle smile
      return <path d="M 35 49 Q 40 53 45 49" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
    return <path d="M 36 49 Q 40 53 44 49" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {/* Umbrella for rain mood */}
      {mood === 'rain' && (
        <g transform="translate(50, 20)">
          {/* Umbrella canopy */}
          <path d="M 0 10 Q 12 0 24 10" fill="#4a8adc" stroke="#2a5a9a" strokeWidth="1" />
          <path d="M 0 10 Q 6 5 12 10 Q 18 5 24 10" fill="#3a78c8" />
          {/* Umbrella handle */}
          <line x1="12" y1="10" x2="12" y2="24" stroke="#2a5a9a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 12 24 Q 12 28 9 28" stroke="#2a5a9a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Body / Cape */}
      <ellipse cx="40" cy="58" rx="18" ry="16" fill="#c84040" />

      {/* Cape fold */}
      <path d="M 24 58 Q 40 72 56 58" fill="#a03030" />

      {/* Face */}
      <ellipse cx="40" cy="44" rx="12" ry="13" fill="#f5c9a0" />

      {/* Eyes */}
      {renderEyes()}

      {/* Mouth */}
      {renderMouth()}

      {/* Cheeks */}
      <ellipse cx="33" cy="48" rx="3" ry="2" fill="#e8907a" opacity="0.5" />
      <ellipse cx="47" cy="48" rx="3" ry="2" fill="#e8907a" opacity="0.5" />

      {/* Hood */}
      <ellipse cx="40" cy="38" rx="15" ry="12" fill="#c84040" />

      {/* Hat cone / point */}
      <polygon points="40,10 28,38 52,38" fill="#c84040" />
      <polygon points="40,10 30,34 50,34" fill="#a03030" />

      {/* Hat brim */}
      <ellipse cx="40" cy="37" rx="16" ry="4" fill="#a03030" />

      {/* Basket (optional accessory) */}
      <rect x="53" y="54" width="10" height="8" rx="2" fill="#8B6914" />
      <path d="M 53 54 Q 58 48 63 54" stroke="#8B6914" strokeWidth="2" fill="none" />

      {/* Legs */}
      <rect x="34" y="72" width="5" height="8" rx="2" fill="#f5c9a0" />
      <rect x="41" y="72" width="5" height="8" rx="2" fill="#f5c9a0" />

      {/* Shoes */}
      <ellipse cx="36" cy="80" rx="4" ry="2" fill="#5c3a1e" />
      <ellipse cx="43" cy="80" rx="4" ry="2" fill="#5c3a1e" />
    </svg>
  );
}
