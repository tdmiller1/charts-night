import { WebSocket as WS } from 'ws';
import { gameRoom, tokens } from '../index.js';
import { canLoggedInUserMoveToken } from '../utils.js';

export function handlePlayerTokenMovement(token, loggedInUserId, wss) {
  if (
    !canLoggedInUserMoveToken(
      token.id,
      loggedInUserId,
      gameRoom.mode,
      gameRoom.host
    )
  ) {
    console.warn(
      `User ${loggedInUserId} attempted to move but is not the host in god mode.`
    );
    return;
  }

  addOrUpdateTokenToRoom(wss, token);
}

export function addOrUpdateTokenToRoom(wss, token) {
  tokens[token.id] = token;
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}

export function removeTokenFromRoom(wss, tokenId) {
  delete tokens[tokenId];
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}

export function removeAllTokensAndBroadcast(wss) {
  Object.keys(tokens).forEach((id) => {
    delete tokens[id];
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}
