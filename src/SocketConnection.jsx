import { useState, useEffect, useContext, createContext, useRef } from 'react';

export const SocketConnectionContext = createContext();

export default function SocketConnection({ children }) {
  const [wsUrl, setWsUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('ws://localhost:3001');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [password, setPassword] = useState('');
  const wsRef = useRef(null);

  const handleConnect = (e) => {
    e.preventDefault();
    setConnecting(true);
    setError('');
    let ws;
    try {
      ws = new window.WebSocket(inputUrl);
    } catch (err) {
      setError('Invalid WebSocket URL.');
      setConnecting(false);
      return;
    }
    let didRespond = false;
    let authTimeout;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', password }));
      // Wait for auth response from server
      authTimeout = setTimeout(() => {
        ws.close();
        setError('Authentication timed out.');
        setConnecting(false);
      }, 3000); // 3 seconds for auth response
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'authSuccess') {
          clearTimeout(authTimeout);
          if (data.userId) {
            ws.close();
            setWsUrl(inputUrl);
            setConnecting(false);
          } else {
            ws.close();
            setError('Authentication failed.');
            setConnecting(false);
          }
        }
      } catch {}
    };
    ws.onerror = () => {
      clearTimeout(authTimeout);
      setError('Could not connect to server.');
      setConnecting(false);
    };
  };

  // Monitor connection after login
  useEffect(() => {
    if (!wsUrl) return;
    let ws;
    let interval;
    let timeout;
    let closed = false;

    function cleanup() {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      if (ws) ws.close();
    }

    ws = new window.WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      // If server responds to ping, clear pong timeout
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong' && timeout) {
          clearTimeout(timeout);
        }
      } catch {}
    };
    ws.onerror = () => {
      setConnectionError('Lost connection to server.');
      setWsUrl('');
      cleanup();
    };
    ws.onclose = () => {
      if (!closed) {
        setConnectionError('Lost connection to server.');
        setWsUrl('');
        cleanup();
      }
    };
    return () => {
      closed = true;
      cleanup();
    };
  }, [wsUrl]);

  if (!wsUrl) {
    return (
      <div
        className="login-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <h2>Connect to WebSocket Server</h2>
        <form
          onSubmit={handleConnect}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: 300,
          }}
        >
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="ws://localhost:3001"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
            required
            disabled={connecting}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secret Password"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
            required
            disabled={connecting}
          />
          <button
            type="submit"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
          {(error || connectionError) && (
            <div style={{ color: 'red', fontSize: '0.9rem' }}>
              {error || connectionError}
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <SocketConnectionContext.Provider value={{ wsUrl }}>
      {children}
    </SocketConnectionContext.Provider>
  );
}

// Custom hook for easy access
export function useSocketConnection() {
  return useContext(SocketConnectionContext);
}
