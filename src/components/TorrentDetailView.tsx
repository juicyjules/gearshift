import React from 'react';
import { type TorrentDetails } from '../entities/TorrentDetails';

interface TorrentDetailViewProps {
  torrent: TorrentDetails;
}

const TorrentDetailView: React.FC<TorrentDetailViewProps> = ({ torrent }) => {
  return (
    <div>
      <h4>Details for {torrent.name}</h4>
      <p>Comment: {torrent.comment}</p>
      <p>Creator: {torrent.creator}</p>
      <p>Date Created: {new Date(torrent.dateCreated * 1000).toLocaleString()}</p>
      <p>Download Dir: {torrent.downloadDir}</p>
      <p>Downloaded: {torrent.downloadedEver}</p>
      <p>Uploaded: {torrent.uploadedEver}</p>
      <p>Magnet Link: {torrent.magnetLink}</p>
      <div>
        <h5>Files:</h5>
        <ul>
          {torrent.files?.map((file, index) => (
            <li key={index}>{file.name} ({file.length} bytes)</li>
          ))}
        </ul>
      </div>
      <div>
        <h5>Trackers:</h5>
        <ul>
          {torrent.trackers?.map((tracker, index) => (
            <li key={index}>{tracker.announce}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TorrentDetailView;
