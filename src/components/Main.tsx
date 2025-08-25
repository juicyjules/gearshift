import React, { useState, useEffect, useMemo, useRef } from 'react';
import TorrentList from './TorrentList';
import Navbar from './Navbar';
import SettingsModal from './SettingsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AddTorrentModal from './AddTorrentModal';
import Notification from './Notification';
import { useTransmission } from '../contexts/TransmissionContext';
import { type TorrentOverview, TorrentOverviewFields } from '../entities/TorrentOverview';
import Fuse from 'fuse.js';

import { TorrentStatus } from '../transmission-rpc/types';

type SortDirection = 'asc' | 'desc';

function Main() {
  const { transmission } = useTransmission();
  const [torrents, setTorrents] = useState<TorrentOverview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TorrentStatus | 'all'>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTorrents, setSelectedTorrents] = useState(new Set<number>());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedId = useRef<number | null>(null);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);
  const [initialMagnets, setInitialMagnets] = useState('');

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.name.endsWith('.torrent')
    );

    if (droppedFiles.length > 0) {
      setInitialFiles(droppedFiles);
      setIsAddModalOpen(true);
      return;
    }

    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText && droppedText.startsWith('magnet:')) {
      setInitialMagnets(droppedText);
      setIsAddModalOpen(true);
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

  const handleTorrentClick = (
    clickedId: number,
    isCtrlPressed: boolean,
    isShiftPressed: boolean
  ) => {
    const newSelection = new Set(selectedTorrents);
    const torrentsToSelect = processedTorrents.map((t) => t.id);
    const lastIdx = lastSelectedId.current !== null ? torrentsToSelect.indexOf(lastSelectedId.current) : -1;
    const clickedIdx = torrentsToSelect.indexOf(clickedId);

    if (isShiftPressed && lastIdx !== -1) {
      const start = Math.min(lastIdx, clickedIdx);
      const end = Math.max(lastIdx, clickedIdx);
      for (let i = start; i <= end; i++) {
        newSelection.add(torrentsToSelect[i]);
      }
    } else if (isCtrlPressed) {
      if (newSelection.has(clickedId)) {
        newSelection.delete(clickedId);
      } else {
        newSelection.add(clickedId);
      }
    } else {
      if (newSelection.has(clickedId) && newSelection.size === 1) {
        newSelection.clear();
      } else {
        newSelection.clear();
        newSelection.add(clickedId);
      }
    }

    setSelectedTorrents(newSelection);
    lastSelectedId.current = clickedId;
  };

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
    const intervalId = setInterval(fetchTorrents, 2000);

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
  }, [processedTorrents]);

  const handleStartAll = async () => {
    if (!transmission) return;
    const ids = processedTorrents.map(t => t.id);
    try {
      await transmission.start(ids);
    } catch (err) {
      console.error('Failed to start all torrents:', err);
    }
  };

  const handleStopAll = async () => {
    if (!transmission) return;
    const ids = processedTorrents.map(t => t.id);
    try {
      await transmission.stop(ids);
    } catch (err) {
      console.error('Failed to stop all torrents:', err);
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

  const handleAddTorrents = async (args: { metainfo?: string[]; magnets?: string[] }) => {
    if (!transmission) return;
    const { metainfo = [], magnets = [] } = args;
    const count = metainfo.length + magnets.length;

    try {
      const promises = [];
      if (metainfo.length > 0) {
        promises.push(...metainfo.map(meta => transmission.add({ metainfo: meta })));
      }
      if (magnets.length > 0) {
        promises.push(...magnets.map(magnet => transmission.add({ filename: magnet })));
      }
      await Promise.all(promises);
      showNotification(`${count} torrent(s) added successfully.`, 'success');
    } catch (err) {
      console.error('Failed to add torrents:', err);
      showNotification(`Failed to add torrent(s).`, 'error');
    } finally {
      setIsAddModalOpen(false);
    }
  };

  return (
    <div
      className="App"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && <div className="drag-overlay">Drop to add torrents</div>}
      <Navbar
        ref={searchInputRef}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        showOnlyActive={showOnlyActive}
        onShowOnlyActiveChange={setShowOnlyActive}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onStartAll={handleStartAll}
        onStopAll={handleStopAll}
        selectedCount={selectedTorrents.size}
        onDeleteClick={handleDeleteClick}
        onAddClick={handleAddClick}
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
          onAdd={handleAddTorrents}
          onClose={() => setIsAddModalOpen(false)}
          initialFiles={initialFiles}
          initialMagnets={initialMagnets}
        />
      )}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Main;
