import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { ML_ROADMAP, ML_CONNECTIONS } from '../data/content';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Roadmap() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(0.72);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('lq_user');
    if (!u) { router.push('/auth'); return; }
    setUser(JSON.parse(u));
  }, []);

  const getNodeCenter = (node) => ({ x: node.x + 28, y: node.y + 28 });

  const getNodeById = (id) => ML_ROADMAP.find(n => n.id === id);

  const drawSmoothPath = (from, to) => {
    const sx = from.x + (from.isMajor ? 45 : 28);
    const sy = from.y + (from.isMajor ? 45 : 28);
    const ex = to.x + (to.isMajor ? 45 : 28);
    const ey = to.y + (to.isMajor ? 45 : 28);
    const dx = Math.abs(ex - sx);
    const ctrlRatio = Math.max(0.3, Math.min(0.6, dx / 300));
    const cx1 = ex > sx ? sx + dx * ctrlRatio : sx - dx * ctrlRatio;
    const cx2 = ex > sx ? ex - dx * ctrlRatio : ex + dx * ctrlRatio;
    return `M ${sx},${sy} C ${cx1},${sy} ${cx2},${ey} ${ex},${ey}`;
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.roadmap-node-el')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);

  const handleNodeClick = (node) => {
    if (node.status === 'locked') return;
    if (node.status === 'hidden') return;
    router.push(`/level/${node.id}`);
  };

  if (!user) return null;

  const completedXP = ML_ROADMAP.filter(n => n.status === 'done').reduce((s, n) => s + (n.xp || 0), 0);

  return (
    <>
      <Head><title>Roadmap: Machine Learning — LearnQuest</title></Head>
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)' }} />
      <Nav user={user} />

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', paddingTop: 64 }}>
        {/* LEFT SIDEBAR */}
        <aside style={{ width: 260, flexShrink: 0, background: 'rgba(9,14,28,0.95)', borderRight: '1px solid rgba(0,245,255,0.08)', padding: 24, zIndex: 10, overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Domain</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', marginBottom: 8 }}>Machine Learning</h2>
            <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(0,245,255,0.1)', color: 'var(--cyan)', border: '1px solid rgba(0,245,255,0.2)', fontWeight: 600 }}>INTERMEDIATE</span>
          </div>

          {/* User stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: '#060b18', boxShadow: '0 0 0 2px var(--cyan)' }}>
              {user.name?.[0]}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level {user.level} Learner</div>
            </div>
          </div>

          {/* XP */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>XP Progress</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>{user.xp} / 3,000</span>
            </div>
            <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${(user.xp / 3000) * 100}%` }} /></div>
          </div>

          {/* Streak */}
          <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--surface-bright)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.8rem', color: '#FF6B35', fontWeight: 600, marginBottom: 8 }}>🔥 {user.streak}-Day Streak</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < user.streak ? 'var(--cyan)' : 'var(--outline)' }} />
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Badges</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {user.badges.map((b, i) => (
                <div key={i} style={{ padding: '4px 10px', background: 'var(--surface)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 999, fontSize: '0.72rem', color: 'var(--gold)' }}>🏅 {b}</div>
              ))}
            </div>
          </div>

          {/* Tier indicators */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Tier</div>
            {[
              { label: 'Beginner', active: false },
              { label: 'Intermediate', active: true },
              { label: 'Advanced', active: false },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 4, background: t.active ? 'rgba(0,245,255,0.06)' : 'transparent', border: `1px solid ${t.active ? 'rgba(0,245,255,0.2)' : 'transparent'}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.active ? 'var(--cyan)' : 'var(--outline)', boxShadow: t.active ? 'var(--glow-cyan-sm)' : 'none' }} />
                <span style={{ fontSize: '0.85rem', color: t.active ? 'var(--cyan)' : 'var(--text-dim)', fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
                {t.active && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--cyan)', background: 'rgba(0,245,255,0.1)', padding: '2px 6px', borderRadius: 999 }}>YOU</span>}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 24, padding: 14, background: 'var(--surface)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Legend</div>
            {[
              { color: 'var(--cyan)', label: 'Completed', icon: '✓' },
              { color: 'var(--cyan)', label: 'Active (animate)', icon: '●' },
              { color: 'var(--outline)', label: 'Locked', icon: '🔒' },
              { color: 'var(--gold)', label: 'Hidden Quest', icon: '?' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span style={{ color: l.color, fontWeight: 700 }}>{l.icon}</span> {l.label}
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

          {/* Zoom controls */}
          <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} style={{ width: 36, height: 36, padding: 0, justifyContent: 'center' }}>+</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} style={{ width: 36, height: 36, padding: 0, justifyContent: 'center' }}>−</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setZoom(0.72); setOffset({ x: 0, y: 0 }); }} style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', fontSize: '0.7rem' }}>↺</button>
          </div>

          {/* Canvas content */}
          <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`, transformOrigin: '0 0', width: 1700, height: 700 }}>
            {/* Background hex grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,245,255,0.04) 1px, transparent 0)', backgroundSize: '50px 50px' }} />

            {/* SVG connection paths */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
              {ML_CONNECTIONS.map(([fromId, toId], i) => {
                const from = getNodeById(fromId);
                const to = getNodeById(toId);
                if (!from || !to) return null;
                const isActive = from.status !== 'locked' && from.status !== 'hidden' && to.status !== 'locked' && to.status !== 'hidden';
                const isHidden = from.status === 'hidden' || to.status === 'hidden';
                return (
                  <path key={i}
                    d={drawSmoothPath(from, to)}
                    fill="none"
                    stroke={isHidden ? 'rgba(255,215,0,0.15)' : isActive ? 'var(--cyan)' : 'rgba(0,245,255,0.08)'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={isActive ? 'energy-flow' : ''}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {ML_ROADMAP.map(node => {
              const isHovered = hoveredNode === node.id;
              return (
                <div key={node.id}
                  className="roadmap-node-el"
                  style={{ position: 'absolute', left: node.x, top: node.y }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}>
                  <div className={`hud-node ${node.status === 'done' ? 'hud-node-done' : node.status === 'active' ? 'hud-node-active' : node.status === 'hidden' ? 'hud-node-hidden' : 'hud-node-locked'} ${node.isMajor ? 'hud-node-major' : ''} ${node.isMajor && node.status === 'active' ? 'hud-node-major-active' : ''}`}
                    style={{ cursor: node.status === 'locked' ? 'not-allowed' : 'pointer', ...(node.isMajor && node.img ? { '--bg-img': `url("${node.img}")` } : {}) }}>
                    <div className="hud-node-core">
                      {node.status === 'done' ? '✓' : node.status === 'active' ? node.level : node.status === 'hidden' ? '?' : node.status === 'locked' ? '🔒' : node.level}
                    </div>
                  </div>

                  {/* Level label */}
                  <div style={{ position: 'absolute', top: node.isMajor ? 102 : 72, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                    <div className={`hud-label ${node.status === 'active' ? 'hud-label-active' : ''}`} style={{ color: node.status === 'done' ? 'var(--cyan)' : node.status === 'active' ? '#fff' : node.status === 'hidden' ? 'var(--gold)' : 'var(--text-dim)' }}>
                      <span className="hud-bracket">[</span>
                      {node.status === 'hidden' ? '??? Hidden Quest' : node.title}
                      <span className="hud-bracket">]</span>
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="tooltip">
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: node.status === 'hidden' ? 'var(--gold)' : 'var(--cyan)', marginBottom: 4, fontSize: '0.85rem' }}>
                        {node.status === 'hidden' ? '??? Hidden Quest' : `Level ${node.level}: ${node.title}`}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 4 }}>{node.xp} XP · {node.time}</div>
                      {(node.status === 'active' || node.status === 'done' || node.status === 'unlocked') && (
                        <div style={{ color: 'var(--cyan)', fontSize: '0.75rem', marginTop: 4 }}>Click to enter →</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL — Selected level info */}
        <aside style={{ width: 220, flexShrink: 0, background: 'rgba(9,14,28,0.95)', borderLeft: '1px solid rgba(0,245,255,0.08)', padding: 20, zIndex: 10 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Current Level</div>
            {(() => {
              const active = ML_ROADMAP.find(n => n.status === 'active');
              return active ? (
                <div className="card card-glow" style={{ padding: 16 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Level {active.level}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem', marginBottom: 10, color: 'var(--cyan)' }}>{active.title}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>⚡ {active.xp} XP</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ {active.time}</span>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
                    onClick={() => router.push(`/level/${active.id}`)}>
                    Enter Level →
                  </button>
                </div>
              ) : null;
            })()}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Progress</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-head)', fontWeight: 700 }}>4</span> / 30 Levels
            </div>
            <div className="xp-bar-track" style={{ marginBottom: 8 }}>
              <div className="xp-bar-fill" style={{ width: '13%' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedXP} XP earned</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>🗝️ Hidden Quests</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>2 hidden nodes await. Reach Level 7 to unlock your first secret quest.</div>
          </div>
        </aside>
      </div>
    </>
  );
}
