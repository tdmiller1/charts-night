import { v4 as uuidv4 } from 'uuid';
import { WebSocket as WS } from 'ws';
import { handleAuth } from '../../services/usersService.js';
import { gameRoom, tokens, photos } from '../../index.js';
import { handlePlayerTokenMovement } from '../../services/tokenService.js';
import {
  handlePhotoPreset,
  handleUpdateGameMode,
  submitTokenPlacement,
} from '../../services/gameService.js';
import { handleClose } from './onDisconnect.js';

const PINGPONGTIMEOUT = 15000; // 15 seconds

export default function onConnect(ws, wss) {
  // Assign a unique userId
  const uuid = uuidv4();
  ws.userId = uuid;
  tokens[ws.userId] = {}; // Initialize token for this user

  console.log(`User connected with ID: ${ws.userId}`);

  // every 1 second, send a ping to the client
  const pingInterval = setInterval(() => {
    if (ws.readyState === WS.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
      console.log(`Ping interval cleared for user ${ws.userId}`);
    }
  }, PINGPONGTIMEOUT);

  ws.on('pong', () => {
    console.log(`Pong received from user ${ws.userId}`);
    console.log(`Tokens: `, Object.keys(tokens));
    console.log(`GameState: `, gameRoom);
    // Reset the ping interval if pong is received
    clearInterval(pingInterval);
    setTimeout(() => {
      if (ws.readyState === WS.OPEN) {
        ws.ping();
        console.log(`Ping sent to user ${ws.userId}`);
      }
    }, PINGPONGTIMEOUT); // Resend ping after 1 second
  });

  ws.on('message', (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error(`Error parsing message from user ${ws.userId}:`, e);
      return;
    }

    if (data.type !== 'move') {
      console.log(`Received message from user ${ws.userId}:`, data.type);
    }

    if (data.type === 'move' && data.token) {
      handlePlayerTokenMovement(data.token, ws.userId, wss);
    }

    if (
      data.type === 'lockedIn' &&
      data.token &&
      typeof data.lockedIn === 'boolean'
    ) {
      // Update lockedIn state for this user
      if (tokens[ws.userId]) {
        console.log(`User ${ws.userId} locked in: ${data.lockedIn}`);
        tokens[ws.userId].lockedIn = data.lockedIn;
      }
      // Broadcast updated tokens
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'tokens', tokens }));
        }
      });
    }

    if (data.type === 'photoPreset') {
      handlePhotoPreset(ws, data);
    }

    if (data.type === 'addPhoto' && data.photo) {
      console.log(`User ${ws.userId} added a photo`);
      // Store the photo for this user
      const uuid = uuidv4();
      photos[uuid] = { ...data.photo, id: uuid };
      console.log('Current photos:', Object.keys(photos));
      // Broadcast updated photos to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'photos', photos }));
        }
      });
    }
    if (data.type === 'removePhoto' && data.id) {
      if (!photos[data.id]) {
        console.warn(`Photo with id ${data.id} does not exist`);
        console.log('Current photos:', Object.keys(photos));
        return;
      }
      delete photos[data.id];
      console.log('Current photos:', Object.keys(photos));
      // Broadcast updated photos to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'photos', photos }));
        }
      });
    }
    if (data.type === 'resetLockedIn') {
      if (gameRoom.mode === 'ffa') {
        // Reset all users' lockedIn state
        Object.keys(tokens).forEach((id) => {
          tokens[id].lockedIn = false;
        });
        // Broadcast updated tokens
        wss.clients.forEach((client) => {
          if (client.readyState === WS.OPEN) {
            client.send(JSON.stringify({ type: 'lockReset', tokens }));
          }
        });
      }
    }

    if (data.type === 'auth') {
      handleAuth(ws, data, wss);
    }

    if (data.type === 'submitGroupTokens') {
      console.log(data);
      submitTokenPlacement(ws, data.data, wss);
    }

    if (data.type === 'claimHost') {
      // Update game room state
      if (gameRoom.host) return;
      gameRoom.host = ws.userId;
      console.log(`Game room updated by user ${ws.userId}:`, gameRoom);
      // Broadcast updated game room to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(
            JSON.stringify({ type: 'gameState', gameState: gameRoom })
          );
        }
      });
    }

    if (data.type === 'gameMode' && data.mode) {
      handleUpdateGameMode(ws, data.mode, wss);
    }
  });

  ws.on('close', () => {
    handleClose(ws, wss);
  });
}
