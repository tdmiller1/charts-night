import { WebSocketServer, WebSocket as WS } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Simple WebSocket server for multi-user token sync
const wss = new WebSocketServer({ port: 3001 });

// Store tokens by userId
let tokens = {};

wss.on('connection', (ws) => {
  // Assign a unique userId
  const userId = uuidv4();
  ws.userId = userId;

  // Send initial state and userId
  ws.send(JSON.stringify({ type: 'init', userId, tokens }));

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
    if (data.type === 'lockedIn') {
      // Update lockedIn state for this user
      if (tokens[userId]) {
        tokens[userId].lockedIn = data.lockedIn;
      }
      // Broadcast updated tokens
      wss.clients.forEach((client) => {
        if (client.readyState === WS.OPEN) {
          client.send(JSON.stringify({ type: 'tokens', tokens }));
        }
      });
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

console.log('WebSocket server running on ws://localhost:3001');
