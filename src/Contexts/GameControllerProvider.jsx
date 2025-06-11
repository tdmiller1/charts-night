import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useTokens, useSocketConnection } from './hooks';
import { useCurrentUser } from './hooks';
import { GameControllerContext } from './contexts';

export function GameControllerProvider({ children }) {
  const ws = useRef(null);
  const { wsConnection } = useSocketConnection();
  const { tokens, setTokens } = useTokens();
  const { userId, setUserId } = useCurrentUser();
  const [gameState, setGameState] = useState({});
  const [photos, setPhotos] = useState({});

  // Regardless of the game mode, we need to handle the following actions:
  // - updateGameMode
  // - updatePlayer
  // - setPhotoPreset
  // - addPhoto

  // Game mode:
  // - god: Host player can control all player tokens. No concept of lockedIn.
  // - group: Players see a version of all the player tokens, and can move all of them. They can lock in their guesses.
  // - solo: Players see all live player tokens, but can only move their own token. They can lock in their guess.

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
      } else if (data.type === 'tokens') {
        setTokens(data.tokens || {});
      } else if (data.type === 'gameState') {
        console.log('Received game state:', data.gameState);
        // If players[id].tokens exist they are locked in
        const newState = {
          ...data.gameState,
          players: Object.fromEntries(
            Object.entries(data.gameState.players || {}).map(([id, player]) => [
              id,
              {
                ...player,
                lockedIn:
                  Array.isArray(player.tokens) && player.tokens.length > 0,
              },
            ])
          ),
        };

        setGameState(newState || {});
      } else if (data.type === 'photos') {
        setPhotos({ ...data.photos });
      }
    };
  }, [setTokens, setUserId, tokens, wsConnection]);

  useEffect(() => {
    ws.current.send(
      JSON.stringify({
        type: 'claimHost',
      })
    );
  }, [userId]);

  function userHandleMouseMove({ newToken }) {
    ws.current.send(
      JSON.stringify({
        type: 'move',
        token: newToken,
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

  function userChangeGameMode(mode) {
    if (gameState.mode === mode) return; // No change needed

    ws.current.send(
      JSON.stringify({
        type: 'gameMode',
        mode: mode,
      })
    );
  }

  function userSelectPhotoPreset(preset) {
    ws.current.send(
      JSON.stringify({
        type: 'photoPreset',
        preset: preset,
      })
    );
  }

  function userSubmitTokenPlacement(tokens) {
    ws.current.send(
      JSON.stringify({
        type: 'submitGroupTokens',
        data: tokens,
      })
    );
  }

  function userResetGame() {
    ws.current.send(
      JSON.stringify({
        type: 'resetGame',
      })
    );
  }

  function userResetTokenPlacement() {
    ws.current.send(
      JSON.stringify({
        type: 'resetGroupTokens',
      })
    );
  }

  function handleUserSettingColor(color) {
    ws.current.send(
      JSON.stringify({
        type: 'setColor',
        color: color,
      })
    );
  }

  function userAddProfilePic(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      ws.current.send(
        JSON.stringify({
          type: 'addProfilePic',
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

  return (
    <GameControllerContext.Provider
      value={{
        photos,
        userHandleMouseMove,
        userAddPhoto,
        userRemovePhoto,
        userChangeGameMode,
        userSelectPhotoPreset,
        userSubmitTokenPlacement,
        userResetGame,
        userResetTokenPlacement,
        handleUserSettingColor,
        userAddProfilePic,
        gameState,
      }}
    >
      {children}
    </GameControllerContext.Provider>
  );
}
