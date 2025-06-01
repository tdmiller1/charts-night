import { useTokens, useGameController } from './Contexts/hooks';

export default function Sidebar() {
  const { tokens } = useTokens();
  const { userAddPhoto, gameState } = useGameController();

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
  const LockIcon = ({ scale = 1.5 }) => (
    <svg
      width={16 * scale}
      height={16 * scale}
      viewBox="0 0 16 16"
      style={{ verticalAlign: 'middle' }}
    >
      {/* Lock body with black outline */}
      <rect
        x="3"
        y="7"
        width="10"
        height="6"
        rx="2"
        fill="#888"
        stroke="#000"
        strokeWidth="1"
      />
      {/* Lock shackle with black outline */}
      <path
        d="M5 7V5a3 3 0 1 1 6 0v2"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M5 7V5a3 3 0 1 1 6 0v2"
        stroke="#000"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
  const UnlockIcon = ({ scale = 1.5 }) => (
    <svg
      width={16 * scale}
      height={16 * scale}
      viewBox="0 0 16 16"
      style={{ verticalAlign: 'middle' }}
    >
      {/* Lock body with black outline */}
      <rect
        x="3"
        y="7"
        width="10"
        height="6"
        rx="2"
        fill="#888"
        stroke="#000"
        strokeWidth="1"
      />
      {/* Lock shackle with black outline */}
      <path
        d="M11 7V5a3 3 0 0 0-6 0"
        stroke="#888"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M11 7V5a3 3 0 0 0-6 0"
        stroke="#000"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  // Utility to check if a color is too light for white text
  function isColorTooLight(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    // Expand short form (e.g. #abc)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    // Parse r, g, b
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    // Perceived luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180; // threshold for white text
  }

  const isFFA = gameState?.mode === 'ffa';

  return (
    <div
      style={{
        width: '100%',
        overflow: 'auto',
        wordWrap: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h4>Players</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {Object.values(tokens).map((token) => {
          const useBlack = isColorTooLight(token.color);

          function truncateLabel(l) {
            if (!l) return 'Unknown';
            if (l.length > 15) {
              return l.slice(0, 15) + '... ';
            }
            return l;
          }

          const label = truncateLabel(token?.label || token.userId);
          return (
            <li
              key={token.userId}
              style={{
                backgroundColor: token.color,
                color: useBlack ? '#000' : '#fff',
                padding: '8px 12px',
                marginBottom: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ flex: 1 }}>
                {label}
                {/* : ({Math.floor(fromNormalized(token.x, token.y).x)},{' '}
                {Math.floor(fromNormalized(token.y, token.y).y)}) */}
              </span>
              {isFFA ? token.lockedIn ? <LockIcon /> : <UnlockIcon /> : null}
            </li>
          );
        })}
      </ul>
      <button onClick={handleAddPhoto}>Add Photo</button>
    </div>
  );
}
