import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { usePhysics } from '../../physics/PhysicsProvider';
import { sounds } from '../../services/soundEffects';

const SKILL_COLORS = {
  MASTERED: { bg: '#00F5A0', text: '#1A1A2E', border: '#1A1A2E', badge: '🏆', glow: 'rgba(0,245,160,0.5)' },
  STRONG: { bg: '#00D4FF', text: '#1A1A2E', border: '#1A1A2E', badge: '💪', glow: 'rgba(0,212,255,0.5)' },
  DEVELOPING: { bg: '#FFE135', text: '#1A1A2E', border: '#1A1A2E', badge: '⚡', glow: 'rgba(255,225,53,0.5)' },
  NEEDS_IMPROVEMENT: { bg: '#FF6B9D', text: '#FFFFFF', border: '#1A1A2E', badge: '⚠️', glow: 'rgba(255,107,157,0.5)' },
  LOCKED: { bg: '#E4DFD5', text: '#7E7E9A', border: '#1A1A2E', badge: '🔒', glow: 'rgba(200,200,200,0.3)' },
};

const GravityPlayground = ({
  skills = [],
  skillScores = {},
  onSelectSkill,
  height = 500,
  className = '',
}) => {
  const { isZeroG } = usePhysics() || {};
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const animRef = useRef(null);
  const nodesDataRef = useRef([]);
  const connectionsDataRef = useRef([]);
  const earthBodyRef = useRef(null);

  const [renderTick, setRenderTick] = useState(0);
  const [collisionAlert, setCollisionAlert] = useState(null);
  const [earthRotation, setEarthRotation] = useState(0);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  // Sync Zero-G mode
  useEffect(() => {
    if (!engineRef.current) return;
    if (isZeroG) {
      engineRef.current.gravity.y = -0.12;
      engineRef.current.gravity.x = (Math.random() - 0.5) * 0.04;
    } else {
      engineRef.current.gravity.y = 0.4;
      engineRef.current.gravity.x = 0;
    }
  }, [isZeroG]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const h = height;
    const centerX = width / 2;
    const centerY = h / 2 + 30;

    // Self-contained physics engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.4, scale: 0.001 },
      enableSleeping: false,
    });
    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const world = engine.world;

    // Collision alerts
    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const speedA = Matter.Vector.magnitude(bodyA.velocity);
        const speedB = Matter.Vector.magnitude(bodyB.velocity);
        if (Math.max(speedA, speedB) > 8) {
          const target = ['wall', 'floor', 'ceiling', 'earth'].includes(bodyA.label)
            ? bodyB.label : bodyA.label;
          if (!['wall', 'floor', 'ceiling', 'earth'].includes(target)) {
            setCollisionAlert({
              text: `💥 ${target} crashed!`,
              x: (bodyA.position.x + bodyB.position.x) / 2,
              y: (bodyA.position.y + bodyB.position.y) / 2,
              id: Date.now(),
            });
            setTimeout(() => setCollisionAlert(null), 1800);
          }
        }
      }
    });

    // Walls
    const wallOpts = { isStatic: true, restitution: 0.7, friction: 0.05, label: 'wall' };
    const walls = [
      Matter.Bodies.rectangle(width / 2, h + 30, width * 2, 60, { ...wallOpts, label: 'floor' }),
      Matter.Bodies.rectangle(width / 2, -30, width * 2, 60, { ...wallOpts, label: 'ceiling' }),
      Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOpts),
      Matter.Bodies.rectangle(width + 30, h / 2, 60, h * 2, wallOpts),
    ];
    Matter.Composite.add(world, walls);

    // 🌍 Earth — large static circle at center-bottom
    const earthRadius = 70;
    const earthBody = Matter.Bodies.circle(centerX, centerY + 40, earthRadius, {
      isStatic: true, label: 'earth', restitution: 0.9, friction: 0.01,
    });
    Matter.Composite.add(world, earthBody);
    earthBodyRef.current = earthBody;

    // Skill nodes
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
      const scoreData = skillScores[skill.id] || {
        score: 0,
        status: 'LOCKED',
      };
      const score = scoreData.score || 0;
      const status = scoreData.status ||
        (score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : score > 0 ? 'NEEDS_IMPROVEMENT' : 'LOCKED');

      let radius, density, restitution;
      if (status === 'MASTERED') {
        radius = 42; density = 0.004; restitution = 0.5;
      } else if (status === 'STRONG') {
        radius = 38; density = 0.0025; restitution = 0.65;
      } else if (status === 'DEVELOPING') {
        radius = 34; density = 0.0015; restitution = 0.8;
      } else if (status === 'NEEDS_IMPROVEMENT') {
        radius = 30; density = 0.0008; restitution = 0.9;
      } else {
        radius = 28; density = 0.0006; restitution = 0.9;
      }

      // Spawn in arc above the earth
      const angle = (Math.PI * 0.15) + (Math.PI * 0.7) * (index / Math.max(skillList.length - 1, 1));
      const orbitRadius = earthRadius + 100 + Math.random() * 80;
      const spawnX = centerX + Math.cos(angle - Math.PI / 2) * orbitRadius;
      const spawnY = (centerY + 40) + Math.sin(angle - Math.PI / 2) * orbitRadius - 60;

      const body = Matter.Bodies.circle(
        Math.max(radius + 5, Math.min(width - radius - 5, spawnX)),
        Math.max(-200, Math.min(h - radius, spawnY)),
        radius,
        {
          restitution, density,
          friction: 0.1, frictionAir: 0.02,
          label: skill.name,
        }
      );

      // Gentle initial push
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: -Math.random() * 2,
      });

      bodies.push(body);
      bodiesMap.set(skill.id, body);

      newNodes.push({
        id: skill.id, name: skill.name, score, status, radius,
        colorConfig: SKILL_COLORS[status] || SKILL_COLORS.DEVELOPING,
        body, parentId: skill.parentId,
      });
    });

    Matter.Composite.add(world, bodies);
    nodesDataRef.current = newNodes;

    // Elastic constraints
    const createdConnections = [];
    skillList.forEach((skill) => {
      if (skill.parentId && bodiesMap.has(skill.parentId) && bodiesMap.has(skill.id)) {
        const constraint = Matter.Constraint.create({
          bodyA: bodiesMap.get(skill.parentId),
          bodyB: bodiesMap.get(skill.id),
          stiffness: 0.005, damping: 0.05, length: 100,
        });
        Matter.Composite.add(world, constraint);
        createdConnections.push({
          bodyA: bodiesMap.get(skill.parentId),
          bodyB: bodiesMap.get(skill.id),
        });
      }
    });
    connectionsDataRef.current = createdConnections;

    // Mouse interaction
    const mouse = Matter.Mouse.create(container);
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.Composite.add(world, mouseConstraint);

    // Gentle orbital force — push skills to orbit around earth
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const ePos = earthBody.position;
      newNodes.forEach((node) => {
        const b = node.body;
        const dx = b.position.x - ePos.x;
        const dy = b.position.y - ePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // If too close to earth, push away gently
        if (dist < earthRadius + node.radius + 15) {
          const force = 0.0003;
          Matter.Body.applyForce(b, b.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force,
          });
        }
      });
    });

    // Render loop
    const renderLoop = () => {
      setRenderTick((t) => t + 1);
      setEarthRotation((r) => r + 0.15);
      animRef.current = requestAnimationFrame(renderLoop);
    };
    animRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animRef.current);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [skills, skillScores, height]);

  const nodes = nodesDataRef.current;
  const connections = connectionsDataRef.current;
  const earthBody = earthBodyRef.current;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        height,
        background: 'radial-gradient(ellipse at 50% 80%, #0B1628 0%, #050A15 50%, #020408 100%)',
        border: '3px solid #1A1A2E',
        borderRadius: '24px',
        boxShadow: '6px 6px 0px #1A1A2E',
      }}
    >
      {/* Star field background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 21 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              background: '#FFFFFF',
              opacity: Math.random() * 0.7 + 0.2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Collision Alert */}
      {collisionAlert && (
        <div
          className="absolute z-40 px-3 py-1.5 rounded-full text-xs font-black text-white bg-[#FF5277] border-2 border-white shadow-lg pointer-events-none"
          style={{
            left: Math.min(Math.max(collisionAlert.x - 60, 20), (containerRef.current?.clientWidth || 600) - 140),
            top: Math.max(collisionAlert.y - 40, 20),
            animation: 'bounceIn 0.3s ease-out',
          }}
        >
          {collisionAlert.text}
        </div>
      )}

      {/* Top Banner */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full text-[11px] font-black uppercase tracking-wider text-white/90"
          style={{ textShadow: '0 0 10px rgba(0,212,255,0.5)' }}>
          🌍 Skill Universe • Grab & Throw!
        </span>
      </div>

      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {connections.map((conn, idx) => {
          if (!conn.bodyA || !conn.bodyB) return null;
          return (
            <line
              key={idx}
              x1={conn.bodyA.position.x}
              y1={conn.bodyA.position.y}
              x2={conn.bodyB.position.x}
              y2={conn.bodyB.position.y}
              stroke="rgba(0,212,255,0.4)"
              strokeWidth="2"
              strokeDasharray="6 4"
              filter="url(#glow)"
            />
          );
        })}
      </svg>

      {/* Laser connection between Earth and hovered skill */}
      {hoveredSkill && earthBody && (() => {
        const targetNode = nodes.find(n => n.id === hoveredSkill);
        if (!targetNode?.body) return null;
        return (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <line
              x1={earthBody.position.x}
              y1={earthBody.position.y}
              x2={targetNode.body.position.x}
              y2={targetNode.body.position.y}
              stroke="#00D4FF"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              opacity={0.8}
            />
            <circle
              cx={targetNode.body.position.x}
              cy={targetNode.body.position.y}
              r={targetNode.radius + 6}
              fill="none"
              stroke="#00D4FF"
              strokeWidth="2"
              className="animate-ping"
            />
          </svg>
        );
      })()}

      {/* 🌍 REALISTIC STABLE ROUND EARTH GLOBE */}
      {earthBody && (
        <div
          className="absolute flex items-center justify-center cursor-pointer group select-none"
          onClick={() => {
            // Pulse shockwave
            try { sounds.playLaunch(); } catch (e) {}
            const ePos = earthBody.position;
            nodes.forEach((node) => {
              const b = node.body;
              const dx = b.position.x - ePos.x;
              const dy = b.position.y - ePos.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              Matter.Body.applyForce(b, b.position, {
                x: (dx / dist) * 0.04 + (Math.random() - 0.5) * 0.02,
                y: (dy / dist) * 0.04 - 0.03,
              });
            });
            setCollisionAlert({
              text: '⚡ GRAVITATIONAL PULSE ACTIVATED!',
              x: earthBody.position.x,
              y: earthBody.position.y - 90,
              id: Date.now(),
            });
            setTimeout(() => setCollisionAlert(null), 1800);
          }}
          style={{
            width: 140,
            height: 140,
            left: earthBody.position.x - 70,
            top: earthBody.position.y - 70,
          }}
          title="Click to trigger Gravitational Pulse!"
        >
          {/* Atmosphere pulse wave */}
          <div style={{
            position: 'absolute',
            inset: -14,
            borderRadius: '50%',
            background: 'radial-gradient(circle, transparent 50%, rgba(0,212,255,0.25) 70%, rgba(0,245,160,0.12) 85%, transparent 100%)',
            animation: 'pulse 3s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Earth sphere: perfectly round, stable, fully filled */}
          <div style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundImage: 'url(/earth.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxShadow: `
              inset -18px -12px 35px rgba(0, 0, 0, 0.7),
              inset 6px 6px 15px rgba(255, 255, 255, 0.2),
              0 0 25px rgba(0, 212, 255, 0.45),
              0 0 50px rgba(0, 180, 255, 0.2)
            `,
            border: '2px solid rgba(0, 212, 255, 0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle atmospheric curvature glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            {/* Earth Center HUD Indicator on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] rounded-full">
              <span className="text-[10px] font-black text-[#00F5A0] uppercase tracking-wider">⚡ PULSE</span>
              <span className="text-[8px] font-bold text-white/90">CLICK CORE</span>
            </div>
          </div>

          {/* Orbit Telemetry Badge */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(5, 10, 25, 0.85)',
            border: '1.5px solid rgba(0,212,255,0.4)',
            backdropFilter: 'blur(4px)',
            borderRadius: 9999,
            padding: '2px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}>
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-ping" />
            <span className="text-[9px] font-black text-white uppercase tracking-wider">
              EARTH GRAVITY CORE
            </span>
          </div>
        </div>
      )}

      {/* Orbiting Skill Nodes */}
      {nodes.map((node) => {
        const body = node.body;
        if (!body) return null;
        const x = body.position.x;
        const y = body.position.y;
        const angle = body.angle;
        const r = node.radius;
        const isHovered = hoveredSkill === node.id;

        return (
          <div
            key={node.id}
            onClick={() => {
              try { sounds.playPop(); } catch (e) {}
              if (onSelectSkill) onSelectSkill(node.id);
            }}
            onMouseEnter={() => setHoveredSkill(node.id)}
            onMouseLeave={() => setHoveredSkill(null)}
            className="absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center select-none"
            style={{
              width: r * 2,
              height: r * 2,
              left: 0, top: 0,
              transform: `translate(${x - r}px, ${y - r}px) rotate(${angle}rad) scale(${isHovered ? 1.15 : 1})`,
              backgroundColor: node.colorConfig.bg,
              color: node.colorConfig.text,
              border: `3px solid ${isHovered ? '#FFFFFF' : '#1A1A2E'}`,
              borderRadius: '50%',
              boxShadow: isHovered
                ? `0 0 20px ${node.colorConfig.glow}, 0 0 40px ${node.colorConfig.glow}, 4px 4px 0px #1A1A2E`
                : `0 0 10px ${node.colorConfig.glow}, 4px 4px 0px rgba(0,0,0,0.4)`,
              zIndex: isHovered ? 25 : 15,
              transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s',
            }}
          >
            <span className="text-xs leading-none mb-0.5">{node.colorConfig.badge}</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight px-1 leading-tight line-clamp-2"
              style={{ textShadow: node.status === 'NEEDS_IMPROVEMENT' ? '0 0 4px rgba(0,0,0,0.3)' : 'none' }}>
              {node.name}
            </span>
            <span className="text-[9px] font-black opacity-90 mt-0.5">
              {node.score}%
            </span>
          </div>
        );
      })}

      {/* Skill count indicator */}
      <div className="absolute bottom-3 right-4 z-20 pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full text-[11px] font-black text-white/80">
          {nodes.length} skills orbiting
        </span>
      </div>

      {/* Hidden render trigger */}
      <span className="hidden">{renderTick}</span>

      {/* Inline keyframes for star twinkle */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GravityPlayground;
