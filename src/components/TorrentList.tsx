import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
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
  parentRef: React.RefObject<HTMLDivElement>;
}

const TorrentList: React.FC<TorrentListProps> = ({
  torrents,
  isLoading,
  error,
  selectedTorrents,
  onTorrentClick,
  parentRef,
}) => {
  const rowVirtualizer = useVirtualizer({
    count: torrents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 96, // 80px for item + 16px for margin-bottom
    overscan: 5,
  });

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
    <div
      className="torrent-list"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      <AnimatePresence>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const torrent = torrents[virtualItem.index];
          return (
            <motion.div
              key={torrent.id} // Key should be stable for AnimatePresence
              layout
              variants={torrentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TorrentItem
                torrent={torrent}
                isSelected={selectedTorrents.has(torrent.id)}
                onTorrentClick={onTorrentClick}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TorrentList;