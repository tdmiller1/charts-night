import { WebSocket as WS } from 'ws';
import { tokens } from '../index.js';
import { canLoggedInUserMoveToken } from './gameService.js';

export function handlePlayerTokenMovement(token, loggedInUserId, wss) {
  if (!canLoggedInUserMoveToken(token, loggedInUserId)) {
    console.warn(
      `User ${loggedInUserId} attempted to move but is not the host in god mode.`
    );
    return;
  }

  tokens[token.userId] = { ...token };
  // Broadcast to all clients
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}
