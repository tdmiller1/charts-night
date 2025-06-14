import React, { useState, useRef, useCallback } from 'react';
import { SocketConnectionContext } from './Contexts/contexts';
import Tooltip from './shared/Tooltip';

export default function SocketConnection({ hasError, children }) {
  // if dev environment set wsUrl to localhost
  const [wsUrl, setWsUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('ws://localhost:3001');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [password, setPassword] = useState('');
  const wsRef = useRef(null);

  const handleConnect = async (pwd, nn = '') => {
    setConnecting(true);
    setError('');
    let ws;
    try {
      ws = new window.WebSocket(inputUrl);
    } catch (err) {
      setError('Invalid WebSocket URL.');
      console.error('WebSocket connection error:', err);
      setConnecting(false);
      return;
    }
    console.log(ws);
    let authTimeout;
    wsRef.current = ws; // Store the WebSocket connection
    console.log('storing wsRef', wsRef);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', password: pwd, nickname: nn }));
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
            // ws.close();
            wsRef.current = ws; // Store the WebSocket connection
            setWsUrl(inputUrl);
            setConnecting(false);
          } else {
            ws.close();
            setError('Authentication failed.');
            setConnecting(false);
          }
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
        setError('Invalid message format from server.');
        ws.close();
        setConnecting(false);
      }
    };

    // Setup mechanism to detect if we lose connection
    ws.onclose = () => {
      clearTimeout(authTimeout);
      if (wsRef.current === ws) {
        console.log('WebSocket connection closed');
        wsRef.current = null; // Clear the reference on close
      }
      setConnectionError('Lost connection to server.');
      logoutUser(); // Disconnect user client on close
    };

    ws.onerror = () => {
      clearTimeout(authTimeout);
      console.error('WebSocket error occurred');
      setError('Could not connect to server.');
      logoutUser(); // Disconnect user client on error
    };
  };

  const logoutUser = useCallback(() => {
    console.log('Logging out user', wsRef.current);
    if (wsRef.current) {
      console.log('Closing WebSocket connection');
      wsRef.current.close();
      wsRef.current = null; // Clear the reference
      setWsUrl('');
      setInputUrl('ws://localhost:3001');
      setConnecting(false);
      setError('');
      setConnectionError('');
      setPassword('');
    }
  }, []);

  // useEffect(() => {
  //   console.log('Setting logoutUser in SocketConnection:', logoutUser);
  //   setLogoutUser(() => {
  //     // logoutUser();
  //     return logoutUser;
  //   });
  // }, [logoutUser, setLogoutUser]);

  // Monitor connection after login
  // useEffect(() => {
  //   if (!wsUrl) return;
  //   let ws;
  //   let interval;
  //   let timeout;
  //   let closed = false;

  //   function cleanup() {
  //     if (interval) clearInterval(interval);
  //     if (timeout) clearTimeout(timeout);
  //     if (ws) ws.close();
  //   }

  //   ws = new window.WebSocket(wsUrl);
  //   wsRef.current = ws;
  //   ws.onmessage = (event) => {
  //     // If server responds to ping, clear pong timeout
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === 'pong' && timeout) {
  //         clearTimeout(timeout);
  //       }
  //     } catch {}
  //   };
  //   ws.onerror = () => {
  //     setConnectionError('Lost connection to server.');
  //     setWsUrl('');
  //     cleanup();
  //   };
  //   ws.onclose = () => {
  //     if (!closed) {
  //       setConnectionError('Lost connection to server.');
  //       setWsUrl('');
  //       cleanup();
  //     }
  //   };
  //   return () => {
  //     closed = true;
  //     cleanup();
  //   };
  // }, [wsUrl]);

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
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect(e.target.password.value, e.target.nickname.value);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            minWidth: 300,
          }}
        >
          <label htmlFor="hostUrl">Server url</label>
          <input
            type="text"
            name="hostUrl"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="ws://localhost:3001"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
            required
            disabled={connecting}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Secret Password"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
            required
            disabled={connecting}
          />
          <label htmlFor="nickname">Nickname</label>
          <input
            label="Nickname"
            type="nickname"
            name="nickname"
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />

          {React.cloneElement(
            hasError ? <Tooltip content="Please refresh the page" /> : <></>,
            {},
            <button
              type="submit"
              style={{ padding: '0.5rem', fontSize: '1rem' }}
              disabled={connecting || hasError}
            >
              {connecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
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
    <SocketConnectionContext.Provider
      value={{ wsUrl, wsConnection: wsRef, logoutUser }}
    >
      {children}
    </SocketConnectionContext.Provider>
  );
}
