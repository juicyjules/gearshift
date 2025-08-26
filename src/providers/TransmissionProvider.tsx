import React, { type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TransmissionContext } from '../contexts/TransmissionContext';
import { useConnection } from '../hooks/useConnection';
import ConnectionSettingsModal from '../components/ConnectionSettingsModal';

interface TransmissionProviderProps {
  children: ReactNode;
}

export const TransmissionProvider: React.FC<TransmissionProviderProps> = ({ children }) => {
  const { settings, transmission, isConnected, error, connect } = useConnection();

  if (!isConnected || !transmission) {
    return (
      <AnimatePresence>
        {settings && (
          <ConnectionSettingsModal
            initialSettings={settings}
            onSave={connect}
            error={error ?? undefined}
            onClose={() => {}}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <TransmissionContext.Provider value={{ transmission }}>
      {children}
    </TransmissionContext.Provider>
  );
};