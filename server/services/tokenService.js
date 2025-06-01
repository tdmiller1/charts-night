import { WebSocket as WS } from 'ws';
import { gameRoom, tokens } from '../index.js';

export function handleTokenMovement(token, loggedInUser, wss) {
  if (gameRoom.mode === 'ffa' && token.userId !== loggedInUser) {
    return;
  }
  if (
    gameRoom.mode === 'god' &&
    token.userId !== loggedInUser &&
    gameRoom.host !== loggedInUser
  ) {
    console.warn(
      `User ${loggedInUser} attempted to move but is not the host in god mode.`
    );
    return; // Only the host can move tokens in god mode
  }

  tokens[token.userId] = { ...token };
  // Broadcast to all clients
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}
