import React from 'react';
import { motion } from 'framer-motion';
import { usePhysics } from '../../physics/PhysicsProvider';
import { sounds } from '../../services/soundEffects';

const ZeroGToggle = ({ className = '' }) => {
  const { isZeroG, toggleZeroG } = usePhysics();

  const handleToggle = () => {
    try {
      sounds.playSuccess();
    } catch (err) {}
    toggleZeroG();
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className="font-extrabold text-xs uppercase tracking-wider text-[#1A1A2E] hidden sm:inline-block">
        {isZeroG ? '🚀 ZERO-G ACTIVE' : '🌍 EARTH GRAVITY'}
      </span>
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex items-center justify-between p-1.5 rounded-full cursor-pointer transition-colors"
        style={{
          width: '84px',
          height: '42px',
          background: isZeroG ? '#B388FF' : '#FFE135',
          border: '3px solid #1A1A2E',
          boxShadow: isZeroG ? '3px 3px 0px #1A1A2E' : '4px 4px 0px #1A1A2E',
        }}
        title="Toggle Zero-G Mode"
      >
        <span className="text-[10px] font-black pl-2 select-none text-[#1A1A2E]">
          {isZeroG ? 'FLOAT' : 'DROP'}
        </span>
        
        {/* Toggle Knob with silly face */}
        <motion.div
          animate={{ x: isZeroG ? 38 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute left-1.5 top-1.5 w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm select-none"
          style={{
            border: '2px solid #1A1A2E',
            boxShadow: '1px 1px 0px #1A1A2E',
          }}
        >
          {isZeroG ? '🤩' : '🥱'}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default ZeroGToggle;
