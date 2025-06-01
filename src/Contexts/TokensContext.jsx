import { useState } from 'react';
import { TokensContext } from './contexts';

export function TokensProvider({ children }) {
  const [tokens, setTokens] = useState({});

  return (
    <TokensContext.Provider value={{ tokens, setTokens }}>
      {children}
    </TokensContext.Provider>
  );
}
