import { useState, useEffect, useRef } from 'react';
import '../App.css';
import Chart from './chart';
import { UserToken } from './UserToken';
import {
  useTokens,
  useGameController,
  useCurrentUser,
} from '../Contexts/hooks';
import GameboardTokens from './GameboardTokens';

export default function ChartWithTokens() {
  const { tokens } = useTokens();
  const { userId, size, setSize } = useCurrentUser();
  const { userHandleMouseMove } = useGameController();

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
      <GameboardTokens
        tokens={tokens}
        setOffset={setOffset}
        dragging={dragging}
        setDragging={setDragging}
      />
    </div>
  );
}
