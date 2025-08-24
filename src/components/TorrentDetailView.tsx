import React, { useState, useEffect } from 'react';
import {
  FaBox, FaChartLine, FaDownload, FaUpload, FaCalendarAlt,
  FaUser, FaFolder, FaComment, FaFile, FaLink, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useTransmission } from '../contexts/TransmissionContext';
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
  const { transmission } = useTransmission();
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<boolean[]>([]);

  const files = torrent.files || [];
  const fileStats = torrent.fileStats || [];
  const filesToShow = filesExpanded ? files : files.slice(0, 5);

  useEffect(() => {
    if (fileStats.length > 0) {
      setSelectedFiles(fileStats.map(stat => stat.wanted));
    }
  }, [fileStats]);

  const handleFileCheck = (index: number, checked: boolean) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles[index] = checked;
    setSelectedFiles(newSelectedFiles);
  };

  const handleApplyChanges = async () => {
    if (!transmission) return;

    const filesWanted: number[] = [];
    const filesUnwanted: number[] = [];

    selectedFiles.forEach((wanted, index) => {
      if (wanted !== fileStats[index].wanted) {
        if (wanted) {
          filesWanted.push(index);
        } else {
          filesUnwanted.push(index);
        }
      }
    });

    try {
      await transmission.set({
        ids: [torrent.id],
        filesWanted,
        filesUnwanted,
      });
    } catch (err) {
      console.error('Failed to update file selection:', err);
    }
  };

  return (
    <div className="torrent-detail-view">
      <div className="detail-section">
        <h5 className="detail-section-title">Transfer</h5>
        <div className="detail-grid">
          <DetailItem icon={<FaDownload className="icon" />} label="Downloaded" value={formatBytes(torrent.downloadedEver)} />
          <DetailItem icon={<FaUpload className="icon" />} label="Uploaded" value={formatBytes(torrent.uploadedEver)} />
          <DetailItem icon={<FaChartLine className="icon" />} label="Ratio" value={torrent.uploadRatio.toFixed(2)} />
        </div>
      </div>

      <div className="detail-section">
        <h5 className="detail-section-title">Details</h5>
        <div className="detail-grid">
          <DetailItem icon={<FaBox className="icon" />} label="Size" value={formatBytes(torrent.totalSize)} />
          <DetailItem icon={<FaChartLine className="icon" />} label="Progress" value={`${(torrent.percentDone * 100).toFixed(2)}%`} />
          <DetailItem icon={<FaCalendarAlt className="icon" />} label="Created On" value={new Date(torrent.dateCreated * 1000).toLocaleDateString()} />
          <DetailItem icon={<FaUser className="icon" />} label="Creator" value={torrent.creator || 'N/A'} />
          <DetailItem icon={<FaFolder className="icon" />} label="Location" value={<span className="location-path">{torrent.downloadDir}</span>} />
          {torrent.comment && <DetailItem icon={<FaComment className="icon" />} label="Comment" value={torrent.comment} />}
        </div>
      </div>

      <div className="detail-columns">
        <div className="detail-section">
          <div className="file-list-header">
            <h5 className="detail-section-title">Files ({files.length})</h5>
            <button className="apply-button" onClick={handleApplyChanges}>Apply Changes</button>
          </div>
          <ul className="detail-list file-list">
            {filesToShow.map((file, index) => (
              <li key={index}>
                <input
                  type="checkbox"
                  id={`file-${index}`}
                  checked={selectedFiles[index] ?? false}
                  onChange={(e) => handleFileCheck(index, e.target.checked)}
                />
                <label htmlFor={`file-${index}`}>{file.name}</label>
                <span>({formatBytes(file.length)})</span>
              </li>
            ))}
          </ul>
          {files.length > 5 && (
            <button className="expand-button" onClick={() => setFilesExpanded(!filesExpanded)}>
              {filesExpanded ? <><FaChevronUp /> Show Less</> : <><FaChevronDown /> Show More</>}
            </button>
          )}
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
