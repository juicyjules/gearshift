import React, { useState, useEffect, useMemo } from 'react';
import TorrentList from './TorrentList';
import Navbar from './Navbar';
import { useTransmission } from '../contexts/TransmissionContext';
import { type TorrentOverview, TorrentOverviewFields } from '../entities/TorrentOverview';
import Fuse from 'fuse.js';

function Main() {
  const { transmission } = useTransmission();
  const [torrents, setTorrents] = useState<TorrentOverview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;

    const fetchTorrents = async () => {
      // Don't set loading to true on every refresh
      if (torrents.length === 0) {
        setIsLoading(true);
      }
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
    const intervalId = setInterval(fetchTorrents, 5000);

    return () => clearInterval(intervalId);
  }, [transmission, torrents.length]);

  const fuse = useMemo(() => new Fuse(torrents, {
    keys: ['name'],
    threshold: 0.4,
  }), [torrents]);

  const filteredTorrents = useMemo(() => {
    if (!searchTerm) return torrents;
    return fuse.search(searchTerm).map(result => result.item);
  }, [searchTerm, torrents, fuse]);

  return (
    <div className="App">
      <Navbar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
      <TorrentList torrents={filteredTorrents} isLoading={isLoading} error={error} />
    </div>
  );
}

export default Main;
