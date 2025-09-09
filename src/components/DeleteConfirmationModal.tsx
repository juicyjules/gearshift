import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import Modal from './Modal';
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
    <Modal
      title="Confirm Deletion"
      onClose={onCancel}
      footer={
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
      }
    >
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
    </Modal>
  );
};

export default DeleteConfirmationModal;
