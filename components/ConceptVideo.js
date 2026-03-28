import { useRef, useEffect, useState, useCallback } from 'react';

// ─── Supervised Learning Animated Concept Video ───────────────────────────────
// Canvas-based animation showing: data points → decision boundary → prediction

const CHAPTERS = [
  { t: 0,   label: 'Intro' },
  { t: 3,   label: 'Training Data' },
  { t: 8,   label: 'Decision Boundary' },
  { t: 13,  label: 'Making a Prediction' },
  { t: 18,  label: 'Model Evaluation' },
];

const CLASS_A_PTS = [
  [130,220],[160,260],[110,290],[145,250],[125,270],[155,235],[105,245],[170,280],
];
const CLASS_B_PTS = [
  [360,160],[390,130],[350,110],[380,145],[370,120],[400,155],[355,135],[410,130],
];
const SUBTITLES = [
  { t: 0,  end: 3,   text: 'Welcome to Supervised Learning' },
  { t: 3,  end: 8,   text: 'We have labeled training data: Class A (blue) and Class B (red)' },
  { t: 8,  end: 13,  text: 'The model learns a Decision Boundary between the classes' },
  { t: 13, end: 18,  text: 'A new point arrives — the model classifies it in real time' },
  { t: 18, end: 24,  text: 'Model Evaluation: how well does it generalize to new data?' },
  { t: 24, end: 30,  text: 'That\'s Supervised Learning — learning from labeled examples!' },
];

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

