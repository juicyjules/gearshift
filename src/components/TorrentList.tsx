import React, { useEffect, useState } from 'react';
import { useTransmission } from '../contexts/TransmissionContext';
import { type Torrent } from "../transmission-rpc/types"; // The library exports its own types!
import TorrentItem from './TorrentItem';
import { type TorrentOverview, TorrentOverviewFields } from '../entities/TorrentOverview';

const TorrentList: React.FC = () => {
  const { transmission } = useTransmission();
  
  // Component-level state
  const [torrents, setTorrents] = useState<TorrentOverview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure the transmission client is available before making a call
    if (!transmission) {
      return;
    }
    console.log("asss")
    setIsLoading(true);
    setError(null);
    const fetchTorrents = async () => {
      try {
        // Use the library's methods directly. They are fully typed!
        const response = await transmission.torrents({
            fields: TorrentOverviewFields
        });
        
        if (response.torrents) {
          setTorrents(response.torrents as TorrentOverview[]);
        }
      } catch (err: any) {
        console.log(err)
        setError(err.message || 'Failed to fetch torrents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTorrents();
    const intervalId = setInterval(fetchTorrents, 750);
    return () => clearInterval(intervalId);

  }, [transmission]); // Re-run if the client instance ever changes

  if (isLoading) {
    return <div>Loading torrents...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Active Torrents</h2>
      <div >
        {torrents.map((torrent) => (
           <TorrentItem key={torrent.id} torrent={torrent} />
        ))}
      </div>
    </div>
  );
};

export default TorrentList;