import { v4 as uuidv4 } from 'uuid';
import { WebSocket as WS } from 'ws';
import { handleAuth } from '../../services/usersService.js';
import { gameRoom, tokens, photos } from '../../index.js';

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
      tokens[ws.userId] = { ...data.token, userId: ws.userId };
      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'tokens', tokens }));
        }
      });
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

    if (data.type === 'auth') {
      handleAuth(ws, data, tokens, photos, gameRoom);
    }

    if (data.type === 'gameRoom' && data.room) {
      // Update game room state
      Object.keys(gameRoom).forEach((key) => delete gameRoom[key]);
      Object.assign(gameRoom, data.room);
      console.log(`Game room updated by user ${ws.userId}:`, gameRoom);
      // Broadcast updated game room to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'gameRoom', room: gameRoom }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`User ${ws.userId} disconnected`);
    delete tokens[ws.userId];

    if (gameRoom.host === ws.userId) {
      // If the host disconnects, find a new host or reset the game room
      console.log(`Host ${ws.userId} disconnected, selecting new host`);
      const remainingClients = Array.from(wss.clients).filter(
        (client) => client.readyState === WS.OPEN && client.userId !== ws.userId
      );
      if (remainingClients.length > 0) {
        // Select a new host from remaining clients
        const newHost = remainingClients[0].userId;
        gameRoom.host = newHost;
        console.log(`New host selected: ${newHost}`);
      } else {
        // No remaining clients, reset the game room
        console.log('No remaining clients, resetting game room');
        Object.keys(gameRoom).forEach((key) => delete gameRoom[key]);
      }
      // Broadcast reset to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'gameRoom', room: gameRoom }));
        }
      });
    }
    // Broadcast updated tokens
    wss.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify({ type: 'tokens', tokens }));
      }
    });
  });
}
