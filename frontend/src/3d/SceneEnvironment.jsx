import React from 'react';
import * as THREE from 'three';

/**
 * SceneEnvironment — Global 3D Scene Setup
 * 
 * Minimal, cinematic lighting:
 * - Very low ambient fill
 * - Single directional light (cool white)
 * - Crimson point light near center
 * - Black fog for infinite depth
 */
const SceneEnvironment = ({ reducedMotion = false }) => {
  return (
    <>
      {/* Fog for infinite depth */}
      <fog attach="fog" args={['#000000', 6, 28]} />

      {/* Very low ambient fill — keeps everything dark */}
      <ambientLight intensity={0.12} color="#ffffff" />

      {/* Main directional light — subtle top-left */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={0.25}
        color="#f0f0f0"
      />

      {/* Crimson accent point light — near center-right */}
      <pointLight
        position={[4, 0, 2]}
        intensity={0.6}
        color="#EF233C"
        distance={15}
        decay={2}
      />

      {/* Subtle rim light from behind */}
      <pointLight
        position={[-3, -2, -5]}
        intensity={0.15}
        color="#EF233C"
        distance={20}
        decay={2}
      />
    </>
  );
};

export default SceneEnvironment;
