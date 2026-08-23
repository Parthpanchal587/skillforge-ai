import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * EnergyParticle — Small Particle Traveling Along a Connection Path
 * 
 * Represents learning, data, AI analysis, or progress flowing
 * between skill nodes. Only shown on important/active connections.
 */
const EnergyParticle = ({
  start = [0, 0, 0],
  end = [0, 0, 0],
  speed = 0.4,
  size = 0.04,
  color = '#EF233C',
  reducedMotion = false,
  delay = 0,
}) => {
  const meshRef = useRef();
  const tRef = useRef(delay % 1);

  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    mid.z += 0.15;
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  const trailRef = useRef();

  useFrame(({ clock }) => {
    if (reducedMotion || !meshRef.current) return;

    tRef.current += speed * 0.008;
    if (tRef.current > 1) tRef.current = 0;

    const point = curve.getPoint(tRef.current);
    meshRef.current.position.copy(point);

    // Fade at endpoints
    const edgeFade = Math.sin(tRef.current * Math.PI);
    meshRef.current.material.opacity = edgeFade * 0.8;
    meshRef.current.scale.setScalar(0.8 + edgeFade * 0.4);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export default EnergyParticle;
