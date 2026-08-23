import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 06 & 07 — Magnetic Button with Crimson Glow Burst on Click
const MagneticButton = ({ children, onClick, className = '', style = {}, disabled = false, radius = 25 }) => {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.25;
    const deltaY = (e.clientY - centerY) * 0.25;

    setPos({
      x: Math.max(-radius, Math.min(radius, deltaX)),
      y: Math.max(-radius, Math.min(radius, deltaY)),
    });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-2), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      animate={{ x: pos.x, y: pos.y }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20, mass: 0.4 }}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        willChange: 'transform',
      }}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: 40,
              height: 40,
              marginLeft: -20,
              marginTop: -20,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 48, 72, 0.9) 0%, rgba(239, 35, 60, 0.4) 60%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-1">{children}</span>
    </motion.button>
  );
};

export default MagneticButton;
