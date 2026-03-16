import React, { useState, useEffect, type ReactNode } from 'react';
import { OAuthContext } from '../contexts/OAuthContext';
import { initiateLogin, handleCallback, getAccessToken, clearAccessToken } from '../utils/oauth';

interface OAuthProviderProps {
  children: ReactNode;
}

export const OAuthProvider: React.FC<OAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(errorParam);
        setIsLoading(false);
        return;
      }

      if (code && state) {
        try {
          setIsLoading(true);
          await handleCallback(code, state);
          // Remove query params
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsAuthenticated(true);
        } catch (err: unknown) {
          console.error("OAuth Callback Error:", err);
          if (err instanceof Error) {
            setError(err.message || "Failed to complete login.");
          } else {
            setError("Failed to complete login.");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // No code, check if we already have a token
        const token = getAccessToken();
        if (token) {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    };

    processCallback();
  }, []);

  const login = () => {
    setIsLoading(true);
    initiateLogin().catch((err) => {
      console.error("Login initiation failed:", err);
      setError("Failed to initiate login.");
      setIsLoading(false);
    });
  };

  const logout = () => {
    clearAccessToken();
    setIsAuthenticated(false);
    // Standard OAuth2 might need an end-session endpoint call,
    // but for lightweight implementation, simply clearing local token is fine.
  };

  return (
    <OAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </OAuthContext.Provider>
  );
};
