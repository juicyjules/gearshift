import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useTransmission } from '../contexts/TransmissionContext';
import { type SessionStatsResponse } from '../transmission-rpc/types';

const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}/s`;
};

import { TorrentStatus } from '../transmission-rpc/types';

interface NavbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filterStatus: TorrentStatus | 'all';
  onFilterStatusChange: (status: TorrentStatus | 'all') => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
}) => {
  const { transmission } = useTransmission();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;

    const fetchStats = async () => {
      // Only set loading on the initial fetch
      if (!stats) setIsLoading(true);
      try {
        const response = await transmission.sessionStats();
        setStats(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch session stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 2000); // Refresh every 2 seconds

    return () => clearInterval(intervalId);
  }, [transmission, stats]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-brand">GEARSHIFT</h1>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search torrents..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-controls">
          <select
            className="navbar-select"
            value={filterStatus}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') {
                onFilterStatusChange('all');
              } else {
                onFilterStatusChange(parseInt(value, 10) as TorrentStatus);
              }
            }}
          >
            <option value="all">All Statuses</option>
            {Object.values(TorrentStatus)
              .filter(v => typeof v === 'number')
              .map((status) => (
                <option key={status} value={status}>
                  {TorrentStatus[status as number]}
                </option>
              ))}
          </select>
          <select
            className="navbar-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="totalSize">Sort by Size</option>
            <option value="percentDone">Sort by Progress</option>
          </select>
        </div>
        <div className="navbar-stats">
          {isLoading && <span>Loading...</span>}
          {error && <span className="error-message">{error}</span>}
          {stats && (
            <>
              <span>↓ {formatBytes(stats.downloadSpeed)}</span>
              <span>↑ {formatBytes(stats.uploadSpeed)}</span>
              <span className="stat-active">Active: {stats.activeTorrentCount}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
