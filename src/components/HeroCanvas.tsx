import { useEffect, useRef } from 'react';

/**
 * Life-science hero animation.
 * Rotating DNA double helices (the genome motif) drift across the canvas while
 * a light molecular / protein network (atoms + bonds) floats behind them.
 * Everything moves continuously and wraps at the edges — Science Without Walls.
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

    // ---- DNA helices ----------------------------------------------------
    interface Helix {
      x: number; y: number;   // center
      angle: number;          // axis direction
      len: number;            // length along axis
      amp: number;            // strand amplitude
      turns: number;          // full twists across the length
      phase: number;          // animated twist offset
      spin: number;           // twist speed (per frame)
      vx: number; vy: number; // drift velocity
    }
    let helices: Helix[] = [];

    // ---- molecular / protein atoms -------------------------------------
    interface Atom { x: number; y: number; vx: number; vy: number; r: number; }
    let atoms: Atom[] = [];

    const BOND_DIST = 120;

    function rand(a: number, b: number) { return a + Math.random() * (b - a); }

    function resize() {
      width = canvas!.width = canvas!.offsetWidth;
      height = canvas!.height = canvas!.offsetHeight;
      build();
    }

    function build() {
      const helixCount = Math.max(3, Math.min(7, Math.round(width / 430)));
      helices = [];
      for (let i = 0; i < helixCount; i++) {
        const angle = rand(-0.5, 0.5) + (i % 2 ? Math.PI * 0.15 : -Math.PI * 0.1);
        const speed = rand(0.2, 0.45);
        helices.push({
          x: rand(0, width),
          y: rand(height * 0.08, height * 0.92),
          angle,
          len: rand(280, 460),
          amp: rand(16, 30),
          turns: rand(2.5, 4),
          phase: rand(0, Math.PI * 2),
          spin: rand(0.012, 0.026) * (Math.random() < 0.5 ? 1 : -1),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }

      const atomCount = Math.max(24, Math.min(64, Math.round((width * height) / 26000)));
      atoms = [];
      for (let i = 0; i < atomCount; i++) {
        atoms.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: rand(-0.28, 0.28),
          vy: rand(-0.28, 0.28),
          r: rand(1.4, 2.8),
        });
      }
    }

    // Read theme-aware colors (the switcher can flip these at runtime).
    function palette() {
      const s = getComputedStyle(document.documentElement);
      const c1 = s.getPropertyValue('--hero-gradient-1').trim() || '#2563eb';
      const c2 = s.getPropertyValue('--hero-gradient-2').trim() || '#7c3aed';
      // detect light vs dark from the page background luminance
      const bg = getComputedStyle(document.body).backgroundColor;
      const m = bg.match(/\d+/g);
      let dark = true;
      if (m) {
        const lum = (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
        dark = lum < 0.5;
      }
      // nucleotide base-pair palette (cool, on-brand): teal · cyan · indigo · violet
      const bases = dark
        ? ['#34d399', '#22d3ee', '#818cf8', '#c084fc']
        : ['#0d9488', '#0891b2', '#4f46e5', '#7c3aed'];
      return { c1, c2, bases, dark };
    }

    function drawHelix(H: Helix, c1: string, c2: string, bases: string[], boost: number) {
      const steps = 60;
      const dx = Math.cos(H.angle), dy = Math.sin(H.angle);
      const px = -dy, py = dx; // perpendicular unit
      const p1: Array<[number, number]> = [];
      const p2: Array<[number, number]> = [];
      const depth: number[] = [];
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        const ax = H.x + dx * H.len * (tt - 0.5);
        const ay = H.y + dy * H.len * (tt - 0.5);
        const ang = tt * H.turns * Math.PI * 2 + H.phase;
        const o1 = Math.sin(ang) * H.amp;
        const o2 = Math.sin(ang + Math.PI) * H.amp;
        p1.push([ax + px * o1, ay + py * o1]);
        p2.push([ax + px * o2, ay + py * o2]);
        depth.push(Math.cos(ang)); // +1 front … -1 back
      }

      // taper alpha at both ends so helices fade in/out instead of popping
      const fade = (tt: number) => {
        const e = Math.min(tt, 1 - tt) / 0.12;
        return Math.max(0, Math.min(1, e));
      };

      // backbones
      ctx!.lineCap = 'round';
      const drawBackbone = (pts: Array<[number, number]>, color: string) => {
        for (let i = 1; i <= steps; i++) {
          const a = fade(i / steps);
          if (a <= 0) continue;
          ctx!.globalAlpha = a * 0.55 * boost;
          ctx!.strokeStyle = color;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.moveTo(pts[i - 1][0], pts[i - 1][1]);
          ctx!.lineTo(pts[i][0], pts[i][1]);
          ctx!.stroke();
        }
      };
      drawBackbone(p1, c1);
      drawBackbone(p2, c2);

      // base-pair rungs + nucleotide dots
      for (let i = 0; i <= steps; i += 3) {
        const f = fade(i / steps);
        if (f <= 0) continue;
        const d = (depth[i] + 1) / 2; // 0 back … 1 front
        const col = bases[(i / 3) % bases.length | 0];
        ctx!.globalAlpha = (0.12 + d * 0.5) * f * boost;
        ctx!.strokeStyle = col;
        ctx!.lineWidth = 0.8 + d * 1.6;
        ctx!.beginPath();
        ctx!.moveTo(p1[i][0], p1[i][1]);
        ctx!.lineTo(p2[i][0], p2[i][1]);
        ctx!.stroke();
        // nucleotide end dots
        ctx!.globalAlpha = (0.3 + d * 0.6) * f * boost;
        ctx!.fillStyle = col;
        const rr = 1.3 + d * 1.4;
        ctx!.beginPath(); ctx!.arc(p1[i][0], p1[i][1], rr, 0, Math.PI * 2); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(p2[i][0], p2[i][1], rr, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function frame() {
      const { c1, c2, bases, dark } = palette();
      const boost = dark ? 1 : 1.25;
      ctx!.clearRect(0, 0, width, height);

      // 1) molecular / protein network (behind helices)
      for (const a of atoms) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = width + 20; else if (a.x > width + 20) a.x = -20;
        if (a.y < -20) a.y = height + 20; else if (a.y > height + 20) a.y = -20;
      }
      ctx!.strokeStyle = c1;
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < BOND_DIST * BOND_DIST) {
            const d = Math.sqrt(d2);
            ctx!.globalAlpha = (1 - d / BOND_DIST) * 0.14 * boost;
            ctx!.lineWidth = 0.7;
            ctx!.beginPath();
            ctx!.moveTo(atoms[i].x, atoms[i].y);
            ctx!.lineTo(atoms[j].x, atoms[j].y);
            ctx!.stroke();
          }
        }
      }
      for (const a of atoms) {
        ctx!.globalAlpha = 0.16 * boost;
        ctx!.fillStyle = c2;
        ctx!.beginPath(); ctx!.arc(a.x, a.y, a.r + 3, 0, Math.PI * 2); ctx!.fill();
        ctx!.globalAlpha = 0.7 * boost;
        ctx!.fillStyle = c1;
        ctx!.beginPath(); ctx!.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx!.fill();
      }

      // 2) DNA double helices (foreground)
      for (const H of helices) {
        H.phase += H.spin;
        H.x += H.vx; H.y += H.vy;
        const margin = H.len; // wrap once fully off screen
        if (H.x < -margin) H.x = width + margin; else if (H.x > width + margin) H.x = -margin;
        if (H.y < -margin) H.y = height + margin; else if (H.y > height + margin) H.y = -margin;
        drawHelix(H, c1, c2, bases, boost);
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    }

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    resize();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame();
      cancelAnimationFrame(animId);
    } else {
      frame();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
