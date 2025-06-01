import { createContext, useContext, useState } from 'react';
import { useTokens } from './TokensContext';
import { useGameController } from './GameControllerProvider';

// Context for current user state
export const CurrentUserContext = createContext();

export function CurrentUserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [size, setSize] = useState({ width: 1000, height: 1000 });
  const [lockedIn, setLockedIn] = useState(false);

  return (
    <CurrentUserContext.Provider
      value={{ userId, setUserId, size, setSize, lockedIn, setLockedIn }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

// Custom hook for easy access
export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
