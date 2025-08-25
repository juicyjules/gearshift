import React from 'react';
import TorrentItem from './TorrentItem';
import './TorrentList.css';
import { type TorrentOverview } from '../entities/TorrentOverview';

interface TorrentListProps {
  torrents: TorrentOverview[];
  isLoading: boolean;
  error: string | null;
  selectedTorrents: Set<number>;
  onTorrentClick: (id: number, isCtrlPressed: boolean, isShiftPressed: boolean) => void;
}

const TorrentList: React.FC<TorrentListProps> = ({
  torrents,
  isLoading,
  error,
  selectedTorrents,
  onTorrentClick,
}) => {
  if (isLoading) {
    return <div>Loading torrents...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (torrents.length === 0) {
    return <div className="empty"> No Torrents available. </div>;
  }

  return (
    <div className="torrent-list">
      {torrents.map((torrent) => (
        <TorrentItem
          key={torrent.id}
          torrent={torrent}
          isSelected={selectedTorrents.has(torrent.id)}
          onTorrentClick={onTorrentClick}
        />
      ))}
    </div>
  );
};

export default TorrentList;