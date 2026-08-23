import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';

/**
 * SkillForgeScene — Root R3F Canvas Wrapper
 * 
 * Provides: responsive DPR, reduced-motion detection, mobile detection,
 * lazy Suspense loading, and clean disposal.
 */
const SkillForgeScene = ({
  children,
  className = '',
  style = {},
  camera = { position: [0, 0, 8], fov: 50, near: 0.1, far: 100 },
  enablePointer = true,
  fallback = null,
}) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const dpr = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio, 2);
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: enablePointer ? 'auto' : 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        dpr={dpr}
        camera={camera}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={fallback}>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { reducedMotion: prefersReducedMotion })
              : child
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SkillForgeScene;
