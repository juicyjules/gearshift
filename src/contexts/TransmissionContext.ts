import { createContext, useContext } from 'react';
import { TransmissionClient } from '../transmission-rpc/transmission';

// Define the shape of the context value
interface TransmissionContextState {
  transmission: TransmissionClient | null;
}

export const TransmissionContext = createContext<TransmissionContextState>({
  transmission: null,
});

/**
 * Custom hook to consume the TransmissionContext.
 */
export const useTransmission = (): TransmissionContextState => {
  const context = useContext(TransmissionContext);
  if (context === undefined) {
    throw new Error('useTransmission must be used within a TransmissionProvider');
  }
  return context;
};