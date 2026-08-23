import React, { useMemo } from 'react';
import SkillNode from './SkillNode';
import SkillConnection from './SkillConnection';
import EnergyParticle from './EnergyParticle';

/**
 * NeuralNetwork — Container for the 3D Skill Network
 * 
 * Takes real skill data from the Zustand store and domain skill tree
 * from domainsData.js to compute positions and render:
 * - SkillNode for each skill
 * - SkillConnection for each parent→child dependency
 * - EnergyParticle on active/important connections
 */

// Compute structured tree layout positions from skill dependency graph
function computeNodePositions(skills, skillScores, opts = {}) {
  const { spreadX = 3.5, spreadY = 2.5, baseZ = 0 } = opts;
  const nodeMap = {};
  const positions = {};

  // Build adjacency: group by depth level using parentId
  const roots = [];
  const childrenOf = {};

  skills.forEach((s) => {
    nodeMap[s.id] = s;
    if (!s.parentId) {
      roots.push(s.id);
    } else {
      if (!childrenOf[s.parentId]) childrenOf[s.parentId] = [];
      childrenOf[s.parentId].push(s.id);
    }
  });

  // BFS to assign depth levels
  const levels = {};
  const queue = [...roots.map((id) => ({ id, depth: 0 }))];
  const visited = new Set();

  while (queue.length > 0) {
    const { id, depth } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    if (!levels[depth]) levels[depth] = [];
    levels[depth].push(id);
    const children = childrenOf[id] || [];
    children.forEach((cid) => queue.push({ id: cid, depth: depth + 1 }));
  }

  // Assign any orphan skills not reached by BFS
  skills.forEach((s) => {
    if (!visited.has(s.id)) {
      const depth = 0;
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(s.id);
    }
  });

  // Layout: distribute each level horizontally, stack levels vertically
  const depthKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
  const totalDepth = depthKeys.length;

  depthKeys.forEach((depth, di) => {
    const nodesAtDepth = levels[depth];
    const count = nodesAtDepth.length;
    nodesAtDepth.forEach((id, i) => {
      const x = count === 1 ? 0 : ((i / (count - 1)) - 0.5) * spreadX;
      const y = totalDepth === 1 ? 0 : ((di / (totalDepth - 1)) - 0.5) * -spreadY;
      // Add slight Z variation for depth
      const z = baseZ + (Math.random() - 0.5) * 0.5;
      positions[id] = [x, y, z];
    });
  });

  return positions;
}

// Determine which connections should have energy particles
function getActiveConnections(skills, skillScores) {
  const active = [];
  skills.forEach((skill) => {
    if (!skill.parentId) return;
    const parentScore = skillScores[skill.parentId];
    const childScore = skillScores[skill.id];
    // Energy flows on connections where both nodes are unlocked and at least one is learning
    if (
      parentScore && childScore &&
      parentScore.status !== 'LOCKED' && childScore.status !== 'LOCKED' &&
      (childScore.status === 'LEARNING' || childScore.status === 'DEVELOPING' ||
       childScore.status === 'NEEDS_IMPROVEMENT')
    ) {
      active.push({ from: skill.parentId, to: skill.id });
    }
  });
  return active;
}

const NeuralNetwork = ({
  skills = [],
  skillScores = {},
  selectedSkillId = null,
  onSelectSkill,
  reducedMotion = false,
  compact = false,
  showLabels = true,
  spreadX = 3.5,
  spreadY = 2.5,
}) => {
  const positions = useMemo(
    () => computeNodePositions(skills, skillScores, { spreadX, spreadY }),
    [skills, skillScores, spreadX, spreadY]
  );

  const activeConnections = useMemo(
    () => getActiveConnections(skills, skillScores),
    [skills, skillScores]
  );

  const activeSet = useMemo(() => {
    const set = new Set();
    activeConnections.forEach(({ from, to }) => set.add(`${from}->${to}`));
    return set;
  }, [activeConnections]);

  return (
    <group>
      {/* Connections */}
      {skills.map((skill) => {
        if (!skill.parentId || !positions[skill.parentId] || !positions[skill.id]) return null;
        const scoreData = skillScores[skill.id] || { status: 'LOCKED', score: 0 };
        const key = `${skill.parentId}->${skill.id}`;
        return (
          <SkillConnection
            key={`conn-${key}`}
            start={positions[skill.parentId]}
            end={positions[skill.id]}
            status={scoreData.status || 'LOCKED'}
            isActive={activeSet.has(key)}
            reducedMotion={reducedMotion}
          />
        );
      })}

      {/* Energy particles on active connections */}
      {activeConnections.map(({ from, to }, i) => (
        <EnergyParticle
          key={`energy-${from}-${to}`}
          start={positions[from]}
          end={positions[to]}
          speed={0.3 + Math.random() * 0.3}
          delay={i * 0.3}
          reducedMotion={reducedMotion}
        />
      ))}

      {/* Skill Nodes */}
      {skills.map((skill) => {
        if (!positions[skill.id]) return null;
        const scoreData = skillScores[skill.id] || { status: 'LOCKED', score: 0 };
        return (
          <SkillNode
            key={`node-${skill.id}`}
            position={positions[skill.id]}
            skill={{
              name: skill.name,
              score: scoreData.score || 0,
              status: scoreData.status || 'LOCKED',
              id: skill.id,
            }}
            isSelected={selectedSkillId === skill.id}
            reducedMotion={reducedMotion}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectSkill) onSelectSkill(skill.id);
            }}
            showLabel={showLabels}
            compact={compact}
          />
        );
      })}
    </group>
  );
};

export { computeNodePositions };
export default NeuralNetwork;
