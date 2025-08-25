import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="close-btn">&times;</button>
    </div>
  );
};

export default Notification;
