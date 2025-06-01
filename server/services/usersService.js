import dotenv from 'dotenv';
import process from 'process';
import { tokens, photos, gameRoom } from '../index.js';

dotenv.config();

const PASSPHRASE = process.env.PASSPHRASE;

export function handleAuth(ws, data) {
  // Handle authentication
  console.log(PASSPHRASE);
  if (data.password === PASSPHRASE) {
    console.log('testing userId', ws.userId);
    console.log(`User ${ws.userId} authenticated successfully`);
    tokens[ws.userId] = {};
    ws.send(JSON.stringify({ type: 'authSuccess', userId: ws.userId }));

    // wait 200ms to ensure client is ready
    setTimeout(() => {
      console.log('attempting to init user', ws.userId);
      console.log(gameRoom);
      // Send initial state and userId
      ws.send(
        JSON.stringify({
          type: 'init',
          userId: ws.userId,
          tokens,
          photos,
          room: gameRoom,
        })
      );
    }, 200);
  } else {
    console.log(`User ${ws.userId} authenticated failed`);
    ws.send(JSON.stringify({ type: 'authError', message: 'Invalid password' }));
    ws.close();
    return;
  }
}
