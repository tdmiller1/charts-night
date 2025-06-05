import dotenv from 'dotenv';
import process from 'process';
import { WebSocketServer, WebSocket as WS } from 'ws';
import onConnect from './socket/handlers/onConnect.js';

dotenv.config();

// Use environment variable for port, default to 3001
const PORT = process.env.PORT || 3001;

// Simple WebSocket server for multi-user token sync
const wss = new WebSocketServer({ port: PORT });

// game room state
export let gameRoom = {
  mode: 'god', // Default game mode
  players: {}
}; // Deteremined by client

// Store tokens by userId
export let tokens = {};

// Store photos for game
export let photos = {};

wss.on('connection', (ws) => onConnect(ws, wss));

// Improved log message for Docker port mapping
console.log(`WebSocket server running inside container on port ${PORT}`);
console.log(
  'If running in Docker, connect using the host port you mapped with -p.'
);
