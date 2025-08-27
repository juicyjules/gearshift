import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowDown, FaArrowUp, FaSortAmountDown, FaSortAmountUp, FaFilter, FaSort, FaCog, FaPlayCircle, FaPauseCircle } from 'react-icons/fa';
import './Navbar.css';
import CustomDropdown from './CustomDropdown';
import { useTransmission } from '../contexts/TransmissionContext';
import { type SessionStatsResponse } from '../transmission-rpc/types';
import { formatBytes } from '../utils/formatting';

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
  areAnyTorrentsActive: boolean;
  onToggleAllClick: () => void;
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
  areAnyTorrentsActive,
  onToggleAllClick,
}, ref) => {
  const { transmission } = useTransmission();
  const [stats, setStats] = useState<SessionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!transmission) return;

    const fetchStats = async () => {
      try {
        const response = await transmission.stats();
        setStats(response);
      } catch {
        setError('Failed to fetch session stats');
      } finally {
        if (!initialFetchDone.current) {
          setIsLoading(false);
          initialFetchDone.current = true;
        }
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 750);
    return () => clearInterval(intervalId);
  }, [transmission]);

  const renderFilterControls = () => (
    <>
      <div className="navbar-search">
        <input
          ref={ref}
          type="text"
          placeholder="Search torrents..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
      <div className="navbar-controls">
        <CustomDropdown
          trigger={
            <motion.button className="control-button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <FaFilter /> Filter
            </motion.button>
          }
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
            trigger={
              <motion.button className="control-button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <FaSort /> Sort
              </motion.button>
            }
            options={[
              { value: 'name', label: 'Name' },
              { value: 'totalSize', label: 'Size' },
              { value: 'percentDone', label: 'Progress' },
            ]}
            onSelect={(value) => onSortByChange(value as string)}
          />
          <motion.button
            className="sort-direction-button"
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            whileTap={{ scale: 0.9 }}
          >
            {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </motion.button>
        </div>
      </div>
    </>
  );

  return (
    <header className={`navbar ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <div className="navbar-main">
        <div className="navbar-left">
          <div className="navbar-logo">
            <h1 className="navbar-brand">GEARSHIFT</h1>
          </div>
          <div className="global-controls">
            <motion.button
              className="global-control-button"
              onClick={onToggleAllClick}
              title={areAnyTorrentsActive ? 'Stop all filtered torrents' : 'Start all filtered torrents'}
              whileTap={{ scale: 0.9 }}
            >
              {areAnyTorrentsActive ? <FaPauseCircle /> : <FaPlayCircle />}
            </motion.button>
          </div>
        </div>
        <div className="navbar-right">
          <div className="desktop-controls">
            {renderFilterControls()}
          </div>
          <div className="navbar-stats">
            {isLoading && <span>Loading...</span>}
            {error && <span className="error-message">{error}</span>}
            {stats && (
              <>
                <span className="stat-item"><FaArrowDown /> {formatBytes(stats.downloadSpeed)}/s</span>
                <span className="stat-item"><FaArrowUp /> {formatBytes(stats.uploadSpeed)}/s</span>
                <motion.button
                  className={`stat-active ${showOnlyActive ? 'active' : ''}`}
                  onClick={() => onShowOnlyActiveChange(!showOnlyActive)}
                  whileTap={{ scale: 0.95 }}
                >
                  Active: {stats.activeTorrentCount}
                </motion.button>
              </>
            )}
          </div>
          <motion.button className="settings-button" onClick={onSettingsClick} whileTap={{ scale: 0.9 }}>
            <FaCog />
          </motion.button>
          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <FaFilter />
          </motion.button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {renderFilterControls()}
        </motion.div>
      )}
    </header>
  );
});

export default Navbar;
