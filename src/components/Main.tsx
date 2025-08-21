import React, { useState, useEffect, useMemo } from 'react';
import TorrentList from './TorrentList';
import Navbar from './Navbar';
import { useTransmission } from '../contexts/TransmissionContext';
import { type TorrentOverview, TorrentOverviewFields } from '../entities/TorrentOverview';
import Fuse from 'fuse.js';

import { TorrentStatus } from '../transmission-rpc/types';

type SortDirection = 'asc' | 'desc';

function Main() {
  const { transmission } = useTransmission();
  const [torrents, setTorrents] = useState<TorrentOverview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TorrentStatus | 'all'>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;

    const fetchTorrents = async () => {
      if (torrents.length === 0) setIsLoading(true);
      try {
        const response = await transmission.torrents({ fields: TorrentOverviewFields });
        if (response.torrents) {
          setTorrents(response.torrents as TorrentOverview[]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch torrents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTorrents();
    const intervalId = setInterval(fetchTorrents, 2000);

    return () => clearInterval(intervalId);
  }, [transmission, torrents.length]);

  const fuse = useMemo(() => new Fuse(torrents, {
    keys: ['name'],
    threshold: 0.4,
  }), [torrents]);

  const processedTorrents = useMemo(() => {
    let result: TorrentOverview[] = torrents;

    // Fuzzy search
    if (searchTerm) {
      result = fuse.search(searchTerm).map(res => res.item);
    }

    // Filter by status dropdown
    if (filterStatus !== 'all') {
      result = result.filter(torrent => torrent.status === filterStatus);
    }

    // Filter by "active" toggle
    if (showOnlyActive) {
      const activeStatuses = [
        TorrentStatus.Downloading,
        TorrentStatus.Seeding,
        TorrentStatus.QueuedToDownload,
        TorrentStatus.QueuedToSeed,
        TorrentStatus.Verifying,
        TorrentStatus.QueuedToVerify,
      ];
      result = result.filter(torrent => activeStatuses.includes(torrent.status));
    }

    // Sorting
    const sortedResult = [...result].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'totalSize':
          return (a.totalSize - b.totalSize) * dir;
        case 'percentDone':
          return (a.percentDone - b.percentDone) * dir;
        default:
          return 0;
      }
    });

    return sortedResult;
  }, [searchTerm, filterStatus, showOnlyActive, sortBy, sortDirection, torrents, fuse]);

  return (
    <div className="App">
      <Navbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        showOnlyActive={showOnlyActive}
        onShowOnlyActiveChange={setShowOnlyActive}
      />
      <TorrentList torrents={processedTorrents} isLoading={isLoading} error={error} />
    </div>
  );
}

export default Main;
