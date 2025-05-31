import { useState } from 'react';
import './App.css';
import Chart from './Chart/chart';
import { UserToken } from './UserToken';

function App() {
  // Multiple user tokens, each with absolute coordinates
  const [tokens, setTokens] = useState([
    { x: 200, y: 200, color: '#61dafb', label: 'A' },
    { x: 300, y: 300, color: '#ffb347', label: 'B' },
    { x: 400, y: 250, color: '#e06666', label: 'C' },
  ]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (idx, e) => {
    setDraggingIdx(idx);
    setOffset({
      x: e.clientX - tokens[idx].x,
      y: e.clientY - tokens[idx].y,
    });
  };

  const handleMouseMove = (e) => {
    if (draggingIdx !== null) {
      setTokens((prev) =>
        prev.map((t, i) =>
          i === draggingIdx
            ? { ...t, x: e.clientX - offset.x, y: e.clientY - offset.y }
            : t
        )
      );
    }
  };

  const handleMouseUp = () => setDraggingIdx(null);

  return (
    <div
      style={{
        width: '80vw',
        height: '80vh',
        margin: 'auto',
        position: 'relative',
        background: '#222',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Chart />
      {/* Render all user tokens */}
      {tokens.map((token, idx) => (
        <UserToken
          key={idx}
          x={token.x}
          y={token.y}
          color={token.color}
          label={token.label}
          onMouseDown={(e) => handleMouseDown(idx, e)}
        />
      ))}
    </div>
  );
}

export default App;
