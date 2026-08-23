import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../../services/soundEffects';

const GelatinousButton = ({
  children,
  onClick,
  variant = 'primary', // primary (yellow), pink, cyan, mint, secondary, ghost, danger
  size = 'md', // sm, md, lg
  className = '',
  style = {},
  type = 'button',
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    try {
      sounds.playClick();
    } catch (err) {}
    if (onClick) onClick(e);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'pink': return 'sf-btn-pink';
      case 'cyan': return 'sf-btn-cyan';
      case 'mint': return 'sf-btn-mint';
      case 'secondary': return 'sf-btn-secondary';
      case 'ghost': return 'sf-btn-ghost';
      case 'danger': return 'sf-btn-danger';
      case 'primary':
      default: return 'sf-btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'sf-btn-sm';
      case 'lg': return 'sf-btn-lg';
      case 'md':
      default: return '';
    }
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: 1.04, rotate: (Math.random() - 0.5) * 1.5 }}
      whileTap={{ scale: 0.94, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      className={`sf-btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
};

export default GelatinousButton;
