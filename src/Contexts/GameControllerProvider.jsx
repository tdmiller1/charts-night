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
  const { userId, setUserId, size, setLockedIn } = useCurrentUser();
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
      } else if (data.type === 'lockReset') {
        // Reset all users' lockedIn state
        Object.keys(data.tokens).forEach((id) => {
          if (tokens[id]) {
            tokens[id].lockedIn = false;
          }
        });
        setTokens({ ...tokens });
        setLockedIn(false);
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

  function toggleLockedIn() {
    console.log('Toggling lockedIn for userId:', userId);
    if (!tokens[userId]) {
      console.warn('No token found for userId:', userId);
      return;
    }
    const newToken = { ...tokens[userId] };
    newToken.lockedIn = !newToken.lockedIn;
    setLockedIn(newToken.lockedIn);
    ws.current.send(
      JSON.stringify({
        type: 'lockedIn',
        token: newToken,
        lockedIn: newToken.lockedIn,
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

  function resetUsersLockedIn() {
    ws.current.send(
      JSON.stringify({
        type: 'resetLockedIn',
      })
    );
  }

  return (
    <GameControllerContext.Provider
      value={{
        photos,
        userHandleMouseMove,
        toggleLockedIn,
        userAddPhoto,
        userRemovePhoto,
        resetUsersLockedIn,
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
