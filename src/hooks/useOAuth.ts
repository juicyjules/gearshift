import { useContext } from 'react';
import { OAuthContext, type OAuthContextType } from '../contexts/OAuthContext';

export const useOAuth = (): OAuthContextType => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuth must be used within an OAuthProvider');
  }
  return context;
};
