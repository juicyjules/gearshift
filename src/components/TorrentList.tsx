import React from 'react';
import TorrentItem from './TorrentItem';
import { type TorrentOverview } from '../entities/TorrentOverview';

interface TorrentListProps {
  torrents: TorrentOverview[];
  isLoading: boolean;
  error: string | null;
}

const TorrentList: React.FC<TorrentListProps> = ({ torrents, isLoading, error }) => {
  if (isLoading) {
    return <div>Loading torrents...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (torrents.length === 0) {
    return <div>No torrents found.</div>;
  }

  return (
    <div>
      <div>
        {torrents.map((torrent) => (
          <TorrentItem key={torrent.id} torrent={torrent} />
        ))}
      </div>
    </div>
  );
};

export default TorrentList;