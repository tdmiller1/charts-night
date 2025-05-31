import { createContext, useContext, useState } from 'react';

// Context for tokens state
export const TokensContext = createContext();

export function TokensProvider({ children }) {
  const [tokens, setTokens] = useState({});

  return (
    <TokensContext.Provider value={{ tokens, setTokens }}>
      {children}
    </TokensContext.Provider>
  );
}

// Custom hook for easy access
export function useTokens() {
  return useContext(TokensContext);
}
