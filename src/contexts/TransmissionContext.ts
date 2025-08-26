import { createContext, useContext } from 'react';
import { type TransmissionClient } from '../transmission-rpc/transmission';
import { type ConnectionSettings } from '../hooks/useConnection';

interface TransmissionContextType {
  transmission: TransmissionClient | null;
  settings: ConnectionSettings | null;
  connect: (settings: ConnectionSettings) => Promise<void>;
  error: string | null;
}

export const TransmissionContext = createContext<TransmissionContextType | undefined>(undefined);

export const useTransmission = () => {
  const context = useContext(TransmissionContext);
  if (context === undefined) {
    throw new Error('useTransmission must be used within a TransmissionProvider');
  }
  return context;
};