import { createContext } from 'react';

export interface OAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  error: string | null;
}

export const OAuthContext = createContext<OAuthContextType | null>(null);
