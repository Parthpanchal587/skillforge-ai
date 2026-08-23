import React, { useEffect, useState } from 'react';

// 10 & 19 — Smooth Precision Number Count-Up Animation with Easing
const AnimatedCounter = ({ value = 0, duration = 1200, suffix = '', prefix = '', className = '', style = {} }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = 0;
    const endValue = Number(value) || 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.round(startValue + (endValue - startValue) * easeOutCubic(progress));
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span className={className} style={{ ...style, fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;