export default function ConceptVideo() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pauseOffsetRef = useRef(0);
  const lastPauseRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);  // 0-1
  const [currentTime, setCurrent] = useState(0);
  const DURATION = 30; // seconds

  const draw = useCallback((sec) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // ── Background ──
    ctx.fillStyle = '#050d1a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0,245,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Corner bracket decorations
    const bLen = 20, bThick = 2;
    ctx.strokeStyle = 'rgba(0,245,255,0.25)'; ctx.lineWidth = bThick;
    [[8,8],[W-8,8],[8,H-8],[W-8,H-8]].forEach(([cx,cy]) => {
      const sx = cx < W/2 ? 1 : -1, sy = cy < H/2 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(cx,cy+sy*bLen); ctx.lineTo(cx,cy); ctx.lineTo(cx+sx*bLen,cy); ctx.stroke();
    });

    // ── PHASE 1: Intro (0-3s) ──
    if (sec < 3) {
      const p = easeOut(sec / 2.5);
      ctx.globalAlpha = p;
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#00F5FF';
      ctx.textAlign = 'center';
      ctx.fillText('Supervised Learning', W/2, H/2 - 18);
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('A visual walkthrough', W/2, H/2 + 18);
      ctx.globalAlpha = 1;
      return;
    }

    // ── Axes (appear after intro) ──
    const axisP = easeOut(Math.min(1, (sec - 3) / 1.5));
    const OX = 70, OY = H - 70, AW = W - 120, AH = H - 130;
    ctx.strokeStyle = `rgba(255,255,255,${0.2 * axisP})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX + AW * axisP, OY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX, OY - AH * axisP); ctx.stroke();
    // Axis labels
    if (axisP > 0.5) {
      ctx.globalAlpha = (axisP - 0.5) * 2;
      ctx.font = '13px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.textAlign = 'center';
      ctx.fillText('Feature 1', OX + AW / 2, OY + 28);
      ctx.save(); ctx.translate(18, OY - AH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText('Feature 2', 0, 0); ctx.restore();
      ctx.globalAlpha = 1;
    }

    // ── PHASE 2: Training Data (3-8s) ──
    // Class A — blue dots
    const dotAnimEnd = 8;
    CLASS_A_PTS.forEach(([ px, py], i) => {
      const appear = easeOut(Math.min(1, (sec - 3 - i * 0.35) / 0.5));
      if (appear <= 0) return;
      ctx.globalAlpha = appear;
      // Glow
      const grd = ctx.createRadialGradient(px, py, 0, px, py, 18 * appear);
      grd.addColorStop(0, 'rgba(30,144,255,0.35)'); grd.addColorStop(1, 'rgba(30,144,255,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI*2); ctx.fill();
      // Dot
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(px, py, 9 * appear, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Class B — red/rose dots
    CLASS_B_PTS.forEach(([px, py], i) => {
      const appear = easeOut(Math.min(1, (sec - 4.5 - i * 0.3) / 0.5));
      if (appear <= 0) return;
      ctx.globalAlpha = appear;
      const grd = ctx.createRadialGradient(px, py, 0, px, py, 18 * appear);
      grd.addColorStop(0, 'rgba(239,68,68,0.3)'); grd.addColorStop(1, 'rgba(239,68,68,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(px, py, 9 * appear, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Legend labels (after 6s)
    if (sec > 6) {
      const lp = easeOut(Math.min(1, (sec - 6) / 1));
      ctx.globalAlpha = lp;
      // Class A label
      ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(78, 48, 7, 0, Math.PI*2); ctx.fill();
      ctx.font = '13px "Space Grotesk", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'left';
      ctx.fillText('Class A', 93, 52);
      // Class B label
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(170, 48, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillText('Class B', 185, 52);
      ctx.globalAlpha = 1;
    }

    // ── PHASE 3: Decision Boundary (8-13s) ──
    if (sec > 8) {
      const bp = easeInOut(Math.min(1, (sec - 8) / 2.5));
      // Boundary line: from (70, 370) to (490, 70)
      const x1 = 70, y1 = 390, x2 = lerp(x1, 490, bp), y2 = lerp(y1, 65, bp);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(34,211,170,0.9)'); grad.addColorStop(1, 'rgba(0,245,255,0.9)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);

      // Label
      if (bp > 0.7) {
        const lp2 = easeOut((bp - 0.7) / 0.3);
        ctx.globalAlpha = lp2;
        const mx = (x1+x2)/2 + 14, my = (y1+y2)/2 - 14;
        ctx.font = 'bold 12px "Space Grotesk", sans-serif'; ctx.fillStyle = '#00F5FF'; ctx.textAlign = 'left';
        ctx.fillText('Decision Boundary', mx, my);
        ctx.globalAlpha = 1;
      }

      // Shaded regions
      if (sec > 10) {
        const sp = easeOut(Math.min(1, (sec - 10) / 2));
        ctx.globalAlpha = 0.05 * sp;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(70,390); ctx.lineTo(70,68); ctx.lineTo(280,68); ctx.lineTo(70,390); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.moveTo(490,65); ctx.lineTo(490,390); ctx.lineTo(70,390); ctx.lineTo(490,65); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ── PHASE 4: Prediction (13-18s) ──
    if (sec > 13) {
      const tp = easeOut(Math.min(1, (sec - 13) / 1.5));
      const newPx = 280, newPy = 220;

      // New point: arrives as yellow question mark
      ctx.globalAlpha = tp;
      const grd2 = ctx.createRadialGradient(newPx, newPy, 0, newPx, newPy, 28);
      grd2.addColorStop(0, 'rgba(250,204,21,0.4)'); grd2.addColorStop(1, 'rgba(250,204,21,0)');
      ctx.fillStyle = grd2; ctx.beginPath(); ctx.arc(newPx, newPy, 28, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(newPx, newPy, 11 * tp, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 2; ctx.stroke();
      // '?' label
      ctx.font = `bold ${Math.round(14 * tp)}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#060b18'; ctx.textAlign = 'center';
      ctx.fillText('?', newPx, newPy + 5);
      ctx.globalAlpha = 1;

      // Arrow animation
      if (sec > 15) {
        const ap = easeOut(Math.min(1, (sec - 15) / 1.2));
        ctx.globalAlpha = ap;
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
        ctx.beginPath(); ctx.moveTo(newPx, newPy); ctx.lineTo(lerp(newPx, 370, ap), lerp(newPy, 140, ap)); ctx.stroke();
        ctx.setLineDash([]);
        // Label
        if (ap > 0.7) {
          const lp3 = easeOut((ap - 0.7) / 0.3);
          ctx.globalAlpha = lp3;
          ctx.fillStyle = '#ef4444'; ctx.font = 'bold 13px "Space Grotesk", sans-serif';
          ctx.fillText('→ Class B', 390, 135);
        }
        ctx.globalAlpha = 1;
      }
    }

    // ── PHASE 5: Evaluation (18-24s) ──
    if (sec > 18) {
      const ep = easeOut(Math.min(1, (sec - 18) / 2));
      ctx.globalAlpha = ep;
      // Accuracy panel top-right
      const px2 = W - 160, py2 = 75;
      ctx.fillStyle = 'rgba(13,19,35,0.88)';
      ctx.strokeStyle = 'rgba(0,245,255,0.3)'; ctx.lineWidth = 1.5;
      roundRect(ctx, px2, py2, 148, 110, 10);
      ctx.fill(); ctx.stroke();
      ctx.font = 'bold 11px "Space Grotesk", sans-serif'; ctx.fillStyle = 'rgba(0,245,255,0.7)'; ctx.textAlign = 'left';
      ctx.fillText('MODEL METRICS', px2+12, py2+22);
      [['Accuracy', '94%', '#00ff88'], ['Precision', '91%', '#00F5FF'], ['Recall', '96%', '#a78bfa']].forEach(([k,v,c], idx) => {
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '12px Inter, sans-serif';
        ctx.fillText(k, px2+12, py2+44+idx*22);
        ctx.fillStyle = c; ctx.font = 'bold 12px "Space Grotesk", sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(v, px2+136, py2+44+idx*22);
        ctx.textAlign = 'left';
      });
      ctx.globalAlpha = 1;
    }

    // ── PHASE 6: Outro (26-30s) ──
    if (sec > 26) {
      const op = easeInOut(Math.min(1, (sec - 26) / 2.5));
      ctx.globalAlpha = op * 0.85;
      ctx.fillStyle = '#050d1a'; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = op;
      ctx.font = 'bold 26px "Space Grotesk", sans-serif'; ctx.fillStyle = '#00F5FF'; ctx.textAlign = 'center';
      ctx.fillText('Level 5 Complete!', W/2, H/2 - 20);
      ctx.font = '15px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('You\'ve mastered Supervised Learning', W/2, H/2 + 18);
      ctx.globalAlpha = 1;
    }

    // ── Subtitle bar ──
    const sub = SUBTITLES.find(s => sec >= s.t && sec < s.end);
    if (sub) {
      ctx.fillStyle = 'rgba(6,11,24,0.82)';
      ctx.fillRect(40, H - 52, W - 80, 36);
      ctx.font = '14px Inter, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.textAlign = 'center';
      ctx.fillText(sub.text, W/2, H - 28);
    }

    // ── Timer ──
    ctx.font = '11px "Space Grotesk", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(sec)}s / ${DURATION}s`, W - 12, H - 8);

  }, []);

  // round rect helper
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  // Animation loop
  const tick = useCallback(() => {
    const now = performance.now();
    const elapsed = (now - startRef.current) / 1000 - pauseOffsetRef.current;
    const sec = Math.min(elapsed, DURATION);
    setCurrent(sec);
    setProgress(sec / DURATION);
    draw(sec);
    if (sec < DURATION) rafRef.current = requestAnimationFrame(tick);
    else { setPlaying(false); }
  }, [draw]);

  useEffect(() => {
    draw(0);
  }, [draw]);

  const handlePlayPause = () => {
    if (playing) {
      lastPauseRef.current = performance.now();
      cancelAnimationFrame(rafRef.current);
      setPlaying(false);
    } else {
      if (currentTime >= DURATION) {
        // Restart
        startRef.current = performance.now();
        pauseOffsetRef.current = 0;
      } else {
        const pausedFor = lastPauseRef.current ? (performance.now() - lastPauseRef.current) / 1000 : 0;
        pauseOffsetRef.current -= pausedFor;
        if (!startRef.current) startRef.current = performance.now();
      }
      lastPauseRef.current = null;
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = ratio * DURATION;
    cancelAnimationFrame(rafRef.current);
    // Reset timing so next play starts from scrubbed position
    startRef.current = performance.now() - targetSec * 1000;
    pauseOffsetRef.current = 0;
    lastPauseRef.current = null;
    setCurrent(targetSec);
    setProgress(ratio);
    draw(targetSec);
    if (playing) rafRef.current = requestAnimationFrame(tick);
  };

  const currentChapter = CHAPTERS.filter(c => c.t <= currentTime).pop()?.label || 'Intro';
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: '#050d1a', boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,255,0.12)', marginBottom: 28 }}>
      {/* Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={760}
          height={400}
          style={{ display: 'block', width: '100%', height: 'auto', cursor: 'pointer' }}
          onClick={handlePlayPause}
        />
        {/* Play overlay when paused */}
        {!playing && currentTime < DURATION && (
          <div onClick={handlePlayPause} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,13,26,0.45)', cursor: 'pointer',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(0,245,255,0.15)', border: '2px solid var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(0,245,255,0.4)', fontSize: '1.8rem',
              paddingLeft: 6, transition: 'all 0.2s',
            }}>▶</div>
          </div>
        )}
        {/* "AI Generated" badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.7rem', fontFamily: 'var(--font-head)', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(5,13,26,0.8)', border: '1px solid rgba(0,245,255,0.3)', color: 'var(--cyan)', letterSpacing: '0.05em' }}>
          ✨ AI GENERATED
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 16px', background: 'rgba(13,19,35,0.95)', borderTop: '1px solid rgba(0,245,255,0.07)' }}>
        {/* Progress bar */}
        <div
          onClick={handleScrub}
          style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 10, cursor: 'pointer', position: 'relative' }}>
          {/* Chapter markers */}
          {CHAPTERS.map((c, i) => (
            <div key={i} style={{ position: 'absolute', top: -3, left: `${(c.t / DURATION) * 100}%`, width: 2, height: 10, background: 'rgba(0,245,255,0.4)', borderRadius: 1, transform: 'translateX(-50%)' }} />
          ))}
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg, var(--cyan), var(--violet))', borderRadius: 2, position: 'relative', transition: 'width 0.08s linear' }}>
            <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)', boxShadow: 'var(--glow-cyan-sm)' }} />
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Play/Pause */}
          <button onClick={handlePlayPause}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cyan)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', color: '#060b18', fontWeight: 700, flexShrink: 0, boxShadow: 'var(--glow-cyan-sm)' }}>
            {playing ? '⏸' : currentTime >= DURATION ? '↺' : '▶'}
          </button>

          {/* Time */}
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-head)', color: 'var(--text-muted)', letterSpacing: '0.03em', flexShrink: 0 }}>
            {fmt(currentTime)} / {fmt(DURATION)}
          </span>

          {/* Chapter */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontFamily: 'var(--font-head)', fontWeight: 600, opacity: 0.85 }}>
              ▸ {currentChapter}
            </span>
          </div>

          {/* Chapter pills */}
          <div style={{ display: 'flex', gap: 5 }}>
            {CHAPTERS.map((c, i) => (
              <button key={i}
                onClick={(e) => { e.stopPropagation(); handleScrub({ currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 1 }) }, clientX: c.t / DURATION }); }}
                title={c.label}
                style={{ width: 20, height: 4, borderRadius: 2, border: 'none', cursor: 'pointer', background: currentTime >= c.t ? 'var(--cyan)' : 'rgba(255,255,255,0.15)', transition: 'all 0.2s' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
