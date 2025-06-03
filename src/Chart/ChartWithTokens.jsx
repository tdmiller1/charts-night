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
  const { userHandleMouseMove, gameState, userSubmitTokenPlacement } =
    useGameController();
  const [clientTokens, setClientTokens] = useState({});

  const moveServerToken = gameState.mode !== 'group';

  useEffect(() => {
    if (!moveServerToken && gameState.players) {
      setClientTokens((prevTokens) => {
        const newTokens = { ...prevTokens };
        // Remove tokens for players no longer present
        Object.keys(newTokens).forEach((id) => {
          if (!gameState.players[id]) {
            delete newTokens[id];
          }
        });
        // Add tokens for new players
        Object.entries(gameState.players).forEach(([id, player]) => {
          if (!newTokens[id]) {
            newTokens[id] = {
              ...player,
              id: player.userId,
              x: 200,
              y: Math.random() * 500 + 200, // Default position for client tokens
            };
          }
        });
        return newTokens;
      });
    }
  }, [gameState, moveServerToken]);

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
    if (moveServerToken) {
      if (dragging && userId) {
        // Convert mouse px to normalized for server
        const { x, y } = toNormalized(
          e.clientX - offset.x,
          e.clientY - offset.y
        );
        const newToken = {
          ...dragging,
          x,
          y,
        };

        userHandleMouseMove({ newToken });
      }
    } else {
      // Client-side only dragging
      if (dragging) {
        console.log('Dragging token:', dragging);
        const { x, y } = toNormalized(
          e.clientX - offset.x,
          e.clientY - offset.y
        );
        const newToken = {
          ...dragging,
          x,
          y,
        };
        setClientTokens((prevTokens) => ({
          ...prevTokens,
          [dragging.userId]: newToken,
        }));
      }
    }
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <>
      <button
        onClick={() => {
          console.log('Submitting token placements:', clientTokens);
          userSubmitTokenPlacement(Object.values(clientTokens));
        }}
      >
        Done
      </button>
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
        {/* Render all server tokens */}
        <GameboardTokens
          tokens={Object.assign({}, tokens, clientTokens)}
          setOffset={setOffset}
          dragging={dragging}
          setDragging={setDragging}
          clientSide={!moveServerToken}
        />
      </div>
    </>
  );
}
