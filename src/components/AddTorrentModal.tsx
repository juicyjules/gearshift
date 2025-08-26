import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import './AddTorrentModal.css';
import { useTransmission } from '../contexts/TransmissionContext';
import { type AddTorrentResponse } from '../transmission-rpc/types';

interface AddTorrentModalProps {
  onClose: () => void;
  initialFiles?: File[];
  initialMagnets?: string;
}

interface StagedTorrent {
  id: number;
  name: string;
  hashString: string;
  status: 'loading' | 'loaded' | 'error';
  error?: string;
}

type ActiveTab = 'files' | 'magnets';

const AddTorrentModal: React.FC<AddTorrentModalProps> = ({
  onClose,
  initialFiles = [],
  initialMagnets = '',
}) => {
  const { transmission } = useTransmission();
  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const [magnets, setMagnets] = useState(initialMagnets);
  const [stagedTorrents, setStagedTorrents] = useState<StagedTorrent[]>([]);
  const isSubmitted = useRef(false);

  const stageTorrents = useCallback(async (torrents: { metainfo?: string[]; magnets?: string[] }) => {
    if (!transmission) return;
    const { metainfo = [], magnets = [] } = torrents;

    for (const meta of metainfo) {
      const tempId = Date.now() + Math.random();
      setStagedTorrents(prev => [...prev, { id: tempId, name: 'Loading file...', hashString: tempId.toString(), status: 'loading' }]);
      try {
        const res = await transmission.add({ metainfo: meta, paused: true });
        const { torrentAdded } = res as AddTorrentResponse;
        setStagedTorrents(prev => prev.map(t => t.id === tempId ? { ...torrentAdded, status: 'loaded' } : t));
      } catch (error) {
        console.error("Failed to stage torrent:", error);
        setStagedTorrents(prev => prev.map(t => t.id === tempId ? { ...t, name: 'Failed to load file', status: 'error' } : t));
      }
    }

    for (const magnet of magnets) {
      const tempId = Date.now() + Math.random();
      setStagedTorrents(prev => [...prev, { id: tempId, name: 'Loading magnet...', hashString: tempId.toString(), status: 'loading' }]);
      try {
        const res = await transmission.add({ filename: magnet, paused: true });
        const { torrentAdded } = res as AddTorrentResponse;
        setStagedTorrents(prev => prev.map(t => t.id === tempId ? { ...torrentAdded, status: 'loaded' } : t));
      } catch (error) {
        console.error("Failed to stage torrent:", error);
        setStagedTorrents(prev => prev.map(t => t.id === tempId ? { ...t, name: 'Failed to load magnet', status: 'error' } : t));
      }
    }
  }, [transmission]);

  const readAndStageFiles = useCallback((files: File[]) => {
    const readers = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then(metainfo => stageTorrents({ metainfo }))
      .catch(error => console.error("Error reading files:", error));
  }, [stageTorrents]);

  useEffect(() => {
    if (initialFiles.length > 0) {
      readAndStageFiles(initialFiles);
    }
    if (initialMagnets) {
      stageTorrents({ magnets: initialMagnets.split('\n').filter(Boolean) });
    }
  }, [initialFiles, initialMagnets, stageTorrents, readAndStageFiles]);

  // Cleanup effect to remove staged torrents if the modal is closed without confirming
  useEffect(() => {
    return () => {
      if (isSubmitted.current) {
        return;
      }
      const torrentsToRemove = stagedTorrents.filter(t => t.status === 'loaded').map(t => t.id);
      if (torrentsToRemove.length > 0 && transmission) {
        console.log('Cleaning up staged torrents:', torrentsToRemove);
        transmission.remove(torrentsToRemove, true);
      }
    };
  }, [stagedTorrents, transmission]);


  const handleFileChange = useCallback((newFiles: FileList | null) => {
    if (newFiles) {
      readAndStageFiles(Array.from(newFiles));
    }
  }, [readAndStageFiles]);

  const handleMagnetPaste = useCallback((pastedText: string) => {
    const magnetRegex = /magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}/gi;
    const foundMagnets = pastedText.match(magnetRegex);
    if (foundMagnets) {
      stageTorrents({ magnets: foundMagnets });
    }
  }, [stageTorrents]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileChange(e.dataTransfer.files);
    } else {
      const droppedText = e.dataTransfer.getData('text');
      handleMagnetPaste(droppedText);
    }
  }, [handleFileChange, handleMagnetPaste]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleAdd = async () => {
    isSubmitted.current = true;
    const torrentIdsToStart = stagedTorrents.filter(t => t.status === 'loaded').map(t => t.id);
    if (torrentIdsToStart.length > 0 && transmission) {
      await transmission.start(torrentIdsToStart);
    }
    onClose();
  };

  const removeStagedTorrent = (id: number) => {
    const torrentToRemove = stagedTorrents.find(t => t.id === id);
    if (torrentToRemove && torrentToRemove.status === 'loaded' && transmission) {
      transmission.remove([id], true);
    }
    setStagedTorrents(prev => prev.filter(t => t.id !== id));
  };

  const handleAddMagnetsFromTextArea = () => {
    if (magnets.trim()) {
      handleMagnetPaste(magnets);
      setMagnets(''); // Clear textarea after adding
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content add-torrent-modal">
        <div className="modal-header">
          <h2>Add Torrents</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
          <button
            className={`tab-button ${activeTab === 'magnets' ? 'active' : ''}`}
            onClick={() => setActiveTab('magnets')}
          >
            Magnet Links
          </button>
        </div>
        <div className="staged-torrents-list">
          {stagedTorrents.map(t => (
            <div key={t.hashString} className={`staged-item status-${t.status}`}>
              <span className="staged-item-name">{t.name}</span>
              <button onClick={() => removeStagedTorrent(t.id)} className="remove-staged-btn">&times;</button>
            </div>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === 'files' && (
            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".torrent"
                onChange={handleFileSelect}
                className="file-input"
                id="torrent-file-input"
              />
              <label htmlFor="torrent-file-input" className="file-input-label">
                <p>Drag & drop .torrent files here, or click to select files.</p>
              </label>
            </div>
          )}
          {activeTab === 'magnets' && (
            <div className="magnet-input-container">
              <textarea
                className="magnet-textarea"
                placeholder="Paste magnet links here."
                value={magnets}
                onChange={(e) => setMagnets(e.target.value)}
                onPaste={(e) => handleMagnetPaste(e.clipboardData.getData('text'))}
              />
               <button onClick={handleAddMagnetsFromTextArea} className="btn btn-secondary">Add Links</button>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleAdd} className="btn btn-primary btn-with-icon">
            <FaPlus />
            <span>Add Torrents</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTorrentModal;
