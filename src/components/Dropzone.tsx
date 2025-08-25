import React, { useState, useCallback } from 'react';

interface DropzoneProps {
  onDrop: (dataTransfer: DataTransfer) => void;
  children: React.ReactNode;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop, children }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onDrop(e.dataTransfer);
  }, [onDrop]);

  return (
    <div
      className="dropzone-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && <div className="drag-overlay" />}
      {children}
    </div>
  );
};

export default Dropzone;
