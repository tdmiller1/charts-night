import { useState, useEffect, useRef, useMemo } from 'react';
import '../App.css';
import Chart from './chart';
import { UserToken } from './UserToken';
import {
  useTokens,
  useGameController,
  useCurrentUser,
} from '../Contexts/hooks';
import GameboardTokens from './GameboardTokens';

export function ChartWithTokens() {
  const { tokens } = useTokens();
  const { userId, size, setSize } = useCurrentUser();
  const {
    userHandleMouseMove,
    gameState,
    userSubmitTokenPlacement,
    userResetTokenPlacement,
    userResetGame,
  } = useGameController();
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
              label: player.name || `Player ${id}`,
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

  const hasUserSubmitted = gameState.players[userId]?.lockedIn;
  const hasEveryoneSubmitted = Object.values(gameState.players).every(
    (player) => player.lockedIn
  );
  const isGroupGame = gameState.mode === 'group';

  const groupModeButtonText = useMemo(() => {
    if (gameState['players'] === undefined) return 'Loading...';
    if (!isGroupGame) return null;
    if (hasUserSubmitted) {
      if (hasEveryoneSubmitted) {
        if (userId === gameState.host) {
          return 'Reset Token Placements';
        } else {
          return 'Waiting for host to reset';
        }
      } else {
        return 'Keep Moving Tokens';
      }
    } else {
      return 'Lock In Tokens';
    }
  }, [gameState, hasEveryoneSubmitted, hasUserSubmitted, isGroupGame, userId]);

  const handleGroupModeButtonClick = () => {
    if (hasEveryoneSubmitted && userId === gameState.host) {
      userResetGame();
    } else {
      userResetTokenPlacement();
    }
    if (!hasUserSubmitted) {
      userSubmitTokenPlacement(Object.values(clientTokens));
    }
  };

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

  const dynamicTokens = useMemo(() => {
    if (gameState.mode === 'group') {
      if (hasEveryoneSubmitted) {
        return Object.assign(
          {},
          tokens,
          hasEveryoneSubmitted ? {} : clientTokens
        );
      }
      return clientTokens;
    }
    return tokens;
  }, [clientTokens, gameState.mode, hasEveryoneSubmitted, tokens]);

  if (gameState['players'] === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isGroupGame && (
        <button
          disabled={hasEveryoneSubmitted && userId !== gameState.host}
          onClick={handleGroupModeButtonClick}
        >
          {groupModeButtonText}
        </button>
      )}
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
          tokens={dynamicTokens}
          setOffset={setOffset}
          dragging={dragging}
          setDragging={setDragging}
          clientSide={!moveServerToken}
          disableDragging={gameState.mode === 'group' && hasUserSubmitted}
        />
      </div>
    </>
  );
}

export default function ChartWithTokensContainer() {
  const { userId } = useCurrentUser();
  const { gameState } = useGameController();

  if (!userId || !gameState) {
    return <div>Loading...</div>;
  }
  return <ChartWithTokens />;
}
