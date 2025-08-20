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

interface NavbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchTerm, onSearchTermChange }) => {
  const { transmission } = useTransmission();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await transmission.stats();
        setStats(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch session stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [transmission]);

  return (
    <nav className="navbar">
      <div className="navbar-stats">
        {isLoading && <span>Loading stats...</span>}
        {error && <span className="error-message">{error}</span>}
        {stats && (
          <>
            <span>↓ {formatBytes(stats.downloadSpeed)}</span>
            <span>↑ {formatBytes(stats.uploadSpeed)}</span>
            <span>Active: {stats.activeTorrentCount}</span>
          </>
        )}
      </div>
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search torrents..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
    </nav>
  );
};

export default Navbar;
