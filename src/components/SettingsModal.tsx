import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTransmission } from '../contexts/TransmissionContext';
import { type GetSessionResponse } from '../transmission-rpc/types';
import Modal from './Modal';
import './SettingsForm.css';
import './SettingsModal.css';

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = 'speed' | 'seeding' | 'downloading' | 'network' | 'connection';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const {
    transmission,
    settings: connectionSettings,
    connect,
    error: connectionError,
  } = useTransmission();
  const [activeTab, setActiveTab] = useState<Tab>('speed');
  const [sessionSettings, setSessionSettings] = useState<GetSessionResponse | null>(null);
  const [newConnectionSettings, setNewConnectionSettings] = useState({
    host: connectionSettings?.host || '',
    port: connectionSettings?.port || 9091,
    username: connectionSettings?.username || '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await transmission.session();
        setSessionSettings(response);
      } catch {
        setLocalError('Failed to fetch session settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [transmission]);

  const handleSave = async () => {
    setLocalError(null);

    if (activeTab === 'connection') {
      // The connect function from useConnection will handle setting localStorage
      // and also setting a global connection error if it fails.
      // We will listen for that error. If there's no error after the attempt,
      // we can assume it was successful and reload.
      await connect(newConnectionSettings);

      // A bit of a hacky way to check for success, but `connect` doesn't return status.
      // If after a short delay, the global connectionError is still null, we assume success.
      setTimeout(() => {
        if (!connectionError) {
          window.location.reload();
        }
      }, 500);

    } else {
      if (!transmission || !sessionSettings) return;
      try {
        await transmission.setSession(sessionSettings);
        onClose();
      } catch {
        setLocalError('Failed to save session settings');
      }
    }
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (sessionSettings) {
      const finalValue = type === 'number' ? Number(value) : (type === 'checkbox' ? checked : value);
      setSessionSettings({
        ...sessionSettings,
        [name]: finalValue,
      });
    }
  };

  const handleConnectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setNewConnectionSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const error = localError || connectionError;

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={
        <>
          <motion.button className="cancel-button" onClick={onClose} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
          <motion.button className="save-button" onClick={handleSave} whileTap={{ scale: 0.95 }}>Save</motion.button>
        </>
      }
    >
      <div className="tabs">
        <button className={`tab ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>Speed</button>
        <button className={`tab ${activeTab === 'seeding' ? 'active' : ''}`} onClick={() => setActiveTab('seeding')}>Seeding</button>
        <button className={`tab ${activeTab === 'downloading' ? 'active' : ''}`} onClick={() => setActiveTab('downloading')}>Downloading</button>
        <button className={`tab ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>Network</button>
        <button className={`tab ${activeTab === 'connection' ? 'active' : ''}`} onClick={() => setActiveTab('connection')}>Connection</button>
      </div>
      <div className="tab-content">
        {isLoading && <div>Loading settings...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && sessionSettings && (
          <>
            {activeTab === 'speed' && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="speed-limit-down">Download Speed Limit (KB/s)</label>
                  <input type="number" id="speed-limit-down" name="speedLimitDown" value={sessionSettings['speedLimitDown']} onChange={handleSessionChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="speed-limit-down-enabled">Enable Download Speed Limit</label>
                  <input type="checkbox" id="speed-limit-down-enabled" name="speedLimitDownEnabled" checked={sessionSettings['speedLimitDownEnabled']} onChange={handleSessionChange} />
                </div>
              </div>
            )}
            {activeTab === 'seeding' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="seedRatioLimit">Seed Ratio Limit</label>
                        <input type="number" id="seedRatioLimit" name="seedRatioLimit" value={sessionSettings.seedRatioLimit} onChange={handleSessionChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="seedRatioLimited">Enable Seed Ratio Limit</label>
                        <input type="checkbox" id="seedRatioLimited" name="seedRatioLimited" checked={sessionSettings.seedRatioLimited} onChange={handleSessionChange} />
                    </div>
                </div>
            )}
            {activeTab === 'downloading' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="download-dir">Download Directory</label>
                        <input type="text" id="download-dir" name="downloadDir" value={sessionSettings['downloadDir']} onChange={handleSessionChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="download-queue-enabled">Enable Download Queue</label>
                        <input type="checkbox" id="download-queue-enabled" name="downloadQueueEnabled" checked={sessionSettings['downloadQueueEnabled']} onChange={handleSessionChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="download-queue-size">Download Queue Size</label>
                        <input type="number" id="download-queue-size" name="downloadQueueSize" value={sessionSettings['downloadQueueSize']} onChange={handleSessionChange} />
                    </div>
                </div>
            )}
            {activeTab === 'network' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="peer-port">Peer Port</label>
                        <input type="number" id="peer-port" name="peerPort" value={sessionSettings['peerPort']} onChange={handleSessionChange} />
                    </div>
                </div>
            )}
            {activeTab === 'connection' && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="host">Host</label>
                  <input type="text" id="host" name="host" value={newConnectionSettings.host} onChange={handleConnectionChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="port">Port</label>
                  <input type="number" id="port" name="port" value={newConnectionSettings.port} onChange={handleConnectionChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input type="text" id="username" name="username" value={newConnectionSettings.username} onChange={handleConnectionChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password (only needed if changed or not saved)</label>
                  <input type="password" id="password" name="password" value={newConnectionSettings.password} onChange={handleConnectionChange} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default SettingsModal;
