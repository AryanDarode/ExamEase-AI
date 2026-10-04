import React, { useRef, useEffect } from 'react';

/**
 * Lightweight, 60fps 3D Canvas element rendering an isometric floating graduation cap
 * with ambient particles, soft teal & amber lighting, responding interactively to mouse position.
 */
export default function Floating3DElement() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let time = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let curRotX = 0;
    let curRotY = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotX = y * 0.45;
      targetRotY = x * 0.6;
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const particles = Array.from({ length: 16 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 60 + Math.random() * 55,
      speed: 0.015 + Math.random() * 0.02,
      size: 2 + Math.random() * 2.5,
      yOffset: (Math.random() - 0.5) * 40,
      color: Math.random() > 0.4 ? '#14B8A6' : '#F59E0B',
    }));

    const render = () => {
      time += prefersReducedMotion ? 0 : 0.035;

      curRotX += (targetRotX - curRotX) * 0.08;
      curRotY += (targetRotY - curRotY) * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + (prefersReducedMotion ? 0 : Math.sin(time) * 8);

      // 1. Ambient Ground Shadow
      ctx.save();
      const shadowY = cy + 65;
      const shadowScale = prefersReducedMotion ? 1 : 1 - Math.sin(time) * 0.08;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, 55 * shadowScale, 16 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 184, 166, 0.15)';
      ctx.filter = 'blur(6px)';
      ctx.fill();
      ctx.restore();

      // 2. Background Orbiting Glow Particles
      particles.forEach((p) => {
        p.angle += prefersReducedMotion ? 0 : p.speed;
        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * (p.dist * 0.45) + p.yOffset;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5 + Math.sin(p.angle) * 0.35;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // 3. 3D Floating Graduation Cap Model (Soft isometric 3D)
      ctx.save();
      ctx.translate(cx, cy);

      // Rotate with mouse parallax
      const rotY = curRotY + (prefersReducedMotion ? 0 : Math.sin(time * 0.6) * 0.08);
      const rotX = curRotX + 0.35; // isometric pitch

      // Draw Cap Skull Base (Lower Dome)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 15, 26, 14, 0, 0, Math.PI * 2);
      const baseGrad = ctx.createLinearGradient(-26, 0, 26, 25);
      baseGrad.addColorStop(0, '#0F766E');
      baseGrad.addColorStop(1, '#08332F');
      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      // Draw Diamond Top Mortarboard (3D Parallax transformed)
      ctx.save();
      const w = 68;
      const h = 34;

      // 4 corners of diamond top in 3D
      const p1 = { x: 0 + rotY * 18, y: -h + rotX * 10 };
      const p2 = { x: w + rotY * 12, y: 0 - rotX * 6 };
      const p3 = { x: 0 - rotY * 18, y: h - rotX * 10 };
      const p4 = { x: -w - rotY * 12, y: 0 + rotX * 6 };

      // Top face gradient
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();

      const topGrad = ctx.createLinearGradient(p4.x, p1.y, p2.x, p3.y);
      topGrad.addColorStop(0, '#14B8A6'); // Teal
      topGrad.addColorStop(0.5, '#0F766E');
      topGrad.addColorStop(1, '#10B981'); // Emerald
      ctx.fillStyle = topGrad;
      ctx.shadowColor = 'rgba(20, 184, 166, 0.4)';
      ctx.shadowBlur = 14;
      ctx.fill();

      // Edge rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center Gold Button
      ctx.beginPath();
      const btnX = (p1.x + p3.x) / 2;
      const btnY = (p1.y + p3.y) / 2;
      ctx.arc(btnX, btnY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B'; // Amber
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Tassel (Amber String + Droop)
      ctx.beginPath();
      ctx.moveTo(btnX, btnY);
      const tasselMidX = btnX + 22 + Math.sin(time * 1.5) * 4;
      const tasselMidY = btnY + 12;
      const tasselEndX = btnX + 32 + Math.sin(time * 1.5) * 6;
      const tasselEndY = btnY + 28;
      ctx.quadraticCurveTo(tasselMidX, tasselMidY, tasselEndX, tasselEndY);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Tassel End Fringe
      ctx.beginPath();
      ctx.ellipse(tasselEndX, tasselEndY + 4, 3, 6, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#D97706';
      ctx.fill();

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="floating-3d-wrapper" title="Interactive 3D Study Focus">
      <canvas
        ref={canvasRef}
        width={240}
        height={210}
        className="floating-3d-canvas"
      />
    </div>
  );
}
