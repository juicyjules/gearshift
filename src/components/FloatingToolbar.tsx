import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './FloatingToolbar.css';
import {motion, AnimatePresence } from 'motion/react';
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
      <AnimatePresence >
        {selectedCount > 0 && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale:1 }}
            exit={{ opacity: 0, scale:0.5 }}
            className="fab-button delete"
            onClick={onDeleteClick}
            title="Delete selected torrents"
          >
            <FaTrash />
          </motion.button>
        )}
      </AnimatePresence>
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
