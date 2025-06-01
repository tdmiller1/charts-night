import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useTokens, useSocketConnection } from './hooks';
import { useCurrentUser } from './hooks';
import { GameControllerContext } from './contexts';

export function GameControllerProvider({ children }) {
  const ws = useRef(null);
  const { wsConnection } = useSocketConnection();
  const { tokens, setTokens } = useTokens();
  const { userId, setUserId, size, setLockedIn } = useCurrentUser();
  const [gameState, setGameState] = useState({});
  const [photos, setPhotos] = useState({});

  // useEffect(() => {
  //   if (!wsConnection.current) {
  //     console.error('WebSocket connection is not established');
  //     return;
  //   }
  //   ws.current = wsConnection.current;
  //   console.log('WebSocket connection established:', ws.current);
  // }, [wsConnection]);

  // Connect to WebSocket server
  useEffect(() => {
    if (!wsConnection.current) {
      console.error('WebSocket connection is not established');
      return;
    }
    ws.current = wsConnection.current;
    console.log('WebSocket connection established:', ws.current);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message from server:', data.type);
      if (data.type === 'init') {
        setUserId(data.userId);
        setTokens(data.tokens || {});
        setPhotos(data.photos || {});
        console.log('Recieved room data:', data.room);
        setGameState(data.room || {});
      } else if (data.type === 'tokens') {
        setTokens(data.tokens || {});
      } else if (data.type === 'gameRoom') {
        setGameState(data.room || {});
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
  }, [setLockedIn, setTokens, setUserId, tokens, wsConnection]);

  // On first connect, set token into x,y
  useEffect(() => {
    function toNormalized(x, y) {
      return {
        x: (x / size.width) * 1000,
        y: (y / size.height) * 1000,
      };
    }

    if (!size) return;
    if (
      userId &&
      tokens[userId].x === undefined &&
      tokens[userId].y === undefined
    ) {
      const color =
        tokens[userId].color ||
        `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const label = tokens[userId].nickname || userId;
      // Always send normalized coordinates to server
      const token = {
        ...toNormalized(Math.random() * 500 + 200, 200),
        color,
        label,
        userId,
      };
      ws.current.send(JSON.stringify({ type: 'move', token }));
      console.log(gameState);
      if (gameState?.host === undefined) {
        ws.current.send(
          JSON.stringify({
            type: 'gameRoom',
            room: {
              host: userId,
            },
          })
        );
      }
    }
  }, [gameState, userId, tokens, size?.width, size?.height, size]);

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
    if (gameState.mode === 'god') return; // In god mode, lockedIn is not applicable
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

  function userChangeGameMode(mode) {
    if (gameState.mode === mode) return; // No change needed
    if (mode === 'god') {
      resetUsersLockedIn();
    }
    ws.current.send(
      JSON.stringify({
        type: 'gameMode',
        mode: mode,
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
        userChangeGameMode,
        gameState,
      }}
    >
      {children}
    </GameControllerContext.Provider>
  );
}
