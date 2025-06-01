import { useEffect, useState } from 'react';
import { useGameController } from '../Contexts/GameControllerProvider';

export default function Chart({ width = 1000, height = 1000, staticMode }) {
  const { photos, userRemovePhoto } = useGameController();
  const [count, setCount] = useState(Object.entries(photos).length);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    if (Object.entries(photos).length > 0) {
      setCount(Object.entries(photos).length);
    }
  }, [photos]);

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

  const photoList = Object.values(photos);

  function handleDeletePhoto(photo) {
    userRemovePhoto(photo.id);
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 2 }}>
        <button onClick={() => setCount((c) => Math.max(3, c - 1))}>-</button>
        <span style={{ color: '#fff', margin: '0 1em' }}>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
      <svg
        width={width}
        height={height}
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
      {points.map((p, i) => {
        const photo = photoList[i];
        return (
          <div
            key={photo?.id || i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '5vw',
              height: '5vw',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <img
              src={photo?.dataUrl}
              alt={photo?.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px #0008',
                pointerEvents: 'auto',
              }}
            />
            {hoveredIdx === i && (
              <button
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  zIndex: 10,
                  padding: 0,
                }}
                title="Delete photo"
                onClick={() => handleDeletePhoto(photo)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
