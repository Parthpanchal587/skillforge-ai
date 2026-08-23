import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { sounds } from '../../services/soundEffects';

const SKILL_COLORS = {
  MASTERED: { bg: '#00F5A0', text: '#1A1A2E', border: '#1A1A2E', badge: '🏆' },
  STRONG: { bg: '#00D4FF', text: '#1A1A2E', border: '#1A1A2E', badge: '💪' },
  DEVELOPING: { bg: '#FFE135', text: '#1A1A2E', border: '#1A1A2E', badge: '⚡' },
  NEEDS_IMPROVEMENT: { bg: '#FF6B9D', text: '#FFFFFF', border: '#1A1A2E', badge: '⚠️' },
  LOCKED: { bg: '#E4DFD5', text: '#7E7E9A', border: '#1A1A2E', badge: '🔒' },
};

const GravityPlayground = ({
  skills = [],
  skillScores = {},
  onSelectSkill,
  height = 420,
  className = '',
}) => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const animRef = useRef(null);
  const bodiesRef = useRef([]);
  const wallsRef = useRef([]);
  const constraintsRef = useRef([]);
  const mouseConstraintRef = useRef(null);
  const nodesDataRef = useRef([]);
  const connectionsDataRef = useRef([]);

  const [renderTick, setRenderTick] = useState(0);
  const [collisionAlert, setCollisionAlert] = useState(null);
  const [earthRotation, setEarthRotation] = useState(0);

  // Build or rebuild the physics scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const h = height;

    // Create a SELF-CONTAINED engine (no shared PhysicsProvider needed)
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
      enableSleeping: false,
    });
    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const world = engine.world;

    // Collision listener
    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const speedA = Matter.Vector.magnitude(bodyA.velocity);
        const speedB = Matter.Vector.magnitude(bodyB.velocity);
        if (Math.max(speedA, speedB) > 10) {
          const target = bodyA.label !== 'wall' && bodyA.label !== 'floor' && bodyA.label !== 'ceiling'
            ? bodyA.label
            : bodyB.label !== 'wall' && bodyB.label !== 'floor' && bodyB.label !== 'ceiling'
              ? bodyB.label
              : null;
          if (target && target !== 'earth') {
            setCollisionAlert({
              text: `Ouch! Go easy on ${target}! 💥`,
              x: (bodyA.position.x + bodyB.position.x) / 2,
              y: (bodyA.position.y + bodyB.position.y) / 2,
              id: Date.now(),
            });
            setTimeout(() => setCollisionAlert(null), 1500);
          }
        }
      }
    });

    // Walls
    const wallOpts = { isStatic: true, restitution: 0.8, friction: 0.1, label: 'wall' };
    const walls = [
      Matter.Bodies.rectangle(width / 2, h + 30, width * 2, 60, { ...wallOpts, label: 'floor' }),
      Matter.Bodies.rectangle(width / 2, -30, width * 2, 60, { ...wallOpts, label: 'ceiling' }),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOpts),
      Matter.Bodies.rectangle(width + 30, h / 2, 60, h * 2, wallOpts),
    ];
    Matter.Composite.add(world, walls);
    wallsRef.current = walls;

    // 🌍 Earth body — large, heavy, sits at bottom center as gravitational anchor
    const earthRadius = 55;
    const earthBody = Matter.Bodies.circle(width / 2, h - earthRadius - 15, earthRadius, {
      isStatic: true,
      label: 'earth',
      restitution: 0.6,
      friction: 0.3,
    });
    Matter.Composite.add(world, earthBody);

    // Skill bodies
    const skillList = skills.length > 0 ? skills : [
      { id: 'html-css', name: 'HTML & CSS', parentId: null },
      { id: 'javascript', name: 'JavaScript', parentId: 'html-css' },
      { id: 'react', name: 'React', parentId: 'javascript' },
      { id: 'nodejs', name: 'Node.js', parentId: 'javascript' },
      { id: 'rest-api', name: 'REST APIs', parentId: 'nodejs' },
      { id: 'databases', name: 'Databases', parentId: 'rest-api' },
      { id: 'git', name: 'Git & GitHub', parentId: null },
    ];

    const bodiesMap = new Map();
    const newNodes = [];
    const bodies = [];

    skillList.forEach((skill, index) => {
      const scoreData = skillScores[skill.id] || { score: Math.floor(40 + Math.random() * 50), status: 'DEVELOPING' };
      const score = scoreData.score || 0;
      const status = scoreData.status || (score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : 'NEEDS_IMPROVEMENT');

      let radius = 34;
      let density = 0.001;
      let restitution = 0.85;

      if (status === 'MASTERED') {
        radius = 50; density = 0.006; restitution = 0.4;
      } else if (status === 'STRONG') {
        radius = 44; density = 0.003; restitution = 0.65;
      } else if (status === 'DEVELOPING') {
        radius = 38; density = 0.0015; restitution = 0.8;
      } else {
        radius = 32; density = 0.0008; restitution = 0.92;
      }

      const spawnX = 60 + (width - 120) * ((index + 0.5) / skillList.length) + (Math.random() - 0.5) * 30;
      const spawnY = -40 - index * 60;

      const body = Matter.Bodies.circle(spawnX, spawnY, radius, {
        restitution,
        density,
        friction: 0.15,
        frictionAir: 0.015,
        label: skill.name,
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 2 + 1,
      });

      bodies.push(body);
      bodiesMap.set(skill.id, body);

      newNodes.push({
        id: skill.id,
        name: skill.name,
        score,
        status,
        radius,
        colorConfig: SKILL_COLORS[status] || SKILL_COLORS.DEVELOPING,
        body,
        parentId: skill.parentId,
      });
    });

    Matter.Composite.add(world, bodies);
    bodiesRef.current = bodies;

    // Earth node data for rendering
    nodesDataRef.current = newNodes;

    // Store earth body for rendering
    bodiesRef.current.earth = earthBody;

    // Elastic constraints
    const createdConstraints = [];
    const createdConnections = [];
    skillList.forEach((skill) => {
      if (skill.parentId && bodiesMap.has(skill.parentId) && bodiesMap.has(skill.id)) {
        const bodyA = bodiesMap.get(skill.parentId);
        const bodyB = bodiesMap.get(skill.id);
        const constraint = Matter.Constraint.create({
          bodyA,
          bodyB,
          stiffness: 0.008,
          damping: 0.04,
          length: 120,
        });
        Matter.Composite.add(world, constraint);
        createdConstraints.push(constraint);
        createdConnections.push({ bodyA, bodyB });
      }
    });
    constraintsRef.current = createdConstraints;
    connectionsDataRef.current = createdConnections;

    // Mouse drag
    const mouse = Matter.Mouse.create(container);
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.Composite.add(world, mouseConstraint);
    mouseConstraintRef.current = mouseConstraint;

    // Render loop — lightweight tick counter
    let frameCount = 0;
    const renderLoop = () => {
      frameCount++;
      if (frameCount % 2 === 0) {
        setRenderTick(t => t + 1);
        setEarthRotation(r => r + 0.3);
      }
      animRef.current = requestAnimationFrame(renderLoop);
    };
    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
    };
  }, [skills, skillScores, height]);

  // Read current positions from refs for rendering (no stale closure)
  const nodes = nodesDataRef.current;
  const connections = connectionsDataRef.current;
  const earthBody = bodiesRef.current.earth;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        height,
        background: '#FAF7F2',
        border: '3px solid #1A1A2E',
        borderRadius: '24px',
        boxShadow: '6px 6px 0px #1A1A2E',
        backgroundImage: 'radial-gradient(rgba(26, 26, 46, 0.1) 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Collision Alert */}
      {collisionAlert && (
        <div
          className="absolute z-30 px-3 py-1.5 rounded-full text-xs font-black text-[#1A1A2E] bg-[#FFE135] border-2 border-[#1A1A2E] shadow-[2px_2px_0px_#1A1A2E] pointer-events-none animate-bounce"
          style={{
            left: Math.min(Math.max(collisionAlert.x - 60, 20), (containerRef.current?.clientWidth || 600) - 140),
            top: Math.max(collisionAlert.y - 40, 20),
          }}
        >
          {collisionAlert.text}
        </div>
      )}

      {/* Top Banner */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 bg-white border-2 border-[#1A1A2E] rounded-full text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#1A1A2E] text-[#1A1A2E]">
          🎪 Generative Gravity Toybox • Grab & Throw!
        </span>
      </div>

      {/* SVG Elastic Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {connections.map((conn, idx) => {
          if (!conn.bodyA || !conn.bodyB) return null;
          return (
            <line
              key={idx}
              x1={conn.bodyA.position.x}
              y1={conn.bodyA.position.y}
              x2={conn.bodyB.position.x}
              y2={conn.bodyB.position.y}
              stroke="#1A1A2E"
              strokeWidth="3.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              opacity={0.4}
            />
          );
        })}
      </svg>

      {/* 🌍 EARTH — Spinning Globe at Bottom Center */}
      {earthBody && (
        <div
          className="absolute z-12 pointer-events-none"
          style={{
            width: 110,
            height: 110,
            left: earthBody.position.x - 55,
            top: earthBody.position.y - 55,
            transform: `rotate(${earthRotation}deg)`,
          }}
        >
          {/* Earth visual using pure CSS */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #4FC3F7 0%, #1565C0 40%, #0D47A1 70%, #1A237E 100%)',
            boxShadow: '0 0 20px rgba(79,195,247,0.4), inset -8px -8px 20px rgba(0,0,0,0.3), 0 4px 0px #1A1A2E',
            border: '3px solid #1A1A2E',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Continent shapes using pseudo-element-like divs */}
            <div style={{
              position: 'absolute', width: '35%', height: '25%',
              background: '#4CAF50', borderRadius: '40% 60% 50% 30%',
              top: '20%', left: '15%', opacity: 0.85,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }} />
            <div style={{
              position: 'absolute', width: '20%', height: '35%',
              background: '#66BB6A', borderRadius: '30% 50% 40% 60%',
              top: '30%', left: '55%', opacity: 0.8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }} />
            <div style={{
              position: 'absolute', width: '25%', height: '18%',
              background: '#43A047', borderRadius: '50% 40% 60% 30%',
              top: '60%', left: '30%', opacity: 0.75,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }} />
            <div style={{
              position: 'absolute', width: '15%', height: '20%',
              background: '#81C784', borderRadius: '45%',
              top: '15%', left: '60%', opacity: 0.7,
            }} />
            {/* Atmosphere glow */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
            }} />
            {/* Cloud wisps */}
            <div style={{
              position: 'absolute', width: '60%', height: '8%',
              background: 'rgba(255,255,255,0.4)', borderRadius: '50%',
              top: '25%', left: '20%', filter: 'blur(2px)',
            }} />
            <div style={{
              position: 'absolute', width: '40%', height: '6%',
              background: 'rgba(255,255,255,0.3)', borderRadius: '50%',
              top: '55%', left: '40%', filter: 'blur(2px)',
            }} />
          </div>
          {/* Label below earth */}
          <div style={{
            textAlign: 'center', marginTop: 4,
            fontSize: '9px', fontWeight: 900, color: '#1A1A2E',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            🌍 SKILL PLANET
          </div>
        </div>
      )}

      {/* Bouncy Skill Bubbles */}
      {nodes.map((node) => {
        const body = node.body;
        if (!body) return null;

        const x = body.position.x;
        const y = body.position.y;
        const angle = body.angle;
        const r = node.radius;

        return (
          <div
            key={node.id}
            onClick={() => {
              try { sounds.playPop(); } catch (e) {}
              if (onSelectSkill) onSelectSkill(node.id);
            }}
            className="absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center select-none group"
            style={{
              width: r * 2,
              height: r * 2,
              left: 0,
              top: 0,
              transform: `translate(${x - r}px, ${y - r}px) rotate(${angle}rad)`,
              backgroundColor: node.colorConfig.bg,
              color: node.colorConfig.text,
              border: '3px solid #1A1A2E',
              borderRadius: '50%',
              boxShadow: '4px 4px 0px #1A1A2E',
              zIndex: 15,
              transition: 'box-shadow 0.1s',
            }}
          >
            <span className="text-xs leading-none mb-0.5">{node.colorConfig.badge}</span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight px-1 leading-tight line-clamp-2">
              {node.name}
            </span>
            <span className="text-[10px] font-black opacity-90 mt-0.5">
              {node.score}%
            </span>
          </div>
        );
      })}

      {/* Force render sync */}
      <span className="hidden">{renderTick}</span>
    </div>
  );
};

export default GravityPlayground;
