import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { usePhysics } from '../../physics/PhysicsProvider';
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
  const canvasRef = useRef(null);
  const { engine, collisionAlert } = usePhysics();
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const bodiesMapRef = useRef(new Map());

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !engine) return;

    const width = container.clientWidth || 800;
    const h = height;

    const world = engine.world;

    // Clear previous dynamic bodies in this container
    bodiesMapRef.current.forEach((body) => {
      Matter.Composite.remove(world, body);
    });
    bodiesMapRef.current.clear();

    // 1. Static Boundaries (Floor, Left Wall, Right Wall, Ceiling)
    const wallOptions = { isStatic: true, restitution: 0.8, friction: 0.1, label: 'wall' };
    const floor = Matter.Bodies.rectangle(width / 2, h + 30, width * 2, 60, { ...wallOptions, label: 'floor' });
    const ceiling = Matter.Bodies.rectangle(width / 2, -30, width * 2, 60, { ...wallOptions, label: 'ceiling' });
    const leftWall = Matter.Bodies.rectangle(-30, h / 2, 60, h * 2, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 30, h / 2, 60, h * 2, wallOptions);

    Matter.Composite.add(world, [floor, ceiling, leftWall, rightWall]);

    // 2. Create Skill Bodies with "Weight of Mastery"
    const skillList = skills.length > 0 ? skills : [
      { id: 'html-css', name: 'HTML & CSS', parentId: null },
      { id: 'javascript', name: 'JavaScript', parentId: 'html-css' },
      { id: 'react', name: 'React', parentId: 'javascript' },
      { id: 'nodejs', name: 'Node.js', parentId: 'javascript' },
      { id: 'rest-api', name: 'REST APIs', parentId: 'nodejs' },
      { id: 'databases', name: 'Databases', parentId: 'rest-api' },
      { id: 'git', name: 'Git & GitHub', parentId: null },
    ];

    const newNodes = [];
    const bodies = [];

    skillList.forEach((skill, index) => {
      const scoreData = skillScores[skill.id] || { score: Math.floor(40 + Math.random() * 50), status: 'DEVELOPING' };
      const score = scoreData.score || 0;
      const status = scoreData.status || (score >= 85 ? 'MASTERED' : score >= 65 ? 'STRONG' : score >= 45 ? 'DEVELOPING' : 'NEEDS_IMPROVEMENT');

      // The "Weight" of Mastery:
      // Mastered skills = heavy bowling balls (radius 50, mass 12)
      // Weak skills = tiny bouncy bubbles (radius 32, mass 1, restitution 0.95)
      let radius = 34;
      let density = 0.001;
      let restitution = 0.85;

      if (status === 'MASTERED') {
        radius = 50;
        density = 0.006; // heavy bowling ball
        restitution = 0.4;
      } else if (status === 'STRONG') {
        radius = 44;
        density = 0.003;
        restitution = 0.65;
      } else if (status === 'DEVELOPING') {
        radius = 38;
        density = 0.0015;
        restitution = 0.8;
      } else {
        radius = 32;
        density = 0.0008; // light bouncy bubble
        restitution = 0.92;
      }

      // Drop from top of screen at random X
      const spawnX = 60 + (width - 120) * ((index + 0.5) / skillList.length) + (Math.random() - 0.5) * 30;
      const spawnY = -40 - index * 60; // staggered drop

      const body = Matter.Bodies.circle(spawnX, spawnY, radius, {
        restitution,
        density,
        friction: 0.15,
        frictionAir: 0.015,
        label: skill.name,
      });

      // Give a tiny initial kick
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 2 + 1,
      });

      bodies.push(body);
      bodiesMapRef.current.set(skill.id, body);

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
    setNodes(newNodes);

    // 3. Elastic Spring Constraints between related skills
    const createdConnections = [];
    skillList.forEach((skill) => {
      if (skill.parentId && bodiesMapRef.current.has(skill.parentId) && bodiesMapRef.current.has(skill.id)) {
        const bodyA = bodiesMapRef.current.get(skill.parentId);
        const bodyB = bodiesMapRef.current.get(skill.id);

        const constraint = Matter.Constraint.create({
          bodyA,
          bodyB,
          stiffness: 0.008, // Springy rubber-band feel
          damping: 0.04,
          length: 120,
        });

        Matter.Composite.add(world, constraint);
        createdConnections.push({ bodyA, bodyB });
      }
    });
    setConnections(createdConnections);

    // 4. Mouse Drag & Throw Controller
    const mouse = Matter.Mouse.create(container);
    // Allow wheel scroll through container
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    Matter.Composite.add(world, mouseConstraint);

    // 5. Render Loop for DOM Synchronization
    let animId;
    const renderLoop = () => {
      // Force update positions to re-render DOM nodes & elastic lines
      setNodes((prev) => [...prev]);
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      Matter.Composite.remove(world, [floor, ceiling, leftWall, rightWall, mouseConstraint]);
      bodies.forEach((b) => Matter.Composite.remove(world, b));
    };
  }, [skills, skillScores, height, engine]);

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
      {/* Cheeky Collision Banner */}
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

      {/* Top Floating Helper Banner */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 bg-white border-2 border-[#1A1A2E] rounded-full text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#1A1A2E] text-[#1A1A2E]">
          🎪 Generative Gravity Toybox • Grab & Throw!
        </span>
      </div>

      {/* SVG Rubber-Band Elastic Connections */}
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

      {/* Bouncy Physical DOM Skill Bubbles */}
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
            className="absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center transition-shadow select-none group"
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
    </div>
  );
};

export default GravityPlayground;
