import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import SkillForgeScene from './SkillForgeScene';
import SceneEnvironment from './SceneEnvironment';
import BackgroundParticles from './BackgroundParticles';
import NeuralNetwork, { computeNodePositions } from './NeuralNetwork';

/**
 * InteractiveSkillGraph — Full 3D Mind Map Scene
 * 
 * Features:
 * - Full interactive 3D skill graph
 * - Click to select node → camera smoothly focuses on it
 * - Selected node: everything else dims, info panel appears
 * - OrbitControls with restricted rotation
 * - Focus mode with info panel
 * - Reset camera button
 */

// Internal camera focus controller
const FocusController = ({ targetPosition, isActive, dampingFactor = 0.04 }) => {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 6));

  useFrame(() => {
    if (isActive && targetPosition) {
      const target = new THREE.Vector3(
        targetPosition[0] * 0.7,
        targetPosition[1] * 0.7,
        targetPosition[2] + 4
      );
      targetRef.current.lerp(target, dampingFactor);
      camera.position.lerp(targetRef.current, dampingFactor);
    } else {
      // Return to default
      const defaultPos = new THREE.Vector3(0, 0, 6);
      targetRef.current.lerp(defaultPos, dampingFactor * 0.5);
      camera.position.lerp(targetRef.current, dampingFactor * 0.5);
    }
  });

  return null;
};

// The inner R3F content
const GraphContent = ({
  skills,
  skillScores,
  selectedSkillId,
  onSelectSkill,
  reducedMotion,
}) => {
  const positions = useMemo(
    () => computeNodePositions(skills, skillScores, { spreadX: 4, spreadY: 3 }),
    [skills, skillScores]
  );

  const selectedPosition = selectedSkillId ? positions[selectedSkillId] : null;

  return (
    <>
      <SceneEnvironment />
      <BackgroundParticles count={40} spread={15} />

      <FocusController
        targetPosition={selectedPosition}
        isActive={!!selectedSkillId}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        maxAzimuthAngle={Math.PI * 0.3}
        minAzimuthAngle={-Math.PI * 0.3}
        minDistance={2}
        maxDistance={12}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
      />

      <NeuralNetwork
        skills={skills}
        skillScores={skillScores}
        selectedSkillId={selectedSkillId}
        onSelectSkill={onSelectSkill}
        reducedMotion={reducedMotion}
        showLabels={true}
        spreadX={4}
        spreadY={3}
      />
    </>
  );
};

const InteractiveSkillGraph = ({
  skills = [],
  skillScores = {},
  onNavigateToSkill,
  height = 500,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState(null);

  const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return null;
    const skill = skills.find((s) => s.id === selectedSkillId);
    const score = skillScores[selectedSkillId];
    if (!skill) return null;
    return { ...skill, ...(score || { score: 0, status: 'LOCKED' }) };
  }, [selectedSkillId, skills, skillScores]);

  const handleSelectSkill = useCallback((id) => {
    setSelectedSkillId((prev) => (prev === id ? null : id));
  }, []);

  const STATUS_LABELS = {
    LOCKED: 'Locked',
    AVAILABLE: 'Available',
    LEARNING: 'Learning',
    DEVELOPING: 'Developing',
    NEEDS_IMPROVEMENT: 'Needs Improvement',
    STRONG: 'Strong',
    MASTERED: 'Mastered',
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: '#020202' }}>
      <SkillForgeScene
        camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 50 }}
        enablePointer={true}
      >
        <GraphContent
          skills={skills}
          skillScores={skillScores}
          selectedSkillId={selectedSkillId}
          onSelectSkill={handleSelectSkill}
        />
      </SkillForgeScene>

      {/* Reset Camera Button */}
      {selectedSkillId && (
        <button
          onClick={() => setSelectedSkillId(null)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 20,
            background: 'rgba(8,8,8,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.borderColor = 'rgba(239,35,60,0.5)'}
          onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          ← Reset View
        </button>
      )}

      {/* Selected Skill Info Panel */}
      {selectedSkill && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 20,
          background: 'rgba(5,5,5,0.92)',
          border: '1px solid rgba(239,35,60,0.2)',
          borderRadius: 12,
          padding: '20px 24px',
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
                {selectedSkill.name}
              </h3>
              <span style={{
                display: 'inline-block',
                marginTop: 4,
                fontSize: 11,
                fontWeight: 700,
                color: selectedSkill.status === 'MASTERED' ? '#EF233C' : selectedSkill.status === 'NEEDS_IMPROVEMENT' ? '#FF3048' : '#B4B4BB',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {STATUS_LABELS[selectedSkill.status] || selectedSkill.status}
              </span>
            </div>
            <div style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#EF233C',
              letterSpacing: '-0.02em',
              textShadow: '0 0 20px rgba(239,35,60,0.3)',
            }}>
              {selectedSkill.score}%
            </div>
          </div>

          {selectedSkill.status === 'NEEDS_IMPROVEMENT' && (
            <div style={{
              fontSize: 12,
              color: '#FF3048',
              marginBottom: 12,
              fontWeight: 600,
            }}>
              ⚠ Current skill gap detected — targeted improvement recommended
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {selectedSkill.status !== 'LOCKED' && (
              <button
                onClick={() => onNavigateToSkill && onNavigateToSkill(selectedSkill.id, 'practice')}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#EF233C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                }}
              >
                {selectedSkill.status === 'NEEDS_IMPROVEMENT' ? 'Fix This Gap →' : 'Practice →'}
              </button>
            )}
            <button
              onClick={() => setSelectedSkillId(null)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                color: '#B4B4BB',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Scene label */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        pointerEvents: 'none',
      }}>
        3D Neural Knowledge Graph • Interactive
      </div>
    </div>
  );
};

export default InteractiveSkillGraph;
