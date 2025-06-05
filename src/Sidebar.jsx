import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './shared/Tooltip';

import { useCurrentUser, useGameController } from './Contexts/hooks';
import { BUG_REPORT_URL } from './constants';
import { PlayerItem } from './Sidebar/PlayerItem';

export default function Sidebar() {
  const { userAddPhoto, gameState, userSelectPhotoPreset } =
    useGameController();
  const { userId } = useCurrentUser();

  if (!gameState.players) {
    return <div>Loading...</div>; // Handle loading state
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

  function handlePhotoPreset(preset) {
    userSelectPhotoPreset(preset);
  }

  const isGroup = gameState?.mode === 'group';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        wordWrap: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h4>Players</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.values(gameState?.players).map((player) => (
            <PlayerItem
              color={player.color}
              id={player.userId}
              userId={userId}
              nickname={player.nickname}
              lockedIn={player.lockedIn}
              isGroup={isGroup}
            />
          ))}
        </ul>
        <button onClick={handleAddPhoto}>Add Photo</button>
        <Tooltip content="Report a bug" bottom={70} right={5}>
          <button
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
            }}
            onClick={() => {
              window.open(BUG_REPORT_URL, '_blank');
            }}
          >
            <FontAwesomeIcon icon={faBug} />
          </button>
        </Tooltip>
      </div>
      {/* Use a select dropdown */}
      <div style={{ marginTop: 10 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePhotoPreset(e.target.elements[0].value);
          }}
        >
          <h4>Presets</h4>
          <select style={{ width: 150, fontSize: 16 }} name="preset">
            <option value="fish">Fish</option>
            <option value="friends">Friends</option>
          </select>
          <button style={{ marginTop: 16 }} type="submit">
            Add preset photos
          </button>
        </form>
      </div>
    </div>
  );
}
