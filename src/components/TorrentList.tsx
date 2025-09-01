import React from 'react';
import List from 'rc-virtual-list';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <div className="torrent-list-container">
      <AnimatePresence>
        <List
          data={torrents}
          itemKey="id"
          height={window.innerHeight - 160} // Adjust height based on viewport, accounting for navbar and other UI elements
          itemHeight={96}
        >
          {(torrent: TorrentOverview) => (
            <motion.div
              key={torrent.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <TorrentItem
                torrent={torrent}
                isSelected={selectedTorrents.has(torrent.id)}
                onTorrentClick={onTorrentClick}
              />
            </motion.div>
          )}
        </List>
      </AnimatePresence>
      {!torrents.length && !isLoading && <div className="empty"> No Torrents available. </div>}
    </div>
  );
};

export default TorrentList;