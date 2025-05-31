import { useState, useEffect, useRef } from 'react';
import '../App.css';
import Chart from './chart';
import { UserToken } from './UserToken';

function getRandomColor() {
  const colors = ['#61dafb', '#ffb347', '#e06666', '#b4e061', '#b366e0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function ChartWithTokens({
  setUserId,
  userId,
  tokens,
  setTokens,
  size,
  setSize,
  userIsLockedIn,
}) {
  // Track client container size
  const containerRef = useRef(null);
  // Resize observer for responsive sizing
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Each user gets a unique color and label
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

  // --- Coordinate normalization helpers ---
  // Convert absolute px to normalized (0-1000) for server
  function toNormalized(x, y) {
    return {
      x: (x / size.width) * 1000,
      y: (y / size.height) * 1000,
    };
  }
  // Convert normalized (0-1000) to px for local rendering
  function fromNormalized(x, y) {
    return {
      x: (x / 1000) * size.width,
      y: (y / 1000) * size.height,
    };
  }

  // On first connect, create a token for this user if not present
  useEffect(() => {
    if (userId && !tokens[userId]) {
      const color = getRandomColor();
      const label = userId.slice(0, 2).toUpperCase();
      // Always send normalized coordinates to server
      const token = {
        ...toNormalized(200, 200),
        color,
        label,
        userId,
      };
      ws.current.send(JSON.stringify({ type: 'move', token }));
    }
  }, [userId, tokens, size.width, size.height]);

  // Drag logic for this user's token
  const handleMouseDown = (e) => {
    if (userIsLockedIn) return;
    setDragging(true);
    const myToken = tokens[userId];
    // Convert normalized to px for offset
    const { x, y } = fromNormalized(myToken.x, myToken.y);
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging && userId && tokens[userId]) {
      // Convert mouse px to normalized for server
      const { x, y } = toNormalized(e.clientX - offset.x, e.clientY - offset.y);
      const newToken = {
        ...tokens[userId],
        x,
        y,
      };
      ws.current.send(
        JSON.stringify({
          type: 'move',
          token: newToken,
        })
      );
    }
  };

  const handleMouseUp = () => setDragging(false);

  //   FIX THIS ITS NOT WORKING
  useEffect(() => {
    if (!tokens[userId]) return;
    const newToken = tokens[userId];
    newToken.lockedIn = !userIsLockedIn;
    ws.current.send(
      JSON.stringify({
        type: 'lockedIn',
        token: newToken,
        lockedIn: userIsLockedIn,
      })
    );
  }, [userIsLockedIn]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '80vw',
        height: '80vh',
        maxWidth: '1000px',
        maxHeight: '1000px',
        position: 'relative',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Chart width={size.width} height={size.height} />
      {/* Render all user tokens */}
      {Object.values(tokens).map((token) => {
        // Convert normalized to px for rendering
        const { x, y } = fromNormalized(token.x, token.y);

        return (
          <UserToken
            key={token.userId}
            x={x}
            y={y}
            color={token.color}
            label={token.userId !== userId ? token.label : 'You'}
            onMouseDown={token.userId === userId ? handleMouseDown : undefined}
            lockedIn={userIsLockedIn}
            dragging={dragging}
            notMe={token.userId !== userId}
          />
        );
      })}
    </div>
  );
}
