import dotenv from 'dotenv';
import { WebSocketServer, WebSocket as WS } from 'ws';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Use environment variable for port, default to 3001
const PORT = process.env.PORT || 3001;
const PASSPHRASE = process.env.PASSPHRASE;

// Simple WebSocket server for multi-user token sync
const wss = new WebSocketServer({ port: PORT });

// Store tokens by userId
let tokens = {};

const stupid = uuidv4();
// Store photos for game
let photos = {};

wss.on('connection', (ws) => {
  // Assign a unique userId
  const userId = uuidv4();
  ws.userId = userId;

  // Send initial state and userId
  ws.send(JSON.stringify({ type: 'init', userId, tokens, photos }));

  ws.on('message', (msg) => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.type === 'move' && data.token) {
      tokens[userId] = { ...data.token, userId };
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
      if (tokens[userId]) {
        console.log(`User ${userId} locked in: ${data.lockedIn}`);
        tokens[userId].lockedIn = data.lockedIn;
      }
      // Broadcast updated tokens
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'tokens', tokens }));
        }
      });
    }
    if (data.type === 'addPhoto' && data.photo) {
      console.log(`User ${userId} added a photo`);
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

    if (data.type === 'auth' && data.password) {
      // Handle authentication
      if (data.password === PASSPHRASE) {
        console.log(`User ${userId} authenticated successfully`);
        ws.send(JSON.stringify({ type: 'authSuccess', userId }));
      } else {
        console.log(`User ${userId} authenticated failed`);
        ws.send(
          JSON.stringify({ type: 'authError', message: 'Invalid password' })
        );
        ws.close();
        return;
      }
    }
  });

  ws.on('close', () => {
    delete tokens[userId];
    // Broadcast updated tokens
    wss.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify({ type: 'tokens', tokens }));
      }
    });
  });
});

// Improved log message for Docker port mapping
console.log(`WebSocket server running inside container on port ${PORT}`);
console.log(
  'If running in Docker, connect using the host port you mapped with -p.'
);
