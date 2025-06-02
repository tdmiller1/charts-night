import { WebSocket as WS } from 'ws';
import { tokens, gameRoom } from '../../index.js';
import { broadcastNewGameState } from '../../services/gameService.js';

export function handleClose(ws, wss) {
  console.log(`User ${ws.userId} disconnected`);
  delete tokens[ws.userId];
  delete gameRoom.players[ws.userId];

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
      delete gameRoom.host;
      gameRoom.mode = 'ffa'; // Reset to default mode
    }
    // Broadcast reset to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WS.OPEN) {
        client.send(JSON.stringify({ type: 'gameState', gameState: gameRoom }));
      }
    });
  } else {
    broadcastNewGameState(wss, gameRoom);
  }
  // Broadcast updated tokens
  wss.clients.forEach((client) => {
    if (client.readyState === WS.OPEN) {
      client.send(JSON.stringify({ type: 'tokens', tokens }));
    }
  });
}
