import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import SkillForgeScene from './SkillForgeScene';
import SceneEnvironment from './SceneEnvironment';
import CameraController from './CameraController';
import BackgroundParticles from './BackgroundParticles';

/**
 * CareerGraph — Spatial Career Path Visualization
 * 
 * Shows career progression as spatial nodes:
 * STUDENT → FRONTEND ENGINEER → FULL STACK ENGINEER → SOFTWARE ENGINEER
 * 
 * Career nodes are larger with orbital rings.
 * Connections show skill requirements.
 * Readiness percentage displayed per node.
 */

const CAREER_NODES = [
  { id: 'student', label: 'Student', position: [-3.5, 0, 0], readinessKey: null, isStart: true },
  { id: 'frontend', label: 'Frontend Engineer', position: [-1.2, 1.2, 0.3], readinessKey: 'technicalSkills', requiredSkills: ['HTML & CSS', 'JavaScript', 'React'] },
  { id: 'fullstack', label: 'Full Stack Engineer', position: [1.2, 0.3, 0.5], readinessKey: 'projects', requiredSkills: ['Node.js', 'REST APIs', 'Databases', 'Auth'] },
  { id: 'software', label: 'Software Engineer', position: [3.5, 1.5, 0.2], readinessKey: 'overall', requiredSkills: ['System Design', 'Testing', 'Deployment'] },
];

const CAREER_CONNECTIONS = [
  { from: 'student', to: 'frontend' },
  { from: 'frontend', to: 'fullstack' },
  { from: 'fullstack', to: 'software' },
];

// Individual career node 3D component
const CareerNode = ({ node, readiness, isHovered, onHover, onUnhover, reducedMotion }) => {
  const groupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const shellRef = useRef();

  const nodeSize = node.isStart ? 0.28 : 0.35;
  const score = readiness || 0;
  const intensity = node.isStart ? 0.3 : Math.max(0.15, score / 100);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();

    // Orbital ring rotation
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.12;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.08;

    // Breathing
    if (shellRef.current) {
      shellRef.current.material.emissiveIntensity = intensity * (0.7 + 0.3 * Math.sin(t * 0.6));
    }

    // Hover scale
    if (groupRef.current) {
      const target = isHovered ? 1.15 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
    }
  });

  return (
    <group
      ref={groupRef}
      position={node.position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(); }}
      onPointerOut={onUnhover}
    >
      {/* Dark inner core */}
      <mesh>
        <sphereGeometry args={[nodeSize * 0.6, 32, 32]} />
        <meshPhysicalMaterial color="#050505" metalness={0.85} roughness={0.2} clearcoat={0.4} />
      </mesh>

      {/* Emissive shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[nodeSize, 32, 32]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#EF233C"
          emissiveIntensity={intensity}
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Glow */}
      <mesh scale={2}>
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <meshBasicMaterial
          color="#EF233C"
          transparent
          opacity={intensity * 0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbital ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[nodeSize * 1.6, 0.008, 8, 48]} />
        <meshBasicMaterial color="#EF233C" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Orbital ring 2 */}
      {!node.isStart && (
        <mesh ref={ring2Ref} rotation={[Math.PI / 5, Math.PI / 3, 0]}>
          <torusGeometry args={[nodeSize * 1.9, 0.006, 8, 48]} />
          <meshBasicMaterial color="#EF233C" transparent opacity={0.15} depthWrite={false} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, -nodeSize - 0.4, 0]} center distanceFactor={6} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {node.label}
          </div>
          {!node.isStart && (
            <div style={{ fontSize: 11, fontWeight: 900, color: '#EF233C', marginTop: 2, textShadow: '0 0 10px rgba(239,35,60,0.4)' }}>
              {score}% READY
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};

// Connection line between career nodes
const CareerConnection = ({ from, to, reducedMotion }) => {
  const points = useMemo(() => {
    const s = new THREE.Vector3(...from);
    const e = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    mid.y += 0.4;
    mid.z += 0.2;
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return curve.getPoints(24);
  }, [from, to]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#EF233C" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
    </line>
  );
};

// Main CareerGraph component
const CareerGraph = ({
  careerReadiness = null,
  height = 350,
}) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getReadiness = (key) => {
    if (!careerReadiness || !key) return 0;
    if (key === 'overall') return careerReadiness.overall || 0;
    return careerReadiness.breakdown?.[key] || 0;
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
      background: '#020202',
    }}>
      <SkillForgeScene
        camera={{ position: [0, 0.5, 7], fov: 45, near: 0.1, far: 50 }}
        enablePointer={true}
      >
        <SceneEnvironment />
        <CameraController parallaxStrength={0.15} />
        <BackgroundParticles count={30} spread={12} />

        {/* Career connections */}
        {CAREER_CONNECTIONS.map(({ from, to }) => {
          const fromNode = CAREER_NODES.find((n) => n.id === from);
          const toNode = CAREER_NODES.find((n) => n.id === to);
          return (
            <CareerConnection
              key={`${from}-${to}`}
              from={fromNode.position}
              to={toNode.position}
            />
          );
        })}

        {/* Career nodes */}
        {CAREER_NODES.map((node) => (
          <CareerNode
            key={node.id}
            node={node}
            readiness={getReadiness(node.readinessKey)}
            isHovered={hoveredNode === node.id}
            onHover={() => setHoveredNode(node.id)}
            onUnhover={() => setHoveredNode(null)}
          />
        ))}
      </SkillForgeScene>

      {/* Hover info card */}
      {hoveredNode && (() => {
        const node = CAREER_NODES.find((n) => n.id === hoveredNode);
        if (!node || node.isStart) return null;
        return (
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(5,5,5,0.9)',
            border: '1px solid rgba(239,35,60,0.2)',
            borderRadius: 10,
            padding: '14px 20px',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            minWidth: 220,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{node.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#EF233C', marginBottom: 8 }}>
              {getReadiness(node.readinessKey)}% Ready
            </div>
            {node.requiredSkills && (
              <div style={{ fontSize: 11, color: '#B4B4BB', fontWeight: 500 }}>
                Requires: {node.requiredSkills.join(' · ')}
              </div>
            )}
          </div>
        );
      })()}

      {/* Label */}
      <div style={{
        position: 'absolute', top: 12, left: 16, zIndex: 10,
        fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", pointerEvents: 'none',
      }}>
        Career Path Visualization
      </div>
    </div>
  );
};

export default CareerGraph;
