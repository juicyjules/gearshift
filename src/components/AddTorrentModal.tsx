import React, { useState, useCallback, useEffect } from 'react';
import './AddTorrentModal.css';

interface AddTorrentModalProps {
  onAdd: (args: { metainfo?: string[]; magnets?: string[] }) => void;
  onClose: () => void;
  initialFiles?: File[];
  initialMagnets?: string;
}

type ActiveTab = 'files' | 'magnets';

const AddTorrentModal: React.FC<AddTorrentModalProps> = ({
  onAdd,
  onClose,
  initialFiles = [],
  initialMagnets = '',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [magnets, setMagnets] = useState(initialMagnets);

  useEffect(() => {
    if (initialFiles.length > 0) {
      setActiveTab('files');
    } else if (initialMagnets) {
      setActiveTab('magnets');
    }
  }, [initialFiles, initialMagnets]);

  const handleFileChange = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(newFiles)]);
    }
  };

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
    handleFileChange(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleAdd = async () => {
    const args: { metainfo?: string[]; magnets?: string[] } = {};

    if (files.length > 0) {
      args.metainfo = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
    }

    if (magnets.trim()) {
      args.magnets = magnets.split('\n').filter(link => link.trim().startsWith('magnet:'));
    }

    if (args.metainfo || args.magnets) {
      onAdd(args);
    } else {
      onClose();
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
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'magnets' && (
            <div className="magnet-input-container">
              <textarea
                className="magnet-textarea"
                placeholder="Enter magnet links, one per line."
                value={magnets}
                onChange={(e) => setMagnets(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Torrents
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTorrentModal;
