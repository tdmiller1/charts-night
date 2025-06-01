import { useState, useEffect } from 'react';
import { useCurrentUser } from './Contexts/hooks';
import { useTokens, useGameController } from './Contexts/hooks';
import { useSocketConnection } from './Contexts/hooks';

export default function Header() {
  const { lockedIn, userId } = useCurrentUser();
  const { resetUsersLockedIn, toggleLockedIn, gameState } = useGameController();
  const { wsUrl } = useSocketConnection();
  const { tokens } = useTokens();
  const [countdown, setCountdown] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Check if all players are locked in
  useEffect(() => {
    if (!tokens || Object.keys(tokens).length === 0) return;
    const allLocked = Object.values(tokens).every((t) => t.lockedIn);
    if (allLocked) {
      setCountdown(5);
    } else {
      setCountdown(null);
      setShowAlert(false);
    }
  }, [tokens]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setShowAlert(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {gameState.host === userId && 'host'}
        <button onClick={toggleLockedIn}>
          {lockedIn ? 'Make changes...' : 'Lock In'}
        </button>
        {countdown !== null && !showAlert && (
          <div style={{ fontWeight: 'bold', color: 'red' }}>
            Starting in: {countdown}
          </div>
        )}
      </div>
      <p>Server: {wsUrl}</p>

      {showAlert && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: 'white', padding: 32, borderRadius: 8 }}>
            <h2>All players locked in!</h2>
            <button
              onClick={() => {
                setShowAlert(false);
                setCountdown(null);
                resetUsersLockedIn();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
