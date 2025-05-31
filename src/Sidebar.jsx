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

  return (
    <div style={{ maxWidth: '100%', overflow: 'auto', wordWrap: 'break-word' }}>
      <h4>Players</h4>
      <ul>
        {Object.values(tokens).map((token) => (
          <li key={token.userId}>
            {token.label}: ({Math.floor(fromNormalized(token.x, token.y).x)},{' '}
            {Math.floor(fromNormalized(token.y, token.y).y)}) LOCK:{' '}
            {token.lockedIn ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
      <button onClick={handleAddPhoto}>Add Photo</button>
      {/* Display uploaded photos */}
      <div style={{ marginTop: 16 }}>
        <img
          style={{
            maxWidth: 120,
            maxHeight: 120,
            margin: 4,
            borderRadius: 8,
            border: '1px solid #ccc',
          }}
          src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRYsTCZAfCg8v3AWG5JJy68Nge5gIUdaQNl7bZ81RHjOKEqQ2sDGVpCYrAj-aFvjJdMor8MlmPYDXYwwsAvfKa6gw"
        />
        {Object.values(photos).map((photo) => (
          <>
            <p>{photo.name}</p>
            <img
              key={photo.name}
              src={photo.dataUrl}
              alt={photo.name}
              style={{
                maxWidth: 120,
                maxHeight: 120,
                margin: 4,
                borderRadius: 8,
                border: '1px solid #ccc',
              }}
            />
          </>
        ))}
      </div>
    </div>
  );
}
