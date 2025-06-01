import { useState } from 'react';
import { CurrentUserContext } from './contexts';

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
