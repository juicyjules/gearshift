import React from 'react';
import { type Tracker, type TrackerStat } from '../transmission-rpc/types';
import './TrackerItem.css';

interface TrackerItemProps {
  tracker: Tracker;
  trackerStat: TrackerStat;
}

// A simple function to format seconds into a relative time string
const formatRelativeTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const TrackerItem: React.FC<TrackerItemProps> = ({ tracker, trackerStat }) => {
  const { announce, sitename } = tracker;
  const {
    lastAnnounceSucceeded,
    lastAnnounceResult,
    lastAnnounceTime,
    seederCount,
    leecherCount,
  } = trackerStat;

  const announceTime = lastAnnounceTime > 0 ? formatRelativeTime(Date.now() / 1000 - lastAnnounceTime) : 'N/A';
  const statusClass = lastAnnounceSucceeded ? 'status-success' : 'status-error';

  return (
    <li className="tracker-item">
      <div className="tracker-main">
        <span className="tracker-url">{sitename || announce}</span>
      </div>
      <div className="tracker-stats">
        <span className={`tracker-status ${statusClass}`}>
          {lastAnnounceResult || (lastAnnounceSucceeded ? 'Success' : 'Failure')}
        </span>
        <span className="tracker-time">{announceTime}</span>
        <span className="tracker-seeders">Seeders: {seederCount}</span>
        <span className="tracker-leechers">Leechers: {leecherCount}</span>
      </div>
    </li>
  );
};

export default TrackerItem;
