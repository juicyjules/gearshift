import React, { useMemo, type ReactNode } from 'react';
import { TransmissionClient } from '../transmission-rpc/transmission';
import { TransmissionContext } from '../contexts/TransmissionContext';

// --- Configuration ---
// It's best to use environment variables for this
const TRANSMISSION_HOST = import.meta.env.VITE_TRANSMISSION_HOST || 'localhost';
const TRANSMISSION_PORT = Number(import.meta.env.VITE_TRANSMISSION_PORT) || 9091;

interface TransmissionProviderProps {
  children: ReactNode;
}

export const TransmissionProvider: React.FC<TransmissionProviderProps> = ({ children }) => {
  // useMemo ensures the Transmission client is instantiated only once.
  const transmission = useMemo(() => {
    return new TransmissionClient({
      host: TRANSMISSION_HOST,
      port: TRANSMISSION_PORT,
      ssl: false,
      username: import.meta.env.TRANMISSION_USER || '',
      password: import.meta.env.TRANSMISSION_PASSWORD || '',
    });
  }, []);

  return (
    <TransmissionContext.Provider value={{ transmission }}>
      {children}
    </TransmissionContext.Provider>
  );
};