import React from 'react';
import { FaPlus, FaTrash, FaCheckDouble, FaListUl } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './FloatingToolbar.css';

interface FloatingToolbarProps {
  selectedCount: number;
  onAddClick: () => void;
  onDeleteClick: () => void;
  onSelectAllClick: () => void;
  isAllSelected: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedCount,
  onAddClick,
  onDeleteClick,
  onSelectAllClick,
  isAllSelected,
}) => {
  return (
    <div className="floating-toolbar">
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.button
            key="delete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fab-button delete"
            onClick={onDeleteClick}
            title="Delete selected torrents"
          >
            <FaTrash />
          </motion.button>
        )}
      </AnimatePresence>
      <motion.button
        className="fab-button select-all"
        onClick={onSelectAllClick}
        title={isAllSelected ? 'Deselect all' : 'Select all'}
        whileTap={{ scale: 0.9 }}
      >
        {isAllSelected ? <FaListUl /> : <FaCheckDouble />}
      </motion.button>
      <motion.button
        className="fab-button add"
        onClick={onAddClick}
        title="Add new torrent"
        whileTap={{ scale: 0.9 }}
      >
        <FaPlus />
      </motion.button>
    </div>
  );
};

export default FloatingToolbar;
