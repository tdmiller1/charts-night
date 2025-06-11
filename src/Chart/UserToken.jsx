import React from 'react';
import Tooltip from '../shared/Tooltip';
import { isColorTooLight } from '../shared/utils';
import './UserToken.css'; // Assuming you have a CSS file for styles

export function UserToken({
  x,
  y,
  onMouseDown,
  color = '#61dafb',
  borderColor = '#fff',
  label,
  dragging,
  disableDragging,
  playerWhoSubmitted,
}) {
  if (typeof label !== 'string') {
    // TODO: Fix this, idk why it happens
    console.warn('UserToken label is not a string:', label);
    label = '●'; // Fallback to default if label is not a string
  }
  const useBlack = isColorTooLight(color);
  return (
    <div>
      <div
        className="UserToken"
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: playerWhoSubmitted ? 30 : 40,
          height: playerWhoSubmitted ? 30 : 40,
          opacity: playerWhoSubmitted ? 0.5 : 1,
          borderRadius: '50%',
          background: color,
          border: `3px solid ${borderColor}`,
          boxShadow: '0 2px 8px #0008',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: useBlack ? '#000' : '#fff',
          fontWeight: 'bold',
          userSelect: 'none',
          cursor: disableDragging
            ? 'not-allowed'
            : dragging
              ? 'grabbing'
              : 'grab',
        }}
        onMouseDown={onMouseDown}
      >
        {playerWhoSubmitted && (
          <div className="popper" style={{ opacity: 1 }}>
            {playerWhoSubmitted}
          </div>
        )}
        {label || '●'}
      </div>
      {/* <div
        style={{
          position: 'absolute',
          left: x - 37,
          top: y + 30,
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
      </div> */}
    </div>
  );
}
