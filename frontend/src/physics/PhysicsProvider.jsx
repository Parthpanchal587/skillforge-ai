import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

const PhysicsContext = createContext(null);

export const PhysicsProvider = ({ children, initialGravity = { x: 0, y: 1 } }) => {
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const [isZeroG, setIsZeroG] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [collisionAlert, setCollisionAlert] = useState(null);

  useEffect(() => {
    // 1. Create Matter.js Engine & World
    const engine = Matter.Engine.create({
      gravity: { x: initialGravity.x, y: initialGravity.y, scale: 0.001 },
      enableSleeping: false,
    });
    engineRef.current = engine;

    // 2. Create Runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // 3. Collision listener for cheeky "Ouch!" alerts on hard hits
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];
        // Calculate relative speed
        const speedA = Matter.Vector.magnitude(bodyA.velocity);
        const speedB = Matter.Vector.magnitude(bodyB.velocity);
        const maxSpeed = Math.max(speedA, speedB);

        if (maxSpeed > 10) {
          const target = bodyA.label !== 'wall' ? bodyA.label : bodyB.label;
          if (target && target !== 'wall' && target !== 'floor' && target !== 'ceiling') {
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

    setIsReady(true);

    return () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
    };
  }, []);

  // Toggle Zero-G Gravity
  const toggleZeroG = useCallback(() => {
    if (!engineRef.current) return;
    setIsZeroG((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Zero-G: reversed/floating gentle gravity
        engineRef.current.gravity.y = -0.15;
        engineRef.current.gravity.x = (Math.random() - 0.5) * 0.05;
      } else {
        // Normal Gravity: snappy drop
        engineRef.current.gravity.y = 1.0;
        engineRef.current.gravity.x = 0;
      }
      return nextState;
    });
  }, []);

  const addBody = useCallback((body) => {
    if (engineRef.current) {
      Matter.Composite.add(engineRef.current.world, body);
    }
  }, []);

  const removeBody = useCallback((body) => {
    if (engineRef.current) {
      Matter.Composite.remove(engineRef.current.world, body);
    }
  }, []);

  const addConstraint = useCallback((constraint) => {
    if (engineRef.current) {
      Matter.Composite.add(engineRef.current.world, constraint);
    }
  }, []);

  const removeConstraint = useCallback((constraint) => {
    if (engineRef.current) {
      Matter.Composite.remove(engineRef.current.world, constraint);
    }
  }, []);

  return (
    <PhysicsContext.Provider
      value={{
        engine: engineRef.current,
        isReady,
        isZeroG,
        toggleZeroG,
        addBody,
        removeBody,
        addConstraint,
        removeConstraint,
        collisionAlert,
      }}
    >
      {children}
    </PhysicsContext.Provider>
  );
};

export const usePhysics = () => {
  const context = useContext(PhysicsContext);
  if (!context) {
    throw new Error('usePhysics must be used within a PhysicsProvider');
  }
  return context;
};

export default PhysicsProvider;
