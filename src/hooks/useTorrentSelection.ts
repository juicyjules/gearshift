import { useState, useRef, useCallback } from 'react';
import { type TorrentOverview } from '../entities/TorrentOverview';

export const useTorrentSelection = (processedTorrents: TorrentOverview[]) => {
  const [selectedTorrents, setSelectedTorrents] = useState(new Set<number>());
  const lastSelectedId = useRef<number | null>(null);

  const handleTorrentClick = useCallback((
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
  }, [processedTorrents, selectedTorrents]);

  return {
    selectedTorrents,
    setSelectedTorrents,
    handleTorrentClick,
  };
};
