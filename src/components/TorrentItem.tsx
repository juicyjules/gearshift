import React from 'react';
import { type Torrent, TorrentStatus } from "../transmission-rpc/types";
import './TorrentItem.css';
import type { TorrentOverview } from '../entities/TorrentOverview';

// --- Helper Functions (with types) ---

/**
 * Converts a TorrentStatus enum into a readable string.
 */
const getTorrentStatusText = (status: TorrentStatus): string => {
  // Using a map is a clean alternative to a switch statement in TS
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

/**
 * Formats bytes into KB, MB, GB, etc.
 */
const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Formats ETA from seconds into a more readable string.
 */
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

  return (
    <div className={`torrent-item status-${statusText.toLowerCase().replace(' ', '-')}`}>
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
          <span>ETA: {status === TorrentStatus.Downloading ? "Coming" : 'N/A'}</span>
          <span>Ratio: {uploadRatio.toFixed(2)}</span>
        </div>
        <div>
          <span>Peers: {peersSendingToUs} / {peersGettingFromUs}</span>
        </div>
      </div>
    </div>
  );
};

export default TorrentItem;