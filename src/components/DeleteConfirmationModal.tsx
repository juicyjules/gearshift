import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
  torrentCount: number;
  onConfirm: (deleteData: boolean) => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  torrentCount,
  onConfirm,
  onCancel,
}) => {
  const [deleteData, setDeleteData] = useState(false);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>
          Are you sure you want to delete {torrentCount} torrent(s)?
        </p>
        <div className="delete-options">
          <label>
            <input
              type="checkbox"
              checked={deleteData}
              onChange={(e) => setDeleteData(e.target.checked)}
            />
            Delete local data
          </label>
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteData)}
            className="btn btn-danger btn-with-icon"
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
