import { useContext } from 'react';
import {
  CurrentUserContext,
  GameControllerContext,
  SocketConnectionContext,
  TokensContext,
} from './contexts';

// Custom hook for easy access
export function useTokens() {
  return useContext(TokensContext);
}

// Custom hook for easy access
export function useGameController() {
  return useContext(GameControllerContext);
}

// Custom hook for easy access
export function useSocketConnection() {
  return useContext(SocketConnectionContext);
}

// Custom hook for easy access
export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
