import { useEffect, useRef } from 'react';

/**
 * Flowing particle field for the hero.
 * Particles stream along a time-varying flow field (like a current of water),
 * leave tapering comet trails, and wrap around the edges — no walls.
 * A faint network mesh between nearby particles keeps the "science" motif.
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId = 0;
    let t = 0;

    const SPEED = 1.15;
    const TRAIL = 16; // history points per particle
    const CONNECTION_DIST = 135;
    let count = 90;

    interface P { x: number; y: number; hist: number[]; }
    let particles: P[] = [];

    function resize() {
      width = canvas!.width = canvas!.offsetWidth;
      height = canvas!.height = canvas!.offsetHeight;
      // scale density with area, but keep it bounded for performance
      count = Math.max(60, Math.min(170, Math.round((width * height) / 11000)));
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({ x: Math.random() * width, y: Math.random() * height, hist: [] });
      }
    }

    // Smooth, cheap flow field — sum of sines gives curling currents.
    function flowAngle(x: number, y: number) {
      return (
        Math.sin(x * 0.0016 + t) +
        Math.cos(y * 0.0019 - t * 0.8) +
        Math.sin((x + y) * 0.0011 + t * 0.5)
      ) * Math.PI;
    }

    function animate() {
      t += 0.0018;
      ctx!.clearRect(0, 0, width, height);
      const s = getComputedStyle(document.documentElement);
      const c1 = s.getPropertyValue('--hero-gradient-1').trim() || '#2563eb';
      const c2 = s.getPropertyValue('--hero-gradient-2').trim() || '#7c3aed';

      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';

      // 1) streaming trails
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const a = flowAngle(p.x, p.y);
        p.x += Math.cos(a) * SPEED;
        p.y += Math.sin(a) * SPEED;

        // wrap around edges — no walls
        if (p.x < -30) p.x = width + 30;
        else if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        else if (p.y > height + 30) p.y = -30;

        const h = p.hist;
        h.push(p.x, p.y);
        if (h.length > TRAIL * 2) h.splice(0, h.length - TRAIL * 2);

        for (let k = 2; k < h.length; k += 2) {
          const x0 = h[k - 2];
          const y0 = h[k - 1];
          const x1 = h[k];
          const y1 = h[k + 1];
          // skip the segment that jumps across a wrap
          if (Math.abs(x1 - x0) > 120 || Math.abs(y1 - y0) > 120) continue;
          const prog = k / h.length; // 0 at tail → 1 at head
          ctx!.beginPath();
          ctx!.strokeStyle = prog > 0.55 ? c1 : c2;
          ctx!.globalAlpha = prog * prog * 0.55;
          ctx!.lineWidth = prog * 2.4;
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
          ctx!.stroke();
        }

        // glowing head: soft halo + bright core
        ctx!.globalAlpha = 0.18;
        ctx!.fillStyle = c1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 0.95;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 2) network mesh between nearby particles
      ctx!.strokeStyle = c1;
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECTION_DIST * CONNECTION_DIST) {
            const d = Math.sqrt(d2);
            ctx!.globalAlpha = (1 - d / CONNECTION_DIST) * 0.16;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    const handleResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', handleResize);
    resize();
    createParticles();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // draw a single static frame, then stop
      animate();
      cancelAnimationFrame(animId);
    } else {
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
