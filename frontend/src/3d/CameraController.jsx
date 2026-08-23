import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CameraController — Cinematic Camera System
 * 
 * - Smooth lerp-based mouse parallax (±2° rotation)
 * - Scroll-driven camera Z movement (optional)
 * - Damped interpolation
 * - Min/max zoom clamps
 * - Responsive to viewport size
 * - prefers-reduced-motion: static camera
 */
const CameraController = ({
  reducedMotion = false,
  parallaxStrength = 0.3,
  scrollEnabled = false,
  scrollRange = [8, 3],
  dampingFactor = 0.03,
}) => {
  const { camera, size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ rx: 0, ry: 0, z: scrollRange[0] });
  const scrollRef = useRef(0);

  // Track mouse position
  React.useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      if (!scrollEnabled) return;
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (scrollEnabled) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (scrollEnabled) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [reducedMotion, scrollEnabled]);

  useFrame(() => {
    if (reducedMotion) return;

    // Target rotation from mouse parallax
    const targetRY = mouse.current.x * parallaxStrength * 0.05;
    const targetRX = -mouse.current.y * parallaxStrength * 0.03;

    // Smooth interpolation
    target.current.rx = THREE.MathUtils.lerp(target.current.rx, targetRX, dampingFactor);
    target.current.ry = THREE.MathUtils.lerp(target.current.ry, targetRY, dampingFactor);

    camera.rotation.x = target.current.rx;
    camera.rotation.y = target.current.ry;

    // Scroll-driven Z position
    if (scrollEnabled) {
      const targetZ = THREE.MathUtils.lerp(scrollRange[0], scrollRange[1], scrollRef.current);
      target.current.z = THREE.MathUtils.lerp(target.current.z, targetZ, dampingFactor);
      camera.position.z = target.current.z;
    }
  });

  return null;
};

export default CameraController;
