import dotenv from 'dotenv';
import process from 'process';
import { tokens, gameRoom } from '../index.js';
import { broadcastNewGameState, handleUserInit } from './gameService.js';

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
      const colors = ['#61dafb', '#ffb347', '#e06666', '#b4e061', '#b366e0'];
      return colors[Math.floor(Math.random() * colors.length)];
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
