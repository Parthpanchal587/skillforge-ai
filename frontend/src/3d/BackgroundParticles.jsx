import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * BackgroundParticles — Sparse Ambient Depth Particles
 * 
 * ~80 very small white dots drifting slowly in the void.
 * Creates cinematic depth without overwhelming content.
 */
const BackgroundParticles = ({ count = 80, spread = 20, reducedMotion = false }) => {
  const meshRef = useRef();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8;
      sz[i] = 0.01 + Math.random() * 0.02;
    }
    return [pos, sz];
  }, [count, spread]);

  // Drift velocities
  const velocities = useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
    }
    return vel;
  }, [count]);

  useFrame(() => {
    if (reducedMotion || !meshRef.current) return;
    const posAttr = meshRef.current.geometry.attributes.position;
    const arr = posAttr.array;
    const halfSpread = spread / 2;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];

      // Wrap around boundaries
      if (Math.abs(arr[i * 3]) > halfSpread) arr[i * 3] *= -0.95;
      if (Math.abs(arr[i * 3 + 1]) > halfSpread) arr[i * 3 + 1] *= -0.95;
      if (Math.abs(arr[i * 3 + 2]) > halfSpread * 0.8) arr[i * 3 + 2] *= -0.95;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default BackgroundParticles;
