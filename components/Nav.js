import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Logo({ onClick }) {
  const router = useRouter();
  const handleClick = onClick || (() => router.push('/dashboard'));
  return (
    <div className="nav-logo" onClick={handleClick} title="Go to Dashboard" style={{ cursor: 'pointer' }}>
      <svg className="nav-logo-icon" viewBox="0 0 34 34" fill="none">
        <polygon points="17,2 32,10 32,24 17,32 2,24 2,10" fill="none" stroke="#00F5FF" strokeWidth="1.5"/>
        <polygon points="17,8 27,13.5 27,20.5 17,26 7,20.5 7,13.5" fill="rgba(0,245,255,0.1)" stroke="#00F5FF" strokeWidth="1"/>
        <circle cx="17" cy="17" r="4" fill="#00F5FF"/>
        <line x1="17" y1="2" x2="17" y2="8" stroke="#00F5FF" strokeWidth="1"/>
        <line x1="17" y1="26" x2="17" y2="32" stroke="#00F5FF" strokeWidth="1"/>
        <line x1="32" y1="10" x2="27" y2="13.5" stroke="#00F5FF" strokeWidth="1"/>
        <line x1="2" y1="10" x2="7" y2="13.5" stroke="#00F5FF" strokeWidth="1"/>
      </svg>
      <span className="nav-logo-text">Learn<span>Quest</span></span>
    </div>
  );
}

export default function Nav({ user: userProp }) {
  const router = useRouter();
  const [user, setUser] = useState(userProp || null);

  // Always read from localStorage so logo works on every page
  useEffect(() => {
    if (userProp) { setUser(userProp); return; }
    try {
      const stored = localStorage.getItem('lq_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, [userProp]);

  const isLoggedIn = !!user;
  const goHome = () => router.push(isLoggedIn ? '/dashboard' : '/');

  return (
    <nav className="nav">
      <Logo onClick={goHome} />

      {isLoggedIn ? (
        <>
          <div className="nav-links">
            <a onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>Home</a>
            <a onClick={() => router.push('/roadmap')} style={{ cursor: 'pointer' }}>My Roadmaps</a>
            <a onClick={() => router.push('/leaderboard')} style={{ cursor: 'pointer' }}>Leaderboard</a>
            <a href="#" onClick={e => e.preventDefault()}>Explore</a>
          </div>
          <div className="nav-right">
            <div style={{ textAlign: 'right', marginRight: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                {user.xp?.toLocaleString()} / 3,000 XP
              </div>
              <div className="xp-bar-track" style={{ width: 120 }}>
                <div className="xp-bar-fill" style={{ width: `${Math.min(100, (user.xp / 3000) * 100)}%` }} />
              </div>
            </div>
            <div className="lvl-badge" style={{ fontSize: '0.65rem' }}>LVL {user.level}</div>
            <div
              title="Profile"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--cyan),var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem',
                color: '#060b18', boxShadow: '0 0 0 2px var(--cyan)', cursor: 'pointer'
              }}>
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('lq_user');
                router.push('/');
              }}
              style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: 'rgba(255,68,102,0.3)', color: '#ff6688' }}
            >
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a onClick={() => router.push('/leaderboard')} style={{ cursor: 'pointer' }}>Leaderboard</a>
          </div>
          <div className="nav-right">
            <button className="btn btn-ghost-violet btn-sm" onClick={() => router.push('/auth')}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push('/auth?tab=signup')}>Start Your Quest</button>
          </div>
        </>
      )}
    </nav>
  );
}
