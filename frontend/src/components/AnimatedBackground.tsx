import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../stores/themeStore';

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolvedTheme = useThemeStore(s => s.getResolvedTheme());
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Stars — fewer & lighter in light mode
    const particleCount = isDark
      ? Math.min(width < 768 ? 25 : 55, 60)
      : Math.min(width < 768 ? 12 : 25, 30);

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * (isDark ? 1.5 : 1.2) + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * (isDark ? 0.5 : 0.15) + (isDark ? 0.2 : 0.05),
      pulseSpeed: Math.random() * 0.02 + 0.008
    }));

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      step += 0.01;

      // Draw Particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity = p.opacity + Math.sin(step + p.x) * (isDark ? 0.15 : 0.04);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Light: teal-tinted subtle dots; Dark: silver-blue star dust
        ctx.fillStyle = isDark
          ? `rgba(148, 163, 184, ${Math.max(0.1, currentOpacity)})`
          : `rgba(13, 148, 136, ${Math.max(0.03, currentOpacity)})`;
        ctx.shadowBlur = isDark ? 4 : 2;
        ctx.shadowColor = isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(13, 148, 136, 0.15)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Base Background */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-page)' }}
      />

      {/* Luminous Ambient Mesh Gradients */}
      {isDark ? (
        <>
          <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse-gently" />
          <div className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse-gently" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-gently" style={{ animationDelay: '4s' }} />
        </>
      ) : (
        <>
          {/* Light mode: Very subtle warm teal/cyan gradient blobs */}
          <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-teal-400/[0.04] blur-[160px]" />
          <div className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/[0.03] blur-[160px]" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-400/[0.03] blur-[170px]" style={{ animationDelay: '4s' }} />
        </>
      )}

      {/* Subtle Star Particle Canvas */}
      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-60' : 'opacity-40'}`} />
    </div>
  );
};

export default AnimatedBackground;
