import { useState, useEffect, useCallback } from 'react';
import { TransmissionClient } from '../transmission-rpc/transmission';

export interface ConnectionSettings {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol?: string;
}
interface UrlParts {
  ssl: boolean;
  host: string;
  port: number;
};

const SETTINGS_STORAGE_KEY = 'transmission-web-client-settings';
export function parseUrl(urlString: string): UrlParts | null {
  try {
    if (!urlString.includes("http")) urlString = "http://" + urlString;
    const url = new URL(urlString);

    return {
      ssl: url.protocol.slice(0, -1) === "https" ? true : false,
      host: url.hostname,
      port: Number(url.port),
    };
  } catch (error) {
    console.error(`Invalid URL provided: "${urlString}"`);
    return null;
  }
};

export const useConnection = () => {
  const [settings, setSettings] = useState<ConnectionSettings | null>(null);
  const [transmission, setTransmission] = useState<TransmissionClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({ ...parsed, password: '' });
    } else {
      setSettings({ host: '', port: 9091, username: '', password: '' });
    }
  }, []);

  const connect = useCallback(async (connectionSettings: ConnectionSettings) => {
    setError(null);
    try {
      const url = parseUrl(connectionSettings.host)
      if (url) {
         const client = new TransmissionClient({
          host: url.host,
          port: url.port,
          ssl: url.ssl,
          username: connectionSettings.username,
          password: connectionSettings.password,
        });

      // Test connection by fetching session info
      await client.session();

      const settingsToSave = { ...connectionSettings };
      delete settingsToSave.password;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));

      setTransmission(client);
      setSettings(connectionSettings);
      setIsConnected(true);
      }
    } catch (e) {
      console.error('Connection failed:', e);
      setError('Failed to connect to Transmission. Please check your settings.');
      setIsConnected(false);
    }
  }, []);

  return { settings, transmission, isConnected, error, connect };
};
