import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AIOrb — Premium AI Intelligence Visualization
 * 
 * Structure:
 * - Inner dark sphere (MeshPhysicalMaterial, high metalness)
 * - Thin energy shell (slightly larger, emissive crimson, transparent)
 * - 10 micro-particles orbiting on paths
 * - Two thin orbital rings at different angles
 * 
 * States:
 *   idle:      slow breathing (0.98→1.02, ~3s period)
 *   thinking:  particles accelerate, rings spin faster
 *   analyzing: particles pull inward
 *   success:   controlled crimson pulse
 */

const ORBIT_PARTICLES = 10;

const AIOrb = ({
  position = [3.5, 0.5, -1],
  state = 'idle', // 'idle' | 'thinking' | 'analyzing' | 'success'
  size = 0.35,
  reducedMotion = false,
}) => {
  const groupRef = useRef();
  const shellRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const particlesRef = useRef([]);

  // Create orbital particle initial positions
  const particleData = useMemo(() => {
    return Array.from({ length: ORBIT_PARTICLES }, (_, i) => ({
      angle: (i / ORBIT_PARTICLES) * Math.PI * 2,
      radius: size * 2.2 + (Math.random() - 0.5) * size * 0.4,
      speed: 0.3 + Math.random() * 0.4,
      tilt: (Math.random() - 0.5) * Math.PI * 0.5,
      yOffset: (Math.random() - 0.5) * size * 0.8,
      particleSize: 0.012 + Math.random() * 0.015,
    }));
  }, [size]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();

    // State-driven speed multiplier
    const speedMul = state === 'thinking' ? 2.5 : state === 'analyzing' ? 0.4 : state === 'success' ? 1.5 : 1.0;
    const radiusMul = state === 'analyzing' ? 0.5 : state === 'success' ? 1.3 : 1.0;

    // Breathing scale
    if (groupRef.current) {
      const breathe = state === 'idle'
        ? 1 + Math.sin(t * 0.7) * 0.02
        : state === 'success'
          ? 1 + Math.sin(t * 3) * 0.05
          : 1;
      groupRef.current.scale.setScalar(breathe);
    }

    // Shell emissive pulse
    if (shellRef.current) {
      const pulse = state === 'success'
        ? 0.6 + Math.sin(t * 4) * 0.3
        : state === 'thinking'
          ? 0.3 + Math.sin(t * 2.5) * 0.15
          : 0.2 + Math.sin(t * 0.8) * 0.08;
      shellRef.current.material.emissiveIntensity = pulse;
    }

    // Ring rotations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.2 * speedMul;
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.15 * speedMul;
      ring2Ref.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.2) * 0.1;
    }

    // Orbital particles
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particleData[i];
      const angle = p.angle + t * p.speed * speedMul;
      const r = p.radius * radiusMul;
      mesh.position.x = Math.cos(angle) * r * Math.cos(p.tilt);
      mesh.position.y = p.yOffset + Math.sin(angle) * r * Math.sin(p.tilt);
      mesh.position.z = Math.sin(angle) * r * Math.cos(p.tilt) * 0.6;
    });
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Inner dark core */}
        <mesh>
          <sphereGeometry args={[size * 0.65, 32, 32]} />
          <meshPhysicalMaterial
            color="#050505"
            metalness={0.85}
            roughness={0.25}
            clearcoat={0.3}
          />
        </mesh>

        {/* Thin emissive energy shell */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive="#EF233C"
            emissiveIntensity={0.2}
            metalness={0.5}
            roughness={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Outer subtle glow */}
        <mesh scale={2.2}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial
            color="#EF233C"
            transparent
            opacity={0.04}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Orbital Ring 1 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[size * 1.8, 0.006, 8, 64]} />
          <meshBasicMaterial
            color="#EF233C"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* Orbital Ring 2 */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <torusGeometry args={[size * 2.1, 0.005, 8, 64]} />
          <meshBasicMaterial
            color="#EF233C"
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </mesh>

        {/* Micro-particles orbiting */}
        {particleData.map((p, i) => (
          <mesh
            key={i}
            ref={(el) => { particlesRef.current[i] = el; }}
          >
            <sphereGeometry args={[p.particleSize, 6, 6]} />
            <meshBasicMaterial
              color="#EF233C"
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default AIOrb;
