import React, { useState, useEffect } from 'react';
import { useTransmission } from '../contexts/TransmissionContext';
import { type GetSessionResponse } from '../transmission-rpc/types';
import Modal from './Modal'; // Import the generic modal
import './SettingsForm.css';
import './SettingsModal.css'; // Keep some specific styles

interface SettingsModalProps {
  onClose: () => void;
}

type Tab = 'speed' | 'seeding' | 'downloading' | 'network';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { transmission } = useTransmission();
  const [activeTab, setActiveTab] = useState<Tab>('speed');
  const [settings, setSettings] = useState<GetSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await transmission.session();
        setSettings(response);
      } catch {
        setError('Failed to fetch settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [transmission]);

  const handleSave = async () => {
    if (!transmission || !settings) return;
    try {
      await transmission.setSession(settings);
      onClose();
    } catch {
      setError('Failed to save settings');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (settings) {
      // For number inputs, convert value to number
      const finalValue = type === 'number' ? Number(value) : (type === 'checkbox' ? checked : value);
      setSettings({
        ...settings,
        [name]: finalValue,
      });
    }
  };

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      footer={
        <>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="save-button" onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="tabs">
        <button className={`tab ${activeTab === 'speed' ? 'active' : ''}`} onClick={() => setActiveTab('speed')}>Speed</button>
        <button className={`tab ${activeTab === 'seeding' ? 'active' : ''}`} onClick={() => setActiveTab('seeding')}>Seeding</button>
        <button className={`tab ${activeTab === 'downloading' ? 'active' : ''}`} onClick={() => setActiveTab('downloading')}>Downloading</button>
        <button className={`tab ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>Network</button>
      </div>
      <div className="tab-content">
        {isLoading && <div>Loading settings...</div>}
        {error && <div className="error-message">{error}</div>}
        {settings && (
          <>
            {activeTab === 'speed' && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="speed-limit-down">Download Speed Limit (KB/s)</label>
                  <input type="number" id="speed-limit-down" name="speedLimitDown" value={settings['speedLimitDown']} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="speed-limit-down-enabled">Enable Download Speed Limit</label>
                  <input type="checkbox" id="speed-limit-down-enabled" name="speedLimitDownEnabled" checked={settings['speedLimitDownEnabled']} onChange={handleChange} />
                </div>
              </div>
            )}
            {activeTab === 'seeding' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="seedRatioLimit">Seed Ratio Limit</label>
                        <input type="number" id="seedRatioLimit" name="seedRatioLimit" value={settings.seedRatioLimit} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="seedRatioLimited">Enable Seed Ratio Limit</label>
                        <input type="checkbox" id="seedRatioLimited" name="seedRatioLimited" checked={settings.seedRatioLimited} onChange={handleChange} />
                    </div>
                </div>
            )}
            {activeTab === 'downloading' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="download-dir">Download Directory</label>
                        <input type="text" id="download-dir" name="downloadDir" value={settings['downloadDir']} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="download-queue-enabled">Enable Download Queue</label>
                        <input type="checkbox" id="download-queue-enabled" name="downloadQueueEnabled" checked={settings['downloadQueueEnabled']} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="download-queue-size">Download Queue Size</label>
                        <input type="number" id="download-queue-size" name="downloadQueueSize" value={settings['downloadQueueSize']} onChange={handleChange} />
                    </div>
                </div>
            )}
            {activeTab === 'network' && (
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="peer-port">Peer Port</label>
                        <input type="number" id="peer-port" name="peerPort" value={settings['peerPort']} onChange={handleChange} />
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
