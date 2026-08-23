import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 31 & 33 — 3D WebGL Breathing AI Interview Neural Orb
const InterviewOrb3D = ({ state = 'idle', size = 180 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Core Wireframe Sphere
    const geo = new THREE.IcosahedronGeometry(1.2, 3);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff3048,
      transparent: true,
      opacity: 0.6,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    // Orbiting Satellites / Particles
    const pCount = 30;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const radius = 1.6 + Math.random() * 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = radius * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // State-specific speed and breathing dynamics
      const speedMult = state === 'thinking' ? 2.5 : state === 'listening' ? 1.6 : 0.8;
      
      sphere.rotation.y = elapsed * 0.4 * speedMult;
      sphere.rotation.x = elapsed * 0.2 * speedMult;
      
      const scaleBreath = 1 + Math.sin(elapsed * 2 * speedMult) * 0.06;
      sphere.scale.set(scaleBreath, scaleBreath, scaleBreath);

      innerSphere.scale.set(
        1 + Math.sin(elapsed * 4) * 0.1,
        1 + Math.sin(elapsed * 4) * 0.1,
        1 + Math.sin(elapsed * 4) * 0.1
      );

      particles.rotation.y = -elapsed * 0.5 * speedMult;
      particles.rotation.z = elapsed * 0.3 * speedMult;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, [size, state]);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: state === 'thinking' ? 'drop-shadow(0 0 24px rgba(239,35,60,0.8))' : 'drop-shadow(0 0 16px rgba(239,35,60,0.4))',
        transition: 'filter 0.4s ease',
      }}
    />
  );
};

export default InterviewOrb3D;
