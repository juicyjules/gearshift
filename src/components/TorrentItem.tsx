import React, { useState } from 'react';
import { TorrentStatus } from '../transmission-rpc/types';
import './TorrentItem.css';
import type { TorrentOverview } from '../entities/TorrentOverview';
import { useTransmission } from '../contexts/TransmissionContext';
import { TorrentDetailFields, type TorrentDetails } from '../entities/TorrentDetails';
import TorrentDetailView from './TorrentDetailView';

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

  return (
    <div className={`torrent-item-container`}>
      <div
        className={`torrent-item status-${statusText.toLowerCase().replace(' ', '-')}`}
        onClick={handleToggle}
      >
        <h3 className="torrent-name">{name}</h3>
        {errorString && <p className="torrent-error">Error: {errorString}</p>}
        <div className="progress-bar">
          <div
            className="progress-bar-inner"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="torrent-status-line">
          <span>{statusText} ({progressPercent}%)</span>
          <span>{formatBytes(totalSize)}</span>
        </div>
        <div className="torrent-stats">
          <div>
            <span>↓ {formatBytes(rateDownload)}/s</span>
            <span>↑ {formatBytes(rateUpload)}/s</span>
          </div>
          <div>
            <span>ETA: {formatEta(torrent.eta)}</span>
            <span>Ratio: {uploadRatio.toFixed(2)}</span>
          </div>
          <div>
            <span>Peers: {peersSendingToUs} / {peersGettingFromUs}</span>
          </div>
        </div>
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