import React, { useState, useEffect } from 'react';
import { FaArrowDown, FaArrowUp, FaSortAmountDown, FaSortAmountUp, FaFilter, FaSort, FaCog, FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import './Navbar.css';
import CustomDropdown from './CustomDropdown';
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
import { type SortDirection } from './Main';

interface NavbarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onFilterStatusChange: (status: TorrentStatus | 'all') => void;
  onSortByChange: (sortBy: string) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (direction: SortDirection) => void;
  showOnlyActive: boolean;
  onShowOnlyActiveChange: (show: boolean) => void;
  onSettingsClick: () => void;
  onStartAll: () => void;
  onStopAll: () => void;
}

const Navbar = React.forwardRef<HTMLInputElement, NavbarProps>(({
  searchTerm,
  onSearchTermChange,
  onFilterStatusChange,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  showOnlyActive,
  onShowOnlyActiveChange,
  onSettingsClick,
  onStartAll,
  onStopAll,
}, ref) => {
  const { transmission } = useTransmission();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transmission) return;
    if (!stats) setIsLoading(true);
    const fetchStats = async () => {
      // Only set loading on the initial fetch
      try {
        const response = await transmission.stats();
        setStats(response);
      } catch {
        setError('Failed to fetch session stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 750); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [transmission, stats]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <h1 className="navbar-brand">GEARSHIFT</h1>
        </div>
        <div className="global-controls">
          <button className="global-control-button" onClick={onStartAll} title="Start all filtered torrents">
            <FaPlayCircle />
          </button>
          <button className="global-control-button" onClick={onStopAll} title="Stop all filtered torrents">
            <FaPauseCircle />
          </button>
        </div>
        <div className="navbar-search">
          <input
            ref={ref}
            type="text"
            placeholder="Search torrents..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-controls">
          <CustomDropdown
            trigger={<button className="control-button"><FaFilter /></button>}
            options={[
              { value: 'all', label: 'All Statuses' },
              ...Object.values(TorrentStatus)
                .filter(v => typeof v === 'number')
                .map((status) => ({
                  value: status as number,
                  label: TorrentStatus[status as number],
                }))
            ]}
            onSelect={(value) => onFilterStatusChange(value as TorrentStatus | 'all')}
          />
          <div className="control-group">
            <CustomDropdown
              trigger={<button className="control-button"><FaSort /></button>}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'totalSize', label: 'Size' },
                { value: 'percentDone', label: 'Progress' },
              ]}
              onSelect={(value) => onSortByChange(value as string)}
            />
            <button
              className="sort-direction-button"
              onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
        <div className="navbar-stats">
          {isLoading && <span>Loading...</span>}
          {error && <span className="error-message">{error}</span>}
          {stats && (
            <>
              <span className="stat-item"><FaArrowDown /> {formatBytes(stats.downloadSpeed)}</span>
              <span className="stat-item"><FaArrowUp /> {formatBytes(stats.uploadSpeed)}</span>
              <button
                className={`stat-active ${showOnlyActive ? 'active' : ''}`}
                onClick={() => onShowOnlyActiveChange(!showOnlyActive)}
              >
                Active: {stats.activeTorrentCount}
              </button>
            </>
          )}
        </div>
        <button className="settings-button" onClick={onSettingsClick}>
          <FaCog />
        </button>
      </div>
    </header>
  );
});

export default Navbar;
