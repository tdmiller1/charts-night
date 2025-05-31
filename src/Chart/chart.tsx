import { useState } from 'react';

export default function Chart() {
  const [count, setCount] = useState(5); // Dynamic number of points

  // Example image URL (replace with your own if needed)
  const imageUrl = '/src/assets/darcy.jpg';

  // Calculate points in a circle
  const points = Array.from({ length: count }, (_, idx) => {
    const angle = (2 * Math.PI * idx) / count - Math.PI / 2;
    const r = 45; // percent radius
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return { x, y };
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#222',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2 }}>
        <button onClick={() => setCount((c) => Math.max(3, c - 1))}>-</button>
        <span style={{ color: '#fff', margin: '0 1em' }}>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        preserveAspectRatio="none"
      >
        {/* Draw lines between every pair of points */}
        {points.map((p1, i) =>
          points.map((p2, j) =>
            i < j ? (
              <line
                key={`line-${i}-${j}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#61dafb"
                strokeWidth="0.5"
              />
            ) : null
          )
        )}
      </svg>
      {/* Place images at each point */}
      {points.map((p, i) => (
        <img
          key={`img-${i}`}
          src={imageUrl}
          alt={`point-${i}`}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '5vw',
            height: '5vw',
            objectFit: 'cover',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px #0008',
          }}
        />
      ))}
    </div>
  );
}
