const moodColors = {
  sunny: { sky: '#2d5a1b', ground: '#1a3d0a', trunk: '#5c3a1e', leaves: '#3d7a1a' },
  rain: { sky: '#162d08', ground: '#0f2006', trunk: '#4a2e16', leaves: '#2a5a12' },
  fog: { sky: '#1e3d10', ground: '#152b0a', trunk: '#4d3820', leaves: '#2e6015' },
  sunset: { sky: '#1a2e06', ground: '#0f1e04', trunk: '#6b3a1a', leaves: '#4a7a20' },
};

export default function ForestBackground({ mood = 'sunny' }) {
  const c = moodColors[mood];
  return (
    <svg viewBox="0 0 390 280" xmlns="http://www.w3.org/2000/svg" className="w-full">
      {/* Sky */}
      <rect width="390" height="280" fill={c.sky} />

      {/* Sun or Moon */}
      {mood === 'sunset' ? (
        <ellipse cx="320" cy="60" rx="28" ry="28" fill="#d4622a" opacity="0.7" />
      ) : mood === 'rain' ? (
        <>
          <ellipse cx="320" cy="50" rx="22" ry="22" fill="#8aabcc" opacity="0.4" />
          {[250,270,290,310,330,350].map((x, i) => (
            <line key={i} x1={x} y1={90} x2={x - 6} y2={110} stroke="#6a9abf" strokeWidth="1.5" opacity="0.5" />
          ))}
        </>
      ) : mood === 'fog' ? (
        <>
          <ellipse cx="320" cy="50" rx="22" ry="22" fill="#c8d8c0" opacity="0.3" />
          <rect x="0" y="100" width="390" height="30" fill="#c8d8c0" opacity="0.15" rx="20" />
          <rect x="0" y="130" width="390" height="20" fill="#c8d8c0" opacity="0.1" rx="15" />
        </>
      ) : (
        <ellipse cx="320" cy="50" rx="26" ry="26" fill="#f5d76e" opacity="0.7" />
      )}

      {/* Stars (sunny only) */}
      {mood === 'sunny' && [
        [40, 30], [80, 20], [150, 35], [200, 18], [240, 40],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#d4f0a0" opacity="0.6" />
      ))}

      {/* Ground */}
      <ellipse cx="195" cy="280" rx="220" ry="40" fill={c.ground} />

      {/* Back trees */}
      {[30, 100, 200, 290, 360].map((x, i) => (
        <g key={i}>
          <rect x={x - 5} y={160} width="10" height="60" fill={c.trunk} />
          <polygon
            points={`${x},${110 + i * 4} ${x - 32},${200} ${x + 32},${200}`}
            fill={c.leaves} opacity="0.6"
          />
          <polygon
            points={`${x},${90 + i * 4} ${x - 24},${155} ${x + 24},${155}`}
            fill={c.leaves} opacity="0.7"
          />
        </g>
      ))}

      {/* Front trees */}
      {[0, 80, 310, 390].map((x, i) => (
        <g key={i}>
          <rect x={x - 7} y={150} width="14" height="80" fill={c.trunk} />
          <polygon
            points={`${x},${80} ${x - 40},${175} ${x + 40},${175}`}
            fill={c.leaves} opacity="0.9"
          />
          <polygon
            points={`${x},${60} ${x - 30},${120} ${x + 30},${120}`}
            fill={c.leaves}
          />
        </g>
      ))}

      {/* Path */}
      <path d="M 160 280 Q 195 240 195 200" stroke="#3a5c20" strokeWidth="20" fill="none" opacity="0.4" />
    </svg>
  );
}
