import { useState, useEffect, useRef } from 'react';
import './App.css';
import Chart from './Chart/chart';
import { UserToken } from './UserToken';

function getRandomColor() {
  const colors = ['#61dafb', '#ffb347', '#e06666', '#b4e061', '#b366e0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function App() {
  // Each user gets a unique color and label
  const [userId, setUserId] = useState(null);
  const [tokens, setTokens] = useState({}); // { userId: { x, y, color, label, userId } }
  const ws = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Connect to WebSocket server
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') {
        setUserId(data.userId);
        setTokens(data.tokens || {});
      } else if (data.type === 'tokens') {
        setTokens(data.tokens || {});
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  // On first connect, create a token for this user if not present
  useEffect(() => {
    if (userId && !tokens[userId]) {
      const color = getRandomColor();
      const label = userId.slice(0, 2).toUpperCase();
      const token = { x: 200, y: 200, color, label, userId };
      ws.current.send(JSON.stringify({ type: 'move', token }));
    }
  }, [userId, tokens]);

  // Drag logic for this user's token
  const handleMouseDown = (e) => {
    setDragging(true);
    const myToken = tokens[userId];
    setOffset({
      x: e.clientX - myToken.x,
      y: e.clientY - myToken.y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging && userId && tokens[userId]) {
      const newToken = {
        ...tokens[userId],
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };
      ws.current.send(JSON.stringify({ type: 'move', token: newToken }));
    }
  };

  const handleMouseUp = () => setDragging(false);

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
      {Object.values(tokens).map((token) => (
        <UserToken
          key={token.userId}
          x={token.x}
          y={token.y}
          color={token.color}
          label={token.label}
          onMouseDown={token.userId === userId ? handleMouseDown : undefined}
        />
      ))}
    </div>
  );
}

export default App;
