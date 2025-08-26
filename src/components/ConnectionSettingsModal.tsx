import React, { useState } from 'react';
import { type ConnectionSettings } from '../hooks/useConnection';
import './ConnectionSettingsModal.css';

interface ConnectionSettingsModalProps {
  onSave: (settings: ConnectionSettings) => void;
  initialSettings: ConnectionSettings;
  error?: string;
}

const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({ onSave, initialSettings, error }) => {
  const [settings, setSettings] = useState<ConnectionSettings>(initialSettings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Connection Settings</h2>
          </div>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="host">Host</label>
                <input type="text" id="host" name="host" value={settings.host} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="port">Port</label>
                <input type="number" id="port" name="port" value={settings.port} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username (optional)</label>
                <input type="text" id="username" name="username" value={settings.username} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password (optional)</label>
                <input type="password" id="password" name="password" value={settings.password} onChange={handleChange} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="save-button">Connect</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionSettingsModal;
