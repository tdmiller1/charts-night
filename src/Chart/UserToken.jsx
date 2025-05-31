import React from 'react';

export function UserToken({ x, y, onMouseDown, color = '#61dafb', label }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: color,
          border: '3px solid #fff',
          boxShadow: '0 2px 8px #0008',
          transform: 'translate(-50%, -50%)',
          cursor: 'grab',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#222',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
        onMouseDown={onMouseDown}
      >
        {label || '●'}
      </div>
      <div
        style={{
          position: 'absolute',
          left: x + 30,
          top: y - 10,
          color: '#fff',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: 14,
          pointerEvents: 'none',
          zIndex: 11,
        }}
      >
        ({Math.round(x)}, {Math.round(y)})
      </div>
    </>
  );
}
