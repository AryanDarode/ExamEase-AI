import React, { useState, useEffect, Suspense } from 'react';
import './AnimatedBackground.css';

// Lazy load the 3D Three.js scene so it doesn't inflate bundle size on other pages
const AnimatedBackgroundScene = React.lazy(() => import('./AnimatedBackgroundScene'));

export default function AnimatedBackground() {
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Respect user's accessibility setting: prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="animated-bg-root" aria-hidden="true">
      {/* Base deep background layer */}
      <div className="animated-bg-base" />

      {/* 3D Scene Layer (or static gradient fallback for reduced motion) */}
      {!isReducedMotion ? (
        <Suspense fallback={<div className="animated-bg-fallback" />}>
          <div className="animated-bg-canvas-wrap">
            <AnimatedBackgroundScene />
          </div>
        </Suspense>
      ) : (
        <div className="animated-bg-static" />
      )}

      {/* Semi-transparent dark scrim (60-70% opacity) for crystal-clear foreground text & inputs */}
      <div className="animated-bg-scrim" />

      {/* Subtle corner ambient glow orbs */}
      <div className="animated-bg-ambient-glow glow-top-left" />
      <div className="animated-bg-ambient-glow glow-bottom-right" />
    </div>
  );
}
