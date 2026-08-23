import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 03, 04, 44, 45 — High-Performance Three.js Interactive 3D Neural Particle Field
const ThreeNeuralHero = ({ nodeCount = 50, connectionDistance = 140, className = '', height = '100%' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Nodes geometry & setup
    const nodes = [];
    const count = prefersReducedMotion ? 20 : nodeCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const redColor = new THREE.Color(0xef233c);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 350;
      const z = (Math.random() - 0.5) * 200;

      nodes.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.2,
      });

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation: 75% white/dim, 25% crimson
      const c = Math.random() > 0.75 ? redColor : whiteColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle texture for smooth particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.6, 'rgba(239,35,60,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const pTexture = new THREE.CanvasTexture(canvas);

    const nodeMat = new THREE.PointsMaterial({
      size: 6,
      map: pTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(nodeGeo, nodeMat);
    scene.add(pointCloud);

    // Line connections
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xef233c,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });

    const maxLines = (count * (count - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetX = (x - rect.width / 2) * 0.15;
      targetY = (y - rect.height / 2) * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with Visibility optimization
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      // Parallax smooth interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      scene.rotation.y = mouseX * 0.001;
      scene.rotation.x = -mouseY * 0.001;

      // Update nodes
      const posArr = nodeGeo.attributes.position.array;
      let lineIndex = 0;
      const linePosArr = lineGeo.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const node = nodes[i];
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          node.z += node.vz;

          if (node.x < -250 || node.x > 250) node.vx *= -1;
          if (node.y < -175 || node.y > 175) node.vy *= -1;
          if (node.z < -100 || node.z > 100) node.vz *= -1;
        }

        posArr[i * 3] = node.x;
        posArr[i * 3 + 1] = node.y;
        posArr[i * 3 + 2] = node.z;

        // Connect nearby nodes
        for (let j = i + 1; j < count; j++) {
          const nodeB = nodes[j];
          const dx = node.x - nodeB.x;
          const dy = node.y - nodeB.y;
          const dz = node.z - nodeB.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            linePosArr[lineIndex++] = node.x;
            linePosArr[lineIndex++] = node.y;
            linePosArr[lineIndex++] = node.z;
            linePosArr[lineIndex++] = nodeB.x;
            linePosArr[lineIndex++] = nodeB.y;
            linePosArr[lineIndex++] = nodeB.z;
          }
        }
      }

      nodeGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, lineIndex / 3);
      lineGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      nodeMat.dispose();
      lineMat.dispose();
    };
  }, [nodeCount, connectionDistance]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0, height }}
    />
  );
};

export default ThreeNeuralHero;
