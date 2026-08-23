// ============================================================
// SkillForge AI — Centralized Motion & Animation Tokens
// Ultra-Crisp Rendering (NO BLUR FILTERS THAT RASTERIZE TEXT)
// ============================================================

export const DURATION = {
  MICRO: 0.18,
  FAST: 0.25,
  NORMAL: 0.35,
  SMOOTH: 0.55,
  CINEMATIC: 0.8,
};

export const EASING = {
  PREMIUM: [0.16, 1, 0.3, 1],
  DECEL: [0.0, 0.0, 0.2, 1],
  SMOOTH_IN_OUT: [0.4, 0, 0.2, 1],
};

// 01 — Crisp Page Transition (Pure Opacity & Translation, Zero Text Blurring)
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.FAST,
      ease: EASING.PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: EASING.DECEL,
    },
  },
};

// Staggered Text / Section Header Variants (Crisp)
export const textRevealContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const textRevealItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.FAST,
      ease: EASING.PREMIUM,
    },
  },
};

export const cardStaggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.NORMAL,
      ease: EASING.PREMIUM,
    },
  },
};
