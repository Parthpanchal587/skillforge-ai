import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 22 — Premium Floating XP Gain Micro-Animation
const XpGainToast = ({ xp, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -24, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: -10,
            right: 20,
            color: 'var(--sf-accent-light)',
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            textShadow: '0 0 12px rgba(239, 35, 60, 0.8)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XpGainToast;
