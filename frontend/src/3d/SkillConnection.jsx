import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SkillConnection — Energy Pathway Between Skill Nodes
 * 
 * Thin lines connecting parent → child skills.
 * Active connections glow brighter. Mastered connections are stable crimson.
 * Weak/locked connections appear very dim.
 */
const SkillConnection = ({
  start = [0, 0, 0],
  end = [0, 0, 0],
  status = 'AVAILABLE',
  isActive = false,
  reducedMotion = false,
}) => {
  const lineRef = useRef();

  const opacity = useMemo(() => {
    switch (status) {
      case 'MASTERED': return 0.35;
      case 'STRONG': return 0.28;
      case 'LEARNING':
      case 'DEVELOPING': return 0.2;
      case 'NEEDS_IMPROVEMENT': return 0.18;
      case 'AVAILABLE': return 0.08;
      case 'LOCKED':
      default: return 0.04;
    }
  }, [status]);

  const color = useMemo(() => {
    if (status === 'LOCKED') return '#333333';
    if (status === 'AVAILABLE') return '#555555';
    return '#EF233C';
  }, [status]);

  const points = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    // Create a subtle curve through the midpoint
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    mid.z += 0.15; // slight Z offset for depth
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return curve.getPoints(20);
  }, [start, end]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  useFrame(({ clock }) => {
    if (reducedMotion || !lineRef.current) return;
    // Subtle opacity pulsing for active connections
    if (isActive) {
      const t = clock.getElapsedTime();
      lineRef.current.material.opacity = opacity * (0.7 + 0.3 * Math.sin(t * 2));
    }
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
};

export default SkillConnection;
