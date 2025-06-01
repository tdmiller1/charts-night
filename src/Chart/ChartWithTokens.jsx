import { useState, useEffect, useRef } from 'react';
import '../App.css';
import Chart from './chart';
import { UserToken } from './UserToken';
import {
  useTokens,
  useGameController,
  useCurrentUser,
} from '../Contexts/hooks';

export default function ChartWithTokens() {
  const { tokens } = useTokens();
  const { userId, size, setSize, lockedIn } = useCurrentUser();
  const { userHandleMouseMove, gameState } = useGameController();

  const isFFA = gameState.mode === 'ffa';

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
  }, [setSize]);

  // Each user gets a unique color and label
  // const ws = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

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

  // Drag logic for this user's token
  const handleMouseDown = (e, token) => {
    if (lockedIn) return;
    setDragging(token);
    // const myToken = tokens[userId];
    // Convert normalized to px for offset
    const { x, y } = fromNormalized(token.x, token.y);
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging && userId) {
      // Convert mouse px to normalized for server
      const { x, y } = toNormalized(e.clientX - offset.x, e.clientY - offset.y);
      const newToken = {
        ...dragging,
        x,
        y,
      };

      userHandleMouseMove({ newToken });
    }
  };

  const handleMouseUp = () => setDragging(null);

  const disableDragging = !isFFA && gameState.host !== userId;

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
      <Chart
        key={`${size.width}:${size.height}`}
        width={size.width}
        height={size.height}
      />
      {/* Render all user tokens */}
      {Object.values(tokens).map((token) => {
        // Convert normalized to px for rendering
        const { x, y } = fromNormalized(token.x, token.y);

        const canUserDragForFFA = isFFA && token.userId === userId;
        const canUserDragForGod = !isFFA && gameState.host === userId;

        function truncateLabel(l) {
          if (!l) return 'Unknown';
          if (l.length > 4) {
            return l.slice(0, 4);
          }
          return l;
        }

        const label = truncateLabel(token?.label || token.userId);

        return (
          <UserToken
            disableDragging={!canUserDragForFFA && !canUserDragForGod}
            key={token.userId}
            x={x}
            y={y}
            color={token.color}
            label={token.userId !== userId ? label : 'You'}
            onMouseDown={(e) =>
              !disableDragging ? handleMouseDown(e, token) : undefined
            }
            lockedIn={lockedIn}
            dragging={dragging}
          />
        );
      })}
    </div>
  );
}
