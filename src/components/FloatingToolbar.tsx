import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './FloatingToolbar.css';

interface FloatingToolbarProps {
  selectedCount: number;
  onAddClick: () => void;
  onDeleteClick: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedCount,
  onAddClick,
  onDeleteClick,
}) => {
  return (
    <div className="floating-toolbar">
      <button
        className="fab-button delete"
        onClick={onDeleteClick}
        disabled={selectedCount === 0}
        title="Delete selected torrents"
      >
        <FaTrash />
      </button>
      <button
        className="fab-button add"
        onClick={onAddClick}
        title="Add new torrent"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default FloatingToolbar;
