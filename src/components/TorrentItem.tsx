import React, { useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import { TorrentStatus } from '../transmission-rpc/types';
import './TorrentItem.css';
import type { TorrentOverview } from '../entities/TorrentOverview';
import { useTransmission } from '../contexts/TransmissionContext';
import { TorrentDetailFields, type TorrentDetails } from '../entities/TorrentDetails';
import TorrentDetailView from './TorrentDetailView';
import RatioCircle from './RatioCircle';
import { formatBytes, formatEta, getTorrentStatusText } from '../utils/formatting';

import { useEffect, useRef } from 'react';

interface TorrentItemProps {
  torrent: TorrentOverview;
  isSelected: boolean;
  onTorrentClick: (id: number, isCtrlPressed: boolean, isShiftPressed: boolean) => void;
  measure: (element: HTMLElement | null) => void;
}

const TorrentItem: React.FC<TorrentItemProps> = ({ torrent, isSelected, onTorrentClick, measure }) => {
  const { transmission } = useTransmission();
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<TorrentDetails | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      measure(elementRef.current);
    }
  }, [isOpen, details, measure]);
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
        if (!transmission) return;
        const response = await transmission.torrents({
          ids: [torrent.id],
          fields: TorrentDetailFields,
        });
        if (response.torrents && response.torrents.length > 0) {
          setDetails(response.torrents[0] as TorrentDetails);
        }
      } catch {
        setError('Failed to fetch details');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.torrent-controls')) {
      return;
    }
    onTorrentClick(torrent.id, e.ctrlKey || e.metaKey, e.shiftKey);
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
    } catch {
      console.error('Failed to start/stop torrent:');
      // Optionally, set an error state to show in the UI
    }
  };

  const handleDoubleClick = () => {
    handleToggle();
  };

  return (
    <div ref={elementRef} className={`torrent-item-container ${isSelected ? 'selected' : ''}`}>
      <div
        className={`torrent-item status-${statusText.toLowerCase().replace(' ', '-')}`}
        onClick={handleItemClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="torrent-primary-info">
          <div className="torrent-controls">
            <button
              className={`control-button ${isRunning ? 'running' : 'paused'}`}
              onClick={handleStartStopClick}
            >
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