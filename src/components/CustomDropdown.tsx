import React, { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string | number) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ trigger, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string | number) => {
    onSelect(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option) => (
            <li key={option.value} onClick={() => handleSelect(option.value)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
