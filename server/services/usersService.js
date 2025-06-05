import dotenv from 'dotenv';
import process from 'process';
import { tokens, gameRoom } from '../index.js';
import {
  broadcastGameState,
  broadcastNewGameState,
  handleUserInit,
} from './gameService.js';
import { broadcastTokens } from './tokenService.js';

dotenv.config();

const PASSPHRASE = process.env.PASSPHRASE;

export function handleAuth(ws, data, wss) {
  // Handle authentication
  if (data.password === PASSPHRASE) {
    console.log('testing userId', ws.userId);
    console.log(
      `User ${ws.userId}, Nickname: ${data.nickname} authenticated successfully`
    );
    // Set nickname
    tokens[ws.userId] = { nickname: data.nickname };

    // Set token color

    function getRandomColor() {
      // Generate a random hex color code
      const hex = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');
      return `#${hex}`;
    }

    const color = getRandomColor();
    tokens[ws.userId].color = color;
    ws.send(JSON.stringify({ type: 'authSuccess', userId: ws.userId }));

    // Add player to gameRoom
    gameRoom.players[ws.userId] = {
      userId: ws.userId,
      nickname: data.nickname,
      color,
    };

    // wait 200ms to ensure client is ready
    setTimeout(() => {
      console.log('attempting to init user', ws.userId);
      console.log(gameRoom);

      const playerInfo = gameRoom.players[ws.userId];
      handleUserInit(wss, playerInfo, ws);
      broadcastNewGameState(wss, gameRoom);
    }, 200);
  } else {
    console.log(`User ${ws.userId} authenticated failed`);
    ws.send(JSON.stringify({ type: 'authError', message: 'Invalid password' }));
    ws.close();
    return;
  }
}

export function setUserColor(ws, color, wss) {
  if (gameRoom.players[ws.userId] === undefined) {
    console.warn('Cannot set color for player, missing player');
    return;
  }
  console.log('Setting user color', ws.userId, color);
  gameRoom.players[ws.userId] = {
    ...gameRoom.players[ws.userId],
    color,
  };
  if (tokens[ws.userId]) {
    // Find users tokens
    tokens[ws.userId] = {
      ...tokens[ws.userId],
      color,
    };
  }

  broadcastGameState(wss);
  broadcastTokens(wss);
}
