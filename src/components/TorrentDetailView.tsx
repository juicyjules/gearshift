import React from 'react';
import {
  FaBox, FaChartLine, FaDownload, FaUpload, FaCalendarAlt,
  FaUser, FaFolder, FaComment, FaFile, FaLink
} from 'react-icons/fa';
import { type TorrentDetails } from '../entities/TorrentDetails';
import './TorrentDetailView.css';

const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon }) => (
  <div className="detail-item">
    <div className="detail-item-header">
      {icon}
      <span className="detail-label">{label}</span>
    </div>
    <span className="detail-value">{value}</span>
  </div>
);

interface TorrentDetailViewProps {
  torrent: TorrentDetails;
}

const TorrentDetailView: React.FC<TorrentDetailViewProps> = ({ torrent }) => {
  return (
    <div className="torrent-detail-view">
      <div className="detail-grid">
        {/* Row 1 */}
        <DetailItem icon={<FaBox className="icon" />} label="Size" value={formatBytes(torrent.totalSize)} />
        <DetailItem icon={<FaChartLine className="icon" />} label="Progress" value={`${(torrent.percentDone * 100).toFixed(2)}%`} />
        <DetailItem icon={<FaDownload className="icon" />} label="Downloaded" value={formatBytes(torrent.downloadedEver)} />
        <DetailItem icon={<FaUpload className="icon" />} label="Uploaded" value={formatBytes(torrent.uploadedEver)} />

        {/* Row 2 */}
        <DetailItem icon={<FaCalendarAlt className="icon" />} label="Created On" value={new Date(torrent.dateCreated * 1000).toLocaleDateString()} />
        <DetailItem icon={<FaUser className="icon" />} label="Creator" value={torrent.creator || 'N/A'} />
        <DetailItem icon={<FaFolder className="icon" />} label="Location" value={<span className="location-path">{torrent.downloadDir}</span>} />
        {torrent.comment && <DetailItem icon={<FaComment className="icon" />} label="Comment" value={torrent.comment} />}
      </div>

      <div className="detail-columns">
        <div className="detail-section">
          <h5 className="detail-section-title">Files ({torrent.files?.length || 0})</h5>
          <ul className="detail-list file-list">
            {torrent.files?.map((file, index) => (
              <li key={index}>
                {file.name} <span>({formatBytes(file.length)})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h5 className="detail-section-title">Trackers</h5>
          <ul className="detail-list tracker-list">
            {torrent.trackers?.map((tracker) => (
              <li key={tracker.id}>{tracker.announce}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="detail-section magnet-section">
         <h5 className="detail-section-title">Magnet Link</h5>
         <input
            className="magnet-link-input"
            type="text"
            readOnly
            value={torrent.magnetLink}
            onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
    </div>
  );
};

export default TorrentDetailView;
