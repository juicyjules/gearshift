export interface AppConfig {
  OAUTH_CLIENT_ID?: string;
  OAUTH_AUTHORITY?: string;
  OAUTH_REDIRECT_URI?: string;
  OAUTH_SCOPE?: string;
  TRANSMISSION_RPC_URL?: string;
}

// Global config instance
let appConfig: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (appConfig) return appConfig;

  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      appConfig = {
        OAUTH_CLIENT_ID: config.OAUTH_CLIENT_ID || import.meta.env.VITE_OAUTH_CLIENT_ID,
        OAUTH_AUTHORITY: config.OAUTH_AUTHORITY || import.meta.env.VITE_OAUTH_AUTHORITY,
        OAUTH_REDIRECT_URI: config.OAUTH_REDIRECT_URI || import.meta.env.VITE_OAUTH_REDIRECT_URI,
        OAUTH_SCOPE: config.OAUTH_SCOPE || import.meta.env.VITE_OAUTH_SCOPE,
        TRANSMISSION_RPC_URL: config.TRANSMISSION_RPC_URL,
      };
      return appConfig;
    } else {
      console.warn('Could not load /config.json, falling back to Vite env variables.');
    }
  } catch (error) {
    console.warn('Error loading /config.json, falling back to Vite env variables.', error);
  }

  // Fallback to Vite env vars
  appConfig = {
    OAUTH_CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID,
    OAUTH_AUTHORITY: import.meta.env.VITE_OAUTH_AUTHORITY,
    OAUTH_REDIRECT_URI: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    OAUTH_SCOPE: import.meta.env.VITE_OAUTH_SCOPE,
  };

  return appConfig;
}

export function getConfig(): AppConfig {
  if (!appConfig) {
    console.warn('getConfig called before loadConfig finished. Using Vite env variables as fallback.');
    return {
      OAUTH_CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID,
      OAUTH_AUTHORITY: import.meta.env.VITE_OAUTH_AUTHORITY,
      OAUTH_REDIRECT_URI: import.meta.env.VITE_OAUTH_REDIRECT_URI,
      OAUTH_SCOPE: import.meta.env.VITE_OAUTH_SCOPE,
    };
  }
  return appConfig;
}
