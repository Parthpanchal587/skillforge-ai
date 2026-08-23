import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Crisp 3D Card Hover & Tilt with Zero Subpixel Text Blur
const CardTilt3D = ({ children, className = '', style = {}, maxRotation = 3, glow = true, onClick }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        position: 'relative',
        ...style,
      }}
      className={`relative ${className}`}
    >
      {glow && isHovered && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 'inherit',
            background: 'radial-gradient(circle at 50% 0%, rgba(239, 35, 60, 0.18), transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
};

export default CardTilt3D;
