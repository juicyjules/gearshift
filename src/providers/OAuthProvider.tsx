import React, { type ReactNode, useEffect } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';
import { OAuthContext } from '../contexts/OAuthContext';
import { getConfig } from '../config';

interface OAuthProviderProps {
  children: ReactNode;
}

const OAuthContextAdapter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  useEffect(() => {
    if (
      auth.isAuthenticated &&
      !auth.isLoading &&
      window.location.search.includes("code=")
    ) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return (
    <OAuthContext.Provider
      value={{
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        login: () => auth.signinRedirect(),
        logout: () => auth.signoutRedirect(),
        error: auth.error ? auth.error.message : null,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};

export const OAuthProvider: React.FC<OAuthProviderProps> = ({ children }) => {
  const config = getConfig();

  const oidcConfig = {
    authority: config.OAUTH_AUTHORITY || '',
    client_id: config.OAUTH_CLIENT_ID || '',
    redirect_uri: config.OAUTH_REDIRECT_URI || window.location.origin,
    scope: config.OAUTH_SCOPE || 'openid profile email',
    autoSignIn: false,
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback: () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    },
  };

  return (
    <AuthProvider {...oidcConfig}>
      <OAuthContextAdapter>{children}</OAuthContextAdapter>
    </AuthProvider>
  );
};
