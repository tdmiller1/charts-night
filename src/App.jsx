import { useState } from 'react';
import './App.css';
import ChartWithTokens from './Chart/ChartWithTokens';

function App() {
  const [size, setSize] = useState({ width: 1000, height: 1000 });
  const [lockedIn, setLockedIn] = useState(false);
  const [tokens, setTokens] = useState({});
  const [userId, setUserId] = useState(null);

  function fromNormalized(x, y) {
    return {
      x: (x / 1000) * size.width,
      y: (y / 1000) * size.height,
    };
  }

  return (
    <div className="app-layout">
      <div className="app-header">
        <div>Game Master</div>
        <div>
          <button onClick={() => setLockedIn((prev) => !prev)}>
            {lockedIn ? 'Unlock Please' : 'Lock In'}
          </button>
        </div>
      </div>
      <div className="app-main">
        <div className="app-sidebar">
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
                  {token.label}: ({fromNormalized(token.x, token.y).x},{' '}
                  {Math.floor(fromNormalized(token.y, token.y).y)}) LOCK:{' '}
                  {token.lockedIn ? 'Yes' : 'No'}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="app-content">
          <div className="chart-container">
            <ChartWithTokens
              setUserId={setUserId}
              userId={userId}
              tokens={tokens}
              setTokens={setTokens}
              size={size}
              setSize={setSize}
              userIsLockedIn={lockedIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
