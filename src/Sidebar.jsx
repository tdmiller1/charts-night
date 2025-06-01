import { useCurrentUser } from './Contexts/CurrentUserContext';
import { useGameController } from './Contexts/GameControllerProvider';
import { useTokens } from './Contexts/TokensContext';

export default function Sidebar() {
  const { tokens } = useTokens();
  const { size } = useCurrentUser();
  const { userAddPhoto, photos } = useGameController();

  function fromNormalized(x, y) {
    return {
      x: (x / 1000) * size.width,
      y: (y / 1000) * size.height,
    };
  }

  // Allows the user to select a photo from their computer
  // it will then call gamecontroller userAddPhoto with the file
  function handleAddPhoto() {
    // get file from user
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        userAddPhoto(file);
      }
    };
    input.click();
  }

  // Simple lock/unlock icons as SVGs
  const LockIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ verticalAlign: 'middle' }}
    >
      <rect x="3" y="7" width="10" height="6" rx="2" fill="#888" />
      <path
        d="M5 7V5a3 3 0 1 1 6 0v2"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
  const UnlockIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ verticalAlign: 'middle' }}
    >
      <rect x="3" y="7" width="10" height="6" rx="2" fill="#888" />
      <path
        d="M11 7V5a3 3 0 0 0-6 0"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );

  return (
    <div style={{ maxWidth: '100%', overflow: 'auto', wordWrap: 'break-word' }}>
      <h4>Players</h4>
      <ul>
        {Object.values(tokens).map((token) => (
          <li key={token.userId}>
            {token.label}: ({Math.floor(fromNormalized(token.x, token.y).x)},{' '}
            {Math.floor(fromNormalized(token.y, token.y).y)}){' '}
            {token.lockedIn ? <LockIcon /> : <UnlockIcon />}
          </li>
        ))}
      </ul>
      <button onClick={handleAddPhoto}>Add Photo</button>
    </div>
  );
}
