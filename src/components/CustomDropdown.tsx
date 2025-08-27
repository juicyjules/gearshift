import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [positionClass, setPositionClass] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

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

  useEffect(() => {
    if (isOpen && menuRef.current && dropdownRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();

      let newPositionClass = '';

      if (menuRect.right > window.innerWidth) {
        newPositionClass += ' align-left';
      }
      if (menuRect.bottom > window.innerHeight) {
        newPositionClass += ' opens-up';
      }

      setPositionClass(newPositionClass.trim());
    }
  }, [isOpen]);


  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={menuRef}
            className={`dropdown-menu ${positionClass}`}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.1 }}
          >
            {options.map((option) => (
              <li key={option.value} onClick={() => handleSelect(option.value)}>
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
