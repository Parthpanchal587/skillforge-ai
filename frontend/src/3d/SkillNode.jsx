import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * SkillNode — Individual Skill Data Node (6 Visual States)
 * 
 * Structure:
 * - Dark inner core (MeshStandardMaterial, high metalness)
 * - Thin emissive crimson shell (proportional to score)
 * - Outer halo ring (subtle, status-driven)
 * - HTML label overlay: skill name + score%
 * 
 * States driven by skill.status:
 *   LOCKED:            very dark, minimal glow
 *   AVAILABLE:         subtle white outline
 *   LEARNING:          slow crimson breathing pulse
 *   NEEDS_IMPROVEMENT: irregular faster red pulse
 *   STRONG:            stable controlled glow
 *   MASTERED:          bright crimson ring, full intensity
 */

const STATUS_COLORS = {
  LOCKED: { emissive: '#1a1a1a', ring: '#333333', intensity: 0.05 },
  AVAILABLE: { emissive: '#444444', ring: '#888888', intensity: 0.15 },
  LEARNING: { emissive: '#EF233C', ring: '#EF233C', intensity: 0.4 },
  DEVELOPING: { emissive: '#EF233C', ring: '#EF233C', intensity: 0.4 },
  NEEDS_IMPROVEMENT: { emissive: '#FF3048', ring: '#FF3048', intensity: 0.55 },
  STRONG: { emissive: '#EF233C', ring: '#EF233C', intensity: 0.6 },
  MASTERED: { emissive: '#EF233C', ring: '#EF233C', intensity: 0.85 },
};

const SkillNode = ({
  position = [0, 0, 0],
  skill = { name: 'Skill', score: 50, status: 'AVAILABLE', id: '' },
  baseSize = 0.25,
  reducedMotion = false,
  isSelected = false,
  isFocused = false,
  onClick,
  showLabel = true,
  compact = false,
}) => {
  const groupRef = useRef();
  const shellRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();

  const config = STATUS_COLORS[skill.status] || STATUS_COLORS.AVAILABLE;
  const isLocked = skill.status === 'LOCKED';
  const nodeSize = baseSize * (0.7 + (skill.score / 100) * 0.6);

  const emissiveColor = useMemo(() => new THREE.Color(config.emissive), [config.emissive]);
  const ringColor = useMemo(() => new THREE.Color(config.ring), [config.ring]);

  useFrame(({ clock }) => {
    if (reducedMotion || !shellRef.current) return;
    const t = clock.getElapsedTime();

    // Breathing / pulse animation based on status
    let pulseIntensity = config.intensity;

    if (skill.status === 'LEARNING' || skill.status === 'DEVELOPING') {
      // Slow sinusoidal breathing
      pulseIntensity = config.intensity * (0.6 + 0.4 * Math.sin(t * 1.5));
    } else if (skill.status === 'NEEDS_IMPROVEMENT') {
      // Irregular faster pulse
      pulseIntensity = config.intensity * (0.5 + 0.5 * Math.sin(t * 3.2 + Math.sin(t * 1.7) * 0.5));
    }

    shellRef.current.material.emissiveIntensity = pulseIntensity;

    // Ring rotation
    if (ringRef.current && !isLocked) {
      ringRef.current.rotation.z = t * 0.15;
    }

    // Glow pulse
    if (glowRef.current) {
      const glowScale = 1 + Math.sin(t * 1.2) * 0.05;
      glowRef.current.scale.setScalar(isSelected ? 1.4 : glowScale);
      glowRef.current.material.opacity = isSelected ? 0.2 : config.intensity * 0.15;
    }

    // Selection hover effect
    if (groupRef.current) {
      const targetScale = isSelected ? 1.2 : isFocused ? 1.1 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.08
      );
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef} scale={1.8}>
        <sphereGeometry args={[nodeSize, 16, 16]} />
        <meshBasicMaterial
          color={config.emissive}
          transparent
          opacity={config.intensity * 0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Dark inner core */}
      <mesh>
        <sphereGeometry args={[nodeSize * 0.7, 24, 24]} />
        <meshStandardMaterial
          color="#050505"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Emissive crimson shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[nodeSize, 24, 24]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={emissiveColor}
          emissiveIntensity={config.intensity}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.85}
          wireframe={skill.status === 'AVAILABLE'}
        />
      </mesh>

      {/* Orbital ring */}
      {!isLocked && (
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[nodeSize * 1.4, 0.008, 8, 48]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={config.intensity * 0.6}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* MASTERED: second orbital ring */}
      {skill.status === 'MASTERED' && (
        <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <torusGeometry args={[nodeSize * 1.6, 0.006, 8, 48]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* HTML Label Overlay */}
      {showLabel && !compact && (
        <Html
          position={[0, -nodeSize - 0.3, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: isLocked ? '#555' : '#fff',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {skill.name}
            </div>
            {skill.score > 0 && !isLocked && (
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: config.ring,
                marginTop: 2,
                textShadow: `0 0 8px ${config.ring}60`,
              }}>
                {skill.score}%
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export default SkillNode;
