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

        const label =
          gameState.mode !== 'group' &&
          truncateLabel(token.id === userId ? 'You' : token.id);

        return (
          <UserToken
            disableDragging={!canUserDragToken}
            key={token.id}
            x={x}
            y={y}
            color={token.color}
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
