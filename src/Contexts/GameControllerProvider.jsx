import { createContext, useContext, useState } from 'react';
import { useEffect, useRef } from 'react';
import { useTokens } from './TokensContext';
import { useCurrentUser } from './CurrentUserContext';

function getRandomColor() {
  const colors = ['#61dafb', '#ffb347', '#e06666', '#b4e061', '#b366e0'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const GameControllerContext = createContext();

export function GameControllerProvider({ children }) {
  const ws = useRef(null);
  const { tokens, setTokens } = useTokens();
  const { userId, setUserId, size, lockedIn } = useCurrentUser();
  const [photos, setPhotos] = useState({});

  function toNormalized(x, y) {
    return {
      x: (x / size.width) * 1000,
      y: (y / size.height) * 1000,
    };
  }

  // Connect to WebSocket server
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') {
        setUserId(data.userId);
        setTokens(data.tokens || {});
        setPhotos(data.photos || {});
      } else if (data.type === 'tokens') {
        setTokens(data.tokens || {});
      } else if (data.type === 'photos') {
        setPhotos({ ...data.photos });
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  // On first connect, create a token for this user if not present
  useEffect(() => {
    if (!size) return;
    if (userId && !tokens[userId]) {
      const color = getRandomColor();
      const label = userId.slice(0, 2).toUpperCase();
      // Always send normalized coordinates to server
      const token = {
        ...toNormalized(Math.random() * 500 + 200, 200),
        color,
        label,
        userId,
      };
      ws.current.send(JSON.stringify({ type: 'move', token }));
    }
  }, [userId, tokens, size?.width, size?.height]);

  function userHandleMouseMove({ newToken }) {
    ws.current.send(
      JSON.stringify({
        type: 'move',
        token: newToken,
      })
    );
  }

  function userLockingIn({ newToken }) {
    ws.current.send(
      JSON.stringify({
        type: 'lockedIn',
        token: newToken,
        lockedIn: lockedIn,
      })
    );
  }

  function userAddPhoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      ws.current.send(
        JSON.stringify({
          type: 'addPhoto',
          photo: {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            dataUrl: e.target.result,
          },
        })
      );
    };
    reader.readAsDataURL(file);
  }

  function userRemovePhoto(id) {
    ws.current.send(
      JSON.stringify({
        type: 'removePhoto',
        id: id,
      })
    );
  }

  return (
    <GameControllerContext.Provider
      value={{
        photos,
        userHandleMouseMove,
        userLockingIn,
        userAddPhoto,
        userRemovePhoto,
      }}
    >
      {children}
    </GameControllerContext.Provider>
  );
}

// Custom hook for easy access
export function useGameController() {
  return useContext(GameControllerContext);
}
