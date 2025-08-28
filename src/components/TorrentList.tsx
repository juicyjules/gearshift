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
  parentRef: React.RefObject<HTMLDivElement | null>;
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



  const torrentVariants = {
    hidden: { opacity: 0, translateX:-100},
    visible: { opacity: 1,translateX:0, transition: {
        duration: 0.2,
      },
},
    exit: { opacity: 0, translateX:100, transition: {
        duration: 0.2,
      },},
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

        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const torrent = torrents[virtualItem.index];
          return (
            <AnimatePresence>
            <motion.div
              key={torrent.id}
              variants={torrentVariants}
              initial="hidden"
              animate="visible"
              layout
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <TorrentItem
                torrent={torrent}
                isSelected={selectedTorrents.has(torrent.id)}
                onTorrentClick={onTorrentClick}
              />
            </motion.div>
          </AnimatePresence>  
          );
        })} 
      {!torrents.length &&  <div className="empty"> No Torrents available. </div>}
    </div>
  );
};

export default TorrentList;