export default function RedHoodCharacter({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      {/* Body / Cape */}
      <ellipse cx="40" cy="58" rx="18" ry="16" fill="#c84040" />

      {/* Cape fold */}
      <path d="M 24 58 Q 40 72 56 58" fill="#a03030" />

      {/* Face */}
      <ellipse cx="40" cy="44" rx="12" ry="13" fill="#f5c9a0" />

      {/* Eyes */}
      <ellipse cx="36" cy="43" rx="2" ry="2.5" fill="#3a2010" />
      <ellipse cx="44" cy="43" rx="2" ry="2.5" fill="#3a2010" />

      {/* Eye shine */}
      <circle cx="37" cy="42" r="0.8" fill="white" />
      <circle cx="45" cy="42" r="0.8" fill="white" />

      {/* Smile */}
      <path d="M 36 49 Q 40 53 44 49" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round" />

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
