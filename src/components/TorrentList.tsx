import React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
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

  const items = rowVirtualizer.getVirtualItems();

  if (isLoading) {
    return <div>Loading torrents...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div
      className="torrent-list"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {items.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {items.map((virtualItem) => {
            const torrent = torrents[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                ref={rowVirtualizer.measureElement}
                data-index={virtualItem.index}
              >
                <TorrentItem
                  torrent={torrent}
                  isSelected={selectedTorrents.has(torrent.id)}
                  onTorrentClick={onTorrentClick}
                />
              </div>
            );
          })}
        </div>
      )}
      {!torrents.length && !isLoading && <div className="empty"> No Torrents available. </div>}
    </div>
  );
};

export default TorrentList;