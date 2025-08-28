import React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence, spring } from 'framer-motion';
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
  const rowVirtualizer = useWindowVirtualizer({
    count: torrents.length,
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
    hidden: { opacity: 0, scale:0.4},
    visible: { opacity: 1,scale:1, transition: {
        duration: 0.2,
        type: spring
      },
},
    exit: {opacity: 0,transition: {
        duration: 0.3,
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
              initial={rowVirtualizer.isScrolling ? false : "hidden"}
              animate={rowVirtualizer.isScrolling ? false : "visible"}
              layout={rowVirtualizer.isScrolling ? false : true}
              exit={rowVirtualizer.isScrolling ? undefined : "exit"}
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