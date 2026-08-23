import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// 29 & 30 — Skill Passport Card with Monochromatic Light Shine (Razor Sharp Text)
const HolographicPassportCard = ({ children, className = '', style = {} }) => {
  const cardRef = useRef(null);
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setShinePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'relative',
        ...style,
      }}
      className={`relative overflow-hidden rounded-xl ${className}`}
    >
      {/* Monochromatic Red/White Holographic Light Reflection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isHovered ? 0.25 : 0,
          background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255, 255, 255, 0.3) 0%, rgba(239, 35, 60, 0.15) 30%, transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'opacity 0.25s ease',
          mixBlendMode: 'screen',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default HolographicPassportCard;
