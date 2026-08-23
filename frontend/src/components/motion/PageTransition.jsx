import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../../motion/motionTokens';

// 01 & 02 — Crisp Page Transition (No blur, sharp text rendering)
const PageTransition = ({ children, locationKey }) => {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      {/* 02 — Subtle Crimson Sweep */}
      <motion.div
        key={`wipe-${locationKey}`}
        initial={{ x: '-100%', opacity: 0.6 }}
        animate={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(239, 35, 60, 0.12) 50%, rgba(255, 48, 72, 0.3) 90%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 9990,
        }}
      />

      {/* 01 — Crisp Content Reveal */}
      <motion.div
        key={`content-${locationKey}`}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;
