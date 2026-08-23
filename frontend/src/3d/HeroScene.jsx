import React, { useMemo, Suspense } from 'react';
import SkillForgeScene from './SkillForgeScene';
import SceneEnvironment from './SceneEnvironment';
import CameraController from './CameraController';
import BackgroundParticles from './BackgroundParticles';
import NeuralNetwork from './NeuralNetwork';
import AIOrb from './AIOrb';

/**
 * HeroScene — Dashboard 3D Hero Composition
 * 
 * Wide neural network behind the headline.
 * Text hierarchy: YOUR CAREER. ENGINEERED. → Neural System → Atmosphere
 * Uses actual skill data from store.
 * CSS overlay for text (not rendered in 3D — keeps text razor sharp).
 */
const HeroScene = ({
  skills = [],
  skillScores = {},
  aiState = 'idle',
  height = '480px',
  className = '',
}) => {
  // Use a subset for hero (max 10 nodes for performance in background)
  const heroSkills = useMemo(() => skills.slice(0, 10), [skills]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
      }}
    >
      <SkillForgeScene
        camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 50 }}
        enablePointer={false}
      >
        <SceneEnvironment />
        <CameraController parallaxStrength={0.25} />
        <BackgroundParticles count={60} spread={18} />
        <NeuralNetwork
          skills={heroSkills}
          skillScores={skillScores}
          compact={true}
          showLabels={false}
          spreadX={5}
          spreadY={3}
        />
        <AIOrb position={[3.8, 0.8, -1.5]} state={aiState} size={0.3} />
      </SkillForgeScene>
    </div>
  );
};

export default HeroScene;
