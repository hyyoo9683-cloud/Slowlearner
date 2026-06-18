const moodColors = {
  sunny: { sky: '#d4eac8', skyBottom: '#e8f5d8', ground: '#8fc860', trunk: '#8a5a30', leaves: '#5a9a30', leavesLight: '#7abf48' },
  rain: { sky: '#c0cfe0', skyBottom: '#d8e8f0', ground: '#6a9860', trunk: '#7a5028', leaves: '#4a8028', leavesLight: '#60a040' },
  fog: { sky: '#dde8dc', skyBottom: '#eaf0e8', ground: '#88a878', trunk: '#8a6040', leaves: '#5a8840', leavesLight: '#78aa58' },
  sunset: { sky: '#f0d0a0', skyBottom: '#f8e8c0', ground: '#98a050', trunk: '#9a5828', leaves: '#6a9030', leavesLight: '#88b048' },
};

export default function ForestBackground({ mood = 'sunny' }) {
  const c = moodColors[mood];
  return (
    <svg viewBox="0 0 390 280" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Sky gradient */}
      <defs>
        <linearGradient id={`sky-${mood}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky} />
          <stop offset="100%" stopColor={c.skyBottom} />
        </linearGradient>
      </defs>
      <rect width="390" height="280" fill={`url(#sky-${mood})`} />

      {/* Sun / weather element */}
      {mood === 'sunset' ? (
        <>
          <ellipse cx="300" cy="70" rx="32" ry="32" fill="#f09030" opacity="0.8" />
          <ellipse cx="300" cy="70" rx="48" ry="48" fill="#f8c060" opacity="0.3" />
        </>
      ) : mood === 'rain' ? (
        <>
          <ellipse cx="300" cy="55" rx="40" ry="30" fill="#c0d8f0" opacity="0.8" />
          <ellipse cx="250" cy="65" rx="35" ry="25" fill="#b8d0e8" opacity="0.7" />
          {[240,260,280,300,320,340].map((x, i) => (
            <line key={i} x1={x} y1={95} x2={x - 5} y2={115} stroke="#90b8d8" strokeWidth="1.5" opacity="0.7" />
          ))}
        </>
      ) : mood === 'fog' ? (
        <>
          <ellipse cx="300" cy="55" rx="28" ry="28" fill="#e8e8e0" opacity="0.6" />
          <rect x="0" y="115" width="390" height="25" fill="#d8e0d0" opacity="0.5" rx="15" />
          <rect x="20" y="140" width="350" height="18" fill="#d0d8c8" opacity="0.4" rx="12" />
        </>
      ) : (
        <>
          <ellipse cx="300" cy="55" rx="30" ry="30" fill="#ffe080" opacity="0.9" />
          <ellipse cx="300" cy="55" rx="42" ry="42" fill="#fff0a0" opacity="0.4" />
        </>
      )}

      {/* Soft clouds */}
      {(mood === 'sunny' || mood === 'fog') && (
        <>
          <ellipse cx="80" cy="45" rx="40" ry="18" fill="white" opacity="0.7" />
          <ellipse cx="100" cy="38" rx="28" ry="16" fill="white" opacity="0.6" />
          <ellipse cx="60" cy="40" rx="25" ry="14" fill="white" opacity="0.6" />
          <ellipse cx="200" cy="35" rx="35" ry="15" fill="white" opacity="0.5" />
          <ellipse cx="218" cy="28" rx="22" ry="13" fill="white" opacity="0.5" />
        </>
      )}

      {/* Ground */}
      <ellipse cx="195" cy="285" rx="230" ry="45" fill={c.ground} />
      <rect x="0" y="240" width="390" height="50" fill={c.ground} />

      {/* Back trees (smaller, lighter) */}
      {[50, 130, 210, 300, 370].map((x, i) => (
        <g key={i} opacity="0.7">
          <rect x={x - 4} y={165} width="8" height="50" fill={c.trunk} />
          <polygon
            points={`${x},${118 + i * 3} ${x - 28},${195} ${x + 28},${195}`}
            fill={c.leavesLight}
          />
          <polygon
            points={`${x},${98 + i * 3} ${x - 20},${152} ${x + 20},${152}`}
            fill={c.leaves}
          />
        </g>
      ))}

      {/* Front trees (larger) */}
      {[0, 75, 315, 390].map((x, i) => (
        <g key={i}>
          <rect x={x - 6} y={155} width="12" height="75" fill={c.trunk} />
          <polygon
            points={`${x},${85} ${x - 38},${175} ${x + 38},${175}`}
            fill={c.leavesLight} opacity="0.95"
          />
          <polygon
            points={`${x},${65} ${x - 28},${118} ${x + 28},${118}`}
            fill={c.leaves}
          />
        </g>
      ))}

      {/* Dirt path */}
      <path d="M 155 280 Q 195 250 195 210" stroke="#c8a870" strokeWidth="18" fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
