import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import TorrentList from './TorrentList';
import Navbar from './Navbar';
import SettingsModal from './SettingsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddTorrentModal from './AddTorrentModal';
import Notification from './Notification';
import FloatingToolbar from './FloatingToolbar';
import Dropzone from './Dropzone';
import { useTorrentSelection } from '../hooks/useTorrentSelection';
import { useTransmission } from '../contexts/TransmissionContext';
import { type TorrentOverview, TorrentOverviewFields } from '../entities/TorrentOverview';
import Fuse from 'fuse.js';

import { TorrentStatus } from '../transmission-rpc/types';

export type SortDirection = 'asc' | 'desc';

function Main() {
  const { transmission } = useTransmission();
  const [torrents, setTorrents] = useState<TorrentOverview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TorrentStatus | 'all'>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [initialMagnets, setInitialMagnets] = useState('');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleDropEvent = (dataTransfer: DataTransfer) => {
    // 1. Check for .torrent files
    const torrentFiles = Array.from(dataTransfer.files).filter(file =>
      file.name.endsWith('.torrent')
    );

    if (torrentFiles.length > 0) {
      setInitialFiles(torrentFiles);
      setInitialMagnets('');
      setIsAddModalOpen(true);
      return;
    }

    // 2. If no files, check for magnet links in any text-like data
    let droppedText = '';
    const types = dataTransfer.types;

    // Prioritize URI lists, then plain text
    if (types.includes('text/uri-list')) {
        droppedText = dataTransfer.getData('text/uri-list');
    } else if (types.includes('text/plain')) {
        droppedText = dataTransfer.getData('text/plain');
    }

    // A more forgiving regex to find any magnet link
    const magnetRegex = /(magnet:\?xt=urn:[a-z0-9]+:[a-zA-Z0-9&.=:%+-]+)/gi;
    const foundMagnets = droppedText.match(magnetRegex);

    if (foundMagnets && foundMagnets.length > 0) {
      setInitialFiles([]);
      setInitialMagnets(foundMagnets.join('\n'));
      setIsAddModalOpen(true);
    } else {
        console.log("No .torrent files or magnet links found in drop data.");
        console.log("DataTransfer types:", types);
        console.log("Dropped text:", droppedText);
    }
  };

  const fuse = useMemo(() => new Fuse(torrents, {
    keys: ['name'],
    threshold: 0.4,
  }), [torrents]);

  const processedTorrents = useMemo(() => {
    let result: TorrentOverview[] = torrents;

    // Fuzzy search
    if (searchTerm) {
      result = fuse.search(searchTerm).map(res => res.item);
    }

    // Filter by status dropdown
    if (filterStatus !== 'all') {
      result = result.filter(torrent => torrent.status === filterStatus);
    }

    // Filter by "active" toggle
    if (showOnlyActive) {
      const activeStatuses = [
        TorrentStatus.Downloading,
        TorrentStatus.Seeding,
        TorrentStatus.QueuedToDownload,
        TorrentStatus.QueuedToSeed,
        TorrentStatus.Verifying,
        TorrentStatus.QueuedToVerify,
      ];
      result = result.filter(torrent => activeStatuses.includes(torrent.status));
    }

    // Sorting
    const sortedResult = [...result].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name) * dir;
        case 'totalSize':
          return (a.totalSize - b.totalSize) * dir;
        case 'percentDone':
          return (a.percentDone - b.percentDone) * dir;
        default:
          return 0;
      }
    });

    return sortedResult;
  }, [searchTerm, filterStatus, showOnlyActive, sortBy, sortDirection, torrents, fuse]);

  const { selectedTorrents, setSelectedTorrents, handleTorrentClick } = useTorrentSelection(processedTorrents);

  useEffect(() => {
    if (!transmission) return;

    const fetchTorrents = async () => {
      if (torrents.length === 0) setIsLoading(true);
      try {
        const response = await transmission.torrents({ fields: TorrentOverviewFields });
        if (response.torrents) {
          setTorrents(response.torrents as TorrentOverview[]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch torrents');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTorrents();
    const intervalId = setInterval(fetchTorrents, 750);

    return () => clearInterval(intervalId);
  }, [transmission, torrents.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const allIds = new Set(processedTorrents.map(t => t.id));
        setSelectedTorrents(allIds);
        return;
      }
      if (
        (event.target as HTMLElement).tagName.toLowerCase() !== 'input' &&
        (event.target as HTMLElement).tagName.toLowerCase() !== 'textarea' &&
        !event.metaKey && !event.ctrlKey && !event.altKey
      ) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [processedTorrents, setSelectedTorrents]);

  const handleStartAll = async () => {
    if (!transmission) return;
    const ids = processedTorrents.map(t => t.id);
    try {
      await transmission.start(ids);
    } catch {
      console.error('Failed to start all torrents:');
    }
  };

  const handleStopAll = async () => {
    if (!transmission) return;
    const ids = processedTorrents.map(t => t.id);
    try {
      await transmission.stop(ids);
    } catch {
      console.error('Failed to stop all torrents:');
    }
  };

  const areAnyTorrentsActive = useMemo(() => {
    return processedTorrents.some(t => t.status !== TorrentStatus.Stopped);
  }, [processedTorrents]);

  const handleToggleAllClick = () => {
    if (areAnyTorrentsActive) {
      handleStopAll();
    } else {
      handleStartAll();
    }
  };
  

  const handleDeleteClick = () => {
    if (selectedTorrents.size > 0) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async (deleteData: boolean) => {
    if (!transmission) return;
    const count = selectedTorrents.size;
    try {
      await transmission.remove(Array.from(selectedTorrents), deleteData);
      setSelectedTorrents(new Set()); // Clear selection
      showNotification(`${count} torrent(s) deleted successfully.`, 'success');
    } catch (err) {
      console.error('Failed to delete torrents:', err);
      showNotification(`Failed to delete torrents.`, 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddClick = () => {
    setInitialFiles([]);
    setInitialMagnets('');
    setIsAddModalOpen(true);
  };

  return (
    <Dropzone onDrop={handleDropEvent}>
      <div className="App">
        <Navbar
          ref={searchInputRef}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onFilterStatusChange={setFilterStatus}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        showOnlyActive={showOnlyActive}
        onShowOnlyActiveChange={setShowOnlyActive}
        onSettingsClick={() => setIsSettingsOpen(true)}
        areAnyTorrentsActive={areAnyTorrentsActive}
        onToggleAllClick={handleToggleAllClick}
      />
      <div className="app-container">
        <TorrentList
          torrents={processedTorrents}
          isLoading={isLoading}
          error={error}
          selectedTorrents={selectedTorrents}
          onTorrentClick={handleTorrentClick}
        />
      </div>
      <FloatingToolbar
        selectedCount={selectedTorrents.size}
        onAddClick={handleAddClick}
        onDeleteClick={handleDeleteClick}
      />
      <AnimatePresence>
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            torrentCount={selectedTorrents.size}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsDeleteModalOpen(false)}
          />
        )}
        {isAddModalOpen && (
          <AddTorrentModal
            onClose={() => setIsAddModalOpen(false)}
            initialFiles={initialFiles}
            initialMagnets={initialMagnets}
          />
        )}
      </AnimatePresence>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      </div>
    </Dropzone>
  );
}

export default Main;
