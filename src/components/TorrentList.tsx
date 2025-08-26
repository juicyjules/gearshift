import React from 'react';
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

  if (torrents.length === 0) {
    return <div className="empty"> No Torrents available. </div>;
  }

  const torrentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="torrent-list">
      <AnimatePresence>
        {torrents.map((torrent) => (
          <motion.div
            key={torrent.id}
            layout
            variants={torrentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <TorrentItem
              torrent={torrent}
              isSelected={selectedTorrents.has(torrent.id)}
              onTorrentClick={onTorrentClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TorrentList;