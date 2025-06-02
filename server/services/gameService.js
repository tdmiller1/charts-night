// When a player selects a photo preset, it will go and grab those photos from the server
// and use them as the current photos for the game.

import { gameRoom, photos, tokens } from '../index.js';
import { WebSocket as WS } from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { addOrUpdateTokenToRoom } from './tokenService.js';

const PHOTO_PRESETS = {
  fish: [
    '/assets/fish/clownfish.jpg',
    '/assets/fish/dory.jpg',
    '/assets/fish/marlin.png',
    '/assets/fish/tilapia.jpeg',
    '/assets/fish/ugly.jpg',
  ],
  friends: [
    '/assets/friends/chandler.jpeg',
    '/assets/friends/joey.jpeg',
    '/assets/friends/monica.jpeg',
    '/assets/friends/phoebe.jpeg',
    '/assets/friends/rachel.jpeg',
    '/assets/friends/ross.jpeg',
  ],
};

export async function handlePhotoPreset(ws, data) {
  if (!data.preset) {
    console.warn('No preset provided');
    return;
  }

  // Check if the preset exists
  const presetPhotos = PHOTO_PRESETS[data.preset];
  if (!presetPhotos) {
    console.warn(`Preset ${data.preset} does not exist`);
    return;
  }

  // Update the current photos with the preset
  Object.keys(photos).forEach((key) => {
    delete photos[key]; // Clear existing photos
  });

  // Read and encode each image as a Data URL
  const photoEntries = await Promise.all(
    presetPhotos.map(async (photo, index) => {
      const ext = path.extname(photo).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
      const filePath = path.join(path.resolve('server'), photo);
      let dataUrl = '';
      try {
        const fileBuffer = await fs.readFile(filePath);
        const base64 = fileBuffer.toString('base64');
        dataUrl = `data:${mimeType};base64,${base64}`;
      } catch (err) {
        console.warn(`Could not read file: ${filePath}`, err);
      }
      return [
        `preset-${data.preset}-${index}`,
        {
          id: `preset-${data.preset}-${index}`,
          name: photo.split('/').pop(),
          type: mimeType,
          size: 0,
          lastModified: Date.now(),
          dataUrl,
        },
      ];
    })
  );

  photoEntries.forEach(([photoId, photoObj]) => {
    photos[photoId] = photoObj;
  });

  // Notify the client about the updated photos
  ws.send(
    JSON.stringify({
      type: 'photos',
      photos,
    })
  );

  console.log(`User ${ws.userId} selected photo preset: ${data.preset}`);
}

// TODO: Implement "group" submissions
// export function submitTokenPlacement(ws, data) {
//   const player = gameRoom.players[ws.userId];
//   const tokenPlacements = data.tokens;
// }

export function handleUpdateGameMode(ws, mode, wss) {
  if (!gameRoom.host || gameRoom.host !== ws.userId) {
    console.warn(
      `User ${ws.userId} attempted to change game mode but is not the host.`
    );
    return; // Only the host can change the game mode
  }

  // Update game mode
  gameRoom.mode = mode;

  if (mode === 'ffa' || mode === 'god') {
    // Reset all tokens to default positions for FFA mode
    Object.values(gameRoom.players).forEach((player) => {
      console.log(player.color);
      tokens[player.id] = {
        color: player.color,
        id: player.id,
        x: 300,
        y: Math.random() * 500 + 200,
      };
    });
  }

  if (mode === 'group') {
    // no longer rely on server for token placement
    Object.keys(tokens).forEach((id) => {
      delete tokens[id];
    });
  }

  console.log(`Game mode updated by user ${ws.userId}:`, gameRoom.mode);
  // Broadcast updated game mode to all clients
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'gameState', gameState: gameRoom }));
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}

export function broadcastNewGameState(wss, gameRoom) {
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'gameState', gameState: gameRoom }));
    }
  });
}

export function sendGameStateToClient(ws) {
  ws.send(
    JSON.stringify({
      type: 'gameState',
      gameState: gameRoom,
    })
  );
}

export function handleUserInit(wss, playerInfo, ws) {
  const color = playerInfo.color;
  let label = playerInfo.nickname;
  const coords = {
    x: Math.random() * 500 + 200,
    y: 100,
  };
  // Depending on the active game we either add the users token to the board or do nothing
  switch (gameRoom.mode) {
    case 'god':
      addOrUpdateTokenToRoom(wss, {
        id: playerInfo.userId,
        color,
        label,
        ...coords,
      });
      break;
    case 'ffa':
      addOrUpdateTokenToRoom(wss, {
        id: playerInfo.userId,
        color,
        label,
        ...coords,
      });
      break;
    case 'group':
      addOrUpdateTokenToRoom(wss, {
        id: playerInfo.userId,
        color,
        label,
        ...coords,
      });
      break;
  }

  sendGameStateToClient(ws);

  ws.send(
    JSON.stringify({
      type: 'init',
      userId: ws.userId,
    })
  );
}
