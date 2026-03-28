import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { supabase } from '../lib/supabase';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

const DOMAINS = ['Machine Learning', 'Web Development', 'Data Science', 'Finance', 'UX Design', 'Blockchain', 'Psychology', 'Neuroscience', 'Cybersecurity', 'Quantum Computing'];

const recentRoadmaps = [
  { id: 5, domain: 'Machine Learning', level: 5, total: 30, xp: 2450, pct: 40, lastActive: 'Today' },
  { id: 3, domain: 'Web Development', level: 3, total: 25, xp: 850, pct: 18, lastActive: '3 days ago' },
  { id: 1, domain: 'Data Science', level: 1, total: 20, xp: 100, pct: 5, lastActive: '1 week ago' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Fallback: check localStorage (for users who logged in before Supabase)
        const stored = localStorage.getItem('lq_user');
        if (!stored) { router.push('/auth'); return; }
        setUser(JSON.parse(stored));
      } else {
        // Sync fresh profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const lqUser = {
          id: session.user.id,
          name: profile?.name || session.user.email.split('@')[0],
          email: session.user.email,
          level: profile?.level ?? 1,
          xp: profile?.xp ?? 0,
          streak: profile?.streak ?? 0,
          badges: profile?.badges ?? [],
        };
        localStorage.setItem('lq_user', JSON.stringify(lqUser));
        setUser(lqUser);
      }
      if (router.query.levelup) {
        setTimeout(() => setShowLevelUp(true), 500);
        setTimeout(() => setShowLevelUp(false), 4000);
      }
    };
    init();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) router.push(`/assessment?topic=${encodeURIComponent(search)}`);
  };

  const handleChip = (topic) => {
    setSearch(topic);
    router.push(`/assessment?topic=${encodeURIComponent(topic)}`);
  };

  if (!user) return null;

  const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  return (
    <>
      <Head><title>Dashboard — LearnQuest</title></Head>
      <Particles />
      <div className="orb orb-cyan" />
      <div className="orb orb-violet" />
      <Nav user={user} />

      {/* Level-Up Overlay */}
      {showLevelUp && (
        <div className="levelup-overlay" onClick={() => setShowLevelUp(false)}>
          <div className="levelup-card">
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2.5rem', color: 'var(--gold)', marginBottom: 8 }}>LEVEL UP!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>You've reached Level {user.level + 1}!</p>
            <div className="lvl-badge" style={{ width: 80, height: 92, margin: '0 auto 24px', fontSize: '1.2rem' }}>LVL {user.level + 1}</div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Click anywhere to continue</p>
          </div>
        </div>
      )}

      <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Hero Search Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 760, width: '100%', padding: '0 24px' }}>
            {/* Greeting */}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
              Good {timeOfDay}, <span style={{ color: 'var(--cyan)' }}>{user.name.split(' ')[0]}</span>
            </p>
            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', letterSpacing: '-0.02em', marginBottom: 40 }}>
              What do you want to master today?
            </h1>

            {/* Main search bar */}
            <form onSubmit={handleSearch}>
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(30,37,59,0.8)', backdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(0,245,255,0.3)', borderRadius: 999,
                  padding: '6px 8px 6px 24px',
                  boxShadow: 'var(--glow-cyan-sm), 0 20px 60px rgba(0,0,0,0.4)',
                  animation: 'pulse-ring 3s ease-in-out infinite',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>✨</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search any skill or topic..."
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '1.1rem', padding: '10px 0' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: 999, padding: '12px 28px', flexShrink: 0 }}>
                    Ask ARIA →
                  </button>
                </div>
              </div>
            </form>

            {/* Topic chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {DOMAINS.map(d => (
                <button key={d} className="chip" onClick={() => handleChip(d)}>
                  {d === 'Machine Learning' ? '🧠' : d === 'Web Development' ? '💻' : d === 'Data Science' ? '📊' : d === 'Finance' ? '💰' : d === 'UX Design' ? '🎨' : d === 'Blockchain' ? '⛓️' : d === 'Psychology' ? '🔮' : d === 'Neuroscience' ? '⚡' : d === 'Cybersecurity' ? '🛡️' : '⚛️'} {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Streak Widget + Recent Roadmaps */}
        <div className="container" style={{ paddingBottom: 60, position: 'relative', zIndex: 1 }}>
          {/* Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div className="glass" style={{ padding: '14px 24px', display: 'inline-flex', alignItems: 'center', gap: 16, borderColor: 'rgba(255,107,53,0.3)' }}>
              <span style={{ fontSize: '1.4rem' }}>🔥</span>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: '#FF6B35' }}>7-Day Streak!</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: i < 7 ? 'rgba(0,245,255,0.2)' : 'var(--surface)', border: `2px solid ${i < 7 ? 'var(--cyan)' : 'var(--outline)'}`, boxShadow: i < 7 ? 'var(--glow-cyan-sm)' : 'none' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="glass" style={{ padding: '14px 24px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              {user.badges.map((b, i) => (
                <span key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--surface-bright)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,215,0,0.2)', color: 'var(--gold)' }}>🏅 {b}</span>
              ))}
            </div>
          </div>

          {/* Recent roadmaps */}
          <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>Continue Your Quests</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {recentRoadmaps.map((rm, i) => (
              <div key={i} className={`card ${i === 0 ? 'card-glow' : ''}`} style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: i === 0 ? 'rgba(0,245,255,0.3)' : '' }}
                onClick={() => router.push('/roadmap')}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{rm.domain}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level {rm.level} of {rm.total}</div>
                  </div>
                  {i === 0 && <span style={{ fontSize: '0.72rem', background: 'rgba(0,245,255,0.1)', color: 'var(--cyan)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(0,245,255,0.2)', fontWeight: 600 }}>ACTIVE</span>}
                </div>
                <div className="xp-bar-track" style={{ marginBottom: 8 }}>
                  <div className="xp-bar-fill" style={{ width: `${rm.pct}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rm.pct}% Complete</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontWeight: 600 }}>{rm.xp.toLocaleString()} XP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last active: {rm.lastActive}</span>
                  <button className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}>
                    {i === 0 ? 'Continue →' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
