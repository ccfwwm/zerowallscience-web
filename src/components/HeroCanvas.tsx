import { useEffect, useRef } from 'react';

/**
 * Full-page life-science background.
 * Rotating DNA double helices (genome) drift over a faint molecular / protein
 * network (atoms + bonds). Mounted as a fixed, viewport-sized layer behind all
 * content, so it stays visible while scrolling. Edge-wrapping = no walls.
 * Always animates; theme-aware colors for dark and light modes.
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
    let lastW = 0;

    interface Helix {
      x: number; y: number;
      angle: number;
      len: number;
      amp: number;
      turns: number;
      phase: number;
      spin: number;
      vx: number; vy: number;
    }
    interface Atom { x: number; y: number; vx: number; vy: number; r: number; }

    let helices: Helix[] = [];
    let atoms: Atom[] = [];
    const BOND_DIST = 130;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    function build() {
      const mobile = width < 640;

      // ---- DNA helices: 8 genes, free random placement + free drift ----
      const target = 8;
      helices = [];
      for (let i = 0; i < target; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(0.16, 0.34);
        helices.push({
          x: rand(0, width),
          y: rand(0, height),
          angle,
          len: mobile ? rand(140, 210) : rand(220, 340),
          amp: mobile ? rand(11, 17) : rand(15, 26),
          turns: rand(2.4, 3.8),
          phase: rand(0, Math.PI * 2),
          spin: rand(0.018, 0.032) * (Math.random() < 0.5 ? 1 : -1),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }

      // ---- molecular atoms on a jittered grid ----
      const aTarget = Math.max(16, Math.min(52, Math.round((width * height) / 26000)));
      const aAspect = width / height;
      const aCols = Math.max(1, Math.round(Math.sqrt(aTarget * aAspect)));
      const aRows = Math.max(1, Math.ceil(aTarget / aCols));
      atoms = [];
      let k = 0;
      for (let r = 0; r < aRows; r++) {
        for (let c = 0; c < aCols; c++) {
          if (k >= aTarget) break;
          const cellW = width / aCols;
          const cellH = height / aRows;
          atoms.push({
            x: (c + 0.5) * cellW + rand(-0.45, 0.45) * cellW,
            y: (r + 0.5) * cellH + rand(-0.45, 0.45) * cellH,
            vx: rand(-0.22, 0.22),
            vy: rand(-0.22, 0.22),
            r: rand(1.3, 2.6),
          });
          k++;
        }
      }
    }

    function resize() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      canvas!.width = w;
      canvas!.height = h;
      width = w;
      height = h;
      // Only rebuild on a real width change — avoids resetting particles when the
      // mobile address bar shows/hides and only the height jitters.
      if (Math.abs(w - lastW) > 40 || helices.length === 0) build();
      lastW = w;
    }

    function palette() {
      const s = getComputedStyle(document.documentElement);
      const c1 = s.getPropertyValue('--hero-gradient-1').trim() || '#2563eb';
      const c2 = s.getPropertyValue('--hero-gradient-2').trim() || '#7c3aed';
      const bg = getComputedStyle(document.body).backgroundColor;
      const m = bg.match(/\d+/g);
      let dark = true;
      if (m) dark = (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255 < 0.5;
      const bases = dark
        ? ['#34d399', '#22d3ee', '#818cf8', '#c084fc']
        : ['#0d9488', '#0891b2', '#4f46e5', '#7c3aed'];
      return { c1, c2, bases, boost: dark ? 1 : 1.3 };
    }

    function drawHelix(H: Helix, c1: string, c2: string, bases: string[], boost: number) {
      const steps = 56;
      const dx = Math.cos(H.angle), dy = Math.sin(H.angle);
      const px = -dy, py = dx;
      const p1: Array<[number, number]> = [];
      const p2: Array<[number, number]> = [];
      const depth: number[] = [];
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps;
        const ax = H.x + dx * H.len * (tt - 0.5);
        const ay = H.y + dy * H.len * (tt - 0.5);
        const ang = tt * H.turns * Math.PI * 2 + H.phase;
        p1.push([ax + px * Math.sin(ang) * H.amp, ay + py * Math.sin(ang) * H.amp]);
        p2.push([ax + px * Math.sin(ang + Math.PI) * H.amp, ay + py * Math.sin(ang + Math.PI) * H.amp]);
        depth.push(Math.cos(ang));
      }
      const fade = (tt: number) => Math.max(0, Math.min(1, Math.min(tt, 1 - tt) / 0.12));

      ctx!.lineCap = 'round';
      const backbone = (pts: Array<[number, number]>, color: string) => {
        for (let i = 1; i <= steps; i++) {
          const a = fade(i / steps);
          if (a <= 0) continue;
          ctx!.globalAlpha = a * 0.5 * boost;
          ctx!.strokeStyle = color;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.moveTo(pts[i - 1][0], pts[i - 1][1]);
          ctx!.lineTo(pts[i][0], pts[i][1]);
          ctx!.stroke();
        }
      };
      backbone(p1, c1);
      backbone(p2, c2);

      for (let i = 0; i <= steps; i += 3) {
        const f = fade(i / steps);
        if (f <= 0) continue;
        const d = (depth[i] + 1) / 2;
        const col = bases[((i / 3) | 0) % bases.length];
        ctx!.globalAlpha = (0.1 + d * 0.45) * f * boost;
        ctx!.strokeStyle = col;
        ctx!.lineWidth = 0.8 + d * 1.5;
        ctx!.beginPath();
        ctx!.moveTo(p1[i][0], p1[i][1]);
        ctx!.lineTo(p2[i][0], p2[i][1]);
        ctx!.stroke();
        ctx!.globalAlpha = (0.28 + d * 0.55) * f * boost;
        ctx!.fillStyle = col;
        const rr = 1.2 + d * 1.3;
        ctx!.beginPath(); ctx!.arc(p1[i][0], p1[i][1], rr, 0, Math.PI * 2); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(p2[i][0], p2[i][1], rr, 0, Math.PI * 2); ctx!.fill();
      }
    }

    function frame() {
      const { c1, c2, bases, boost } = palette();
      ctx!.clearRect(0, 0, width, height);

      // molecular network
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
            ctx!.globalAlpha = (1 - d / BOND_DIST) * 0.12 * boost;
            ctx!.lineWidth = 0.7;
            ctx!.beginPath();
            ctx!.moveTo(atoms[i].x, atoms[i].y);
            ctx!.lineTo(atoms[j].x, atoms[j].y);
            ctx!.stroke();
          }
        }
      }
      for (const a of atoms) {
        ctx!.globalAlpha = 0.14 * boost;
        ctx!.fillStyle = c2;
        ctx!.beginPath(); ctx!.arc(a.x, a.y, a.r + 3, 0, Math.PI * 2); ctx!.fill();
        ctx!.globalAlpha = 0.6 * boost;
        ctx!.fillStyle = c1;
        ctx!.beginPath(); ctx!.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx!.fill();
      }

      // DNA helices (always rotating + drifting)
      for (const H of helices) {
        H.phase += H.spin;
        H.x += H.vx; H.y += H.vy;
        const margin = H.len;
        if (H.x < -margin) H.x = width + margin; else if (H.x > width + margin) H.x = -margin;
        if (H.y < -margin) H.y = height + margin; else if (H.y > height + margin) H.y = -margin;
        drawHelix(H, c1, c2, bases, boost);
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    resize();
    frame();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
