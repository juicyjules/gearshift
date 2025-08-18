import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getTorrentStatus = (status) => {
  switch (status) {
    case 0: return 'Stopped';
    case 1: return 'Queued to check';
    case 2: return 'Checking';
    case 3: return 'Queued to download';
    case 4: return 'Downloading';
    case 5: return 'Queued to seed';
    case 6: return 'Seeding';
    default: return 'Unknown';
  }
};

const getStatusColor = (status) => {
    switch (status) {
      case 4: return 'bg-blue-100 text-blue-800'; // Downloading
      case 6: return 'bg-green-100 text-green-800'; // Seeding
      case 0: return 'bg-gray-100 text-gray-800'; // Stopped
      default: return 'bg-yellow-100 text-yellow-800'; // Other
    }
}

const TorrentList = () => {
  const [torrents, setTorrents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTorrents = async () => {
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:3001/api/rpc', {
          method: 'torrent-get',
          arguments: {
            fields: [
              'id',
              'name',
              'status',
              'totalSize',
              'percentDone',
              'rateDownload',
              'rateUpload',
              'eta',
              'errorString',
            ],
          },
        });

        if (response.data.result === 'success') {
          setTorrents(response.data.arguments.torrents);
        } else {
          setError('Failed to fetch torrents.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTorrents();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading torrents...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Torrents</h1>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Done</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {torrents.map((torrent) => (
                    <tr key={torrent.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{torrent.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(torrent.status)}`}>
                          {getTorrentStatus(torrent.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(torrent.totalSize / 1e9).toFixed(2)} GB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(torrent.percentDone * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorrentList;
