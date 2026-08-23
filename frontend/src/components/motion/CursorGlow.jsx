import React, { useEffect, useState } from 'react';

// 43 — Subtle Red Cursor Light (Desktop Only, respects prefers-reduced-motion)
const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if touch or reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (mediaQuery.matches || isTouchDevice) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible]);

  if (isTouch || !visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239, 35, 60, 0.07) 0%, rgba(239, 35, 60, 0.02) 40%, transparent 70%)',
        transform: `translate3d(${pos.x - 190}px, ${pos.y - 190}px, 0)`,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorGlow;
