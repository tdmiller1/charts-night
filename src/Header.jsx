import { useCurrentUser } from './Contexts/hooks';
import { useGameController } from './Contexts/hooks';
import { useSocketConnection } from './Contexts/hooks';

export default function Header() {
  const { userId } = useCurrentUser();
  const { gameState, userChangeGameMode, userResetGame } = useGameController();
  const { wsUrl, logoutUser } = useSocketConnection();

  console.log(gameState.host);
  console.log(userId);
  const isHost = gameState.host === userId;

  function handleLogout() {
    logoutUser();
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div>Charts!</div>
      <button onClick={userResetGame}>Reset</button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {isHost && 'host'}
      </div>
      {/* Radio button group for game mode selection */}
      {isHost && (
        <div>
          <label>
            <input
              type="radio"
              name="gameMode"
              value="ffa"
              checked={gameState.mode === 'ffa'}
              onChange={() => userChangeGameMode('ffa')}
            />
            Free for All
          </label>
          <label>
            <input
              type="radio"
              name="gameMode"
              value="god"
              checked={gameState.mode === 'god'}
              onChange={() => {
                userChangeGameMode('god');
              }}
            />
            God Mode
          </label>
          <label>
            <input
              type="radio"
              name="gameMode"
              value="group"
              checked={gameState.mode === 'group'}
              onChange={() => {
                userChangeGameMode('group');
              }}
            />
            Group
          </label>
        </div>
      )}
      <div
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <p>Server: {wsUrl}</p>
        <button onClick={handleLogout}>
          <span role="img" aria-label="logout">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}
