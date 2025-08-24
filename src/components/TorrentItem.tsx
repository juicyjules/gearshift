import React, { useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import { TorrentStatus } from '../transmission-rpc/types';
import './TorrentItem.css';
import type { TorrentOverview } from '../entities/TorrentOverview';
import { useTransmission } from '../contexts/TransmissionContext';
import { TorrentDetailFields, type TorrentDetails } from '../entities/TorrentDetails';
import TorrentDetailView from './TorrentDetailView';
import RatioCircle from './RatioCircle';

// --- Helper Functions (with types) ---

const getTorrentStatusText = (status: TorrentStatus): string => {
  const statusMap: Record<TorrentStatus, string> = {
    [TorrentStatus.Stopped]: 'Stopped',
    [TorrentStatus.QueuedToVerify]: 'Check wait',
    [TorrentStatus.Verifying]: 'Checking',
    [TorrentStatus.QueuedToDownload]: 'Download wait',
    [TorrentStatus.Downloading]: 'Downloading',
    [TorrentStatus.QueuedToSeed]: 'Seed wait',
    [TorrentStatus.Seeding]: 'Seeding',
  };
  return statusMap[status] || 'Unknown';
};

const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatEta = (eta: number): string => {
  if (eta < 0) return '∞';
  if (eta === 0) return 'Done';

  const d = Math.floor(eta / 86400);
  const h = Math.floor((eta % 86400) / 3600);
  const m = Math.floor((eta % 3600) / 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);

  return parts.join(' ') || '< 1m';
};

// --- The Main Component ---

interface TorrentItemProps {
  torrent: TorrentOverview;
}

const TorrentItem: React.FC<TorrentItemProps> = ({ torrent }) => {
  const { transmission } = useTransmission();
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<TorrentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    name,
    status,
    percentDone,
    rateDownload,
    errorString,
    totalSize,
    rateUpload,
    uploadRatio,
    peersSendingToUs,
    peersGettingFromUs,
  } = torrent;

  const progressPercent = (percentDone * 100).toFixed(2);
  const statusText = getTorrentStatusText(status);

  const handleToggle = async () => {
    setIsOpen(!isOpen);
    if (!details && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await transmission.torrents({
          ids: [torrent.id],
          fields: TorrentDetailFields,
        });
        if (response.torrents && response.torrents.length > 0) {
          setDetails(response.torrents[0] as TorrentDetails);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch details');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isRunning = status !== TorrentStatus.Stopped;

  const handleStartStopClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the details view
    if (!transmission) return;

    try {
      if (isRunning) {
        await transmission.stop(torrent.id);
      } else {
        await transmission.start(torrent.id);
      }
    } catch (err: any) {
      console.error('Failed to start/stop torrent:', err);
      // Optionally, set an error state to show in the UI
    }
  };

  return (
    <div className={`torrent-item-container`}>
      <div
        className={`torrent-item status-${statusText.toLowerCase().replace(' ', '-')}`}
        onClick={handleToggle}
      >
        <div className="torrent-controls">
          <button className={`control-button ${isRunning ? 'running' : 'paused'}`} onClick={handleStartStopClick}>
            {isRunning ? <FaPause /> : <FaPlay />}
          </button>
        </div>
        <div className="torrent-main-info">
          <h3 className="torrent-name">{name}</h3>
          <div className="progress-bar">
            <div
              className="progress-bar-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="torrent-sub-info">
            <span>{statusText}</span>
            <span>{progressPercent}%</span>
            <span>{formatBytes(totalSize)}</span>
          </div>
        </div>
        <div className="torrent-stats">
          <span className="stat stat-download">↓ {formatBytes(rateDownload)}/s</span>
          <span className="stat stat-upload">↑ {formatBytes(rateUpload)}/s</span>
          <span className="stat">ETA: {formatEta(torrent.eta)}</span>
          <RatioCircle ratio={uploadRatio} />
          <span className="stat">Peers: <span className="stat-download">{peersGettingFromUs}</span>/<span className="stat-upload">{peersSendingToUs}</span></span>
        </div>
        {errorString && <p className="torrent-error">Error: {errorString}</p>}
      </div>
      <div className={`torrent-details ${isOpen ? 'open' : ''}`}>
        {isLoading && <div className="loading-indicator">Loading details...</div>}
        {error && <div className="error-message">{error}</div>}
        {details && <TorrentDetailView torrent={details} />}
      </div>
    </div>
  );
};

export default TorrentItem;