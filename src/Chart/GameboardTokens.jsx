import '../App.css';
import { UserToken } from './UserToken';
import { useGameController, useCurrentUser } from '../Contexts/hooks';
import { canLoggedInUserMoveToken } from '../../server/utils';

export default function GameboardTokens({
  tokens,
  setOffset,
  dragging,
  setDragging,
  clientSide,
  disableDragging,
}) {
  const { userId, size } = useCurrentUser();
  const { gameState } = useGameController();

  // Convert normalized (0-1000) to px for local rendering
  function fromNormalized(x, y) {
    return {
      x: (x / 1000) * size.width,
      y: (y / 1000) * size.height,
    };
  }

  // Drag logic for this user's token
  const handleMouseDown = (e, token) => {
    setDragging(token);
    // const myToken = tokens[userId];
    // Convert normalized to px for offset
    const { x, y } = fromNormalized(token.x, token.y);
    setOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
  };

  if (!tokens || Object.keys(tokens).length === 0) return null;

  console.log('Rendering tokens:', tokens);

  return (
    <>
      {Object.values(tokens).map((token) => {
        // Convert normalized to px for rendering
        const { x, y } = fromNormalized(token.x, token.y);

        const canUserDragToken =
          !disableDragging &&
          (clientSide ||
            canLoggedInUserMoveToken(
              token.id,
              userId,
              gameState.mode,
              gameState.host
            ));
        function truncateLabel(l) {
          if (!l) return 'Unknown';
          if (l.length > 4) {
            return l.slice(0, 4);
          }
          return l;
        }
        // Regex find the first UUID after 'player-', examples:
        // player-97f0bb4f-ef48-4227-8a1b-4a9d533d098d-f55f32dc-9f40-4ae9-90f8-6d782fd67933 -> 97f0bb4f-ef48-4227-8a1b-4a9d533d098d
        // avg-97f0bb4f-ef48-4227-8a1b-4a9d533d098d -> null
        const playerIdRegex =
          /^player-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
        const playerWhoSubmitted = token.id.match(playerIdRegex)
          ? token.id.match(/player-([a-z0-9-]+)/)[1]
          : null;

        const hasEveryoneSubmitted =
          gameState.mode === 'group' &&
          Object.values(gameState.players).every((player) => player.lockedIn);

        const availableLabel =
          token.nickname ||
          (gameState.mode === 'group' && hasEveryoneSubmitted
            ? playerWhoSubmitted
            : token.id) ||
          'Unknown';

        const label = truncateLabel(
          token.id === userId
            ? gameState.mode !== 'group'
              ? 'You'
              : availableLabel
            : availableLabel
        );

        // The border color is the color of the players token that submitted it, so using the tokens id.
        // If it has player-PLAYERID we'll go and find that players color from GameState, else its just undefined
        const borderColor = playerWhoSubmitted
          ? gameState.players[playerWhoSubmitted]?.color
          : undefined;

        return (
          <UserToken
            disableDragging={!canUserDragToken}
            key={token.id}
            x={x}
            y={y}
            color={token.color}
            borderColor={borderColor}
            playerWhoSubmitted={
              hasEveryoneSubmitted && playerWhoSubmitted
                ? 'Chosen by ' +
                  (gameState.players[playerWhoSubmitted]?.nickname ||
                    playerWhoSubmitted)
                : undefined
            }
            label={label}
            onMouseDown={(e) =>
              canUserDragToken ? handleMouseDown(e, token) : undefined
            }
            dragging={dragging}
          />
        );
      })}
    </>
  );
}
