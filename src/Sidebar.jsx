import { useCurrentUser } from './Contexts/CurrentUserContext';
import { useTokens } from './Contexts/TokensContext';

export default function Sidebar() {
  const { tokens } = useTokens();
  const { size } = useCurrentUser();

  function fromNormalized(x, y) {
    return {
      x: (x / 1000) * size.width,
      y: (y / 1000) * size.height,
    };
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        overflow: 'auto',
        wordWrap: 'break-word',
      }}
    >
      <h4>Players</h4>
      <ul>
        {Object.values(tokens).map((token) => (
          <li>
            {token.label}: ({Math.floor(fromNormalized(token.x, token.y).x)},{' '}
            {Math.floor(fromNormalized(token.y, token.y).y)}) LOCK:{' '}
            {token.lockedIn ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
}
