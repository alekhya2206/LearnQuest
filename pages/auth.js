import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Nav';
import { supabase } from '../lib/supabase';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Auth() {
  const router = useRouter();
  const [tab, setTab] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (router.query.tab === 'signup') setTab('signup');
  }, [router.query]);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.push('/dashboard');
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (tab === 'signup' && form.password !== form.confirm) {
        setError('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
        setError('Password must be at least 6 characters'); return;
    }

    setLoading(true);

    if (tab === 'signup') {
        const { error: signUpErr } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { full_name: form.name || form.email.split('@')[0] },
            },
        });
        if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }
        setMessage('✅ Account forged in the fire! Check your email to confirm.');
        setTab('signin');
        setLoading(false);
    } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });
        if (signInErr) { setError(signInErr.message); setLoading(false); return; }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const lqUser = {
            id: data.user.id,
            name: profile?.name || data.user.email.split('@')[0],
            email: data.user.email,
            level: profile?.level ?? 1,
            xp: profile?.xp ?? 0,
            streak: profile?.streak ?? 0,
            badges: profile?.badges ?? [],
        };
        localStorage.setItem('lq_user', JSON.stringify(lqUser));
        router.push('/dashboard');
    }
  };

  const containerVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 100 } }
  };

  const formItemVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  return (
    <>
      <Head><title>{tab === 'signin' ? 'Login' : 'Join'} — LearnQuest</title></Head>
      <Particles />
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} className="orb orb-cyan" style={{ width: 1000, height: 1000, top: '-30%', left: '-20%' }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: 'linear' }} className="orb orb-violet" style={{ width: 1000, height: 1000, bottom: '-30%', right: '-20%' }} />

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '32px 48px' }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-block', padding: '12px 24px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(30px)', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Logo onClick={() => router.push('/')} />
        </motion.div>
      </div>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        {/* Left Side (Visuals) - Neo brutualism fun */}
        <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', position: 'relative', overflow: 'hidden' }}>
          
           {/* Cosmos of Floating Icons */}
           {[
             { emoji: '🕹️', top: '15%', left: '10%', delay: 0, duration: 6, size: '4rem' },
             { emoji: '👾', top: '25%', left: '80%', delay: 1, duration: 5, size: '3.5rem' },
             { emoji: '💎', top: '70%', left: '15%', delay: 2, duration: 7, size: '2.5rem' },
             { emoji: '🚀', top: '65%', left: '85%', delay: 0.5, duration: 5.5, size: '4.5rem' },
             { emoji: '⚡', top: '40%', left: '60%', delay: 1.5, duration: 4.5, size: '3rem' },
             { emoji: '🧠', top: '10%', left: '50%', delay: 2.5, duration: 6.5, size: '3.5rem' },
           ].map((item, i) => (
             <motion.div key={i} animate={{ y: [-15, 15, -15], rotate: [-10, 10, -10], scale: [1, 1.1, 1] }} transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }} style={{ position: 'absolute', top: item.top, left: item.left, fontSize: item.size, filter: 'drop-shadow(0 15px 25px rgba(0,245,255,0.4))', zIndex: 0, opacity: 0.8 }}>
               {item.emoji}
             </motion.div>
           ))}

           {/* Animated Connectivity Lines (SVG background) */}
           <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', opacity: 0.3 }}>
              <motion.path animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} d="M 120 200 L 400 150 L 500 400 L 200 600 Z" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="10 10" fill="none" />
              <motion.path animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 2 }} d="M 50 500 L 300 400 L 600 200" stroke="var(--violet)" strokeWidth="3" fill="none" />
           </svg>

           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.2 }} style={{ zIndex: 1, position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', padding: '8px 20px', borderRadius: 999, marginBottom: 24, boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Server Alpha-01 Online</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', lineHeight: 1.05, marginBottom: 32, letterSpacing: '-0.03em', color: '#fff', textShadow: '4px 4px 0 rgba(0,245,255,0.3)' }}>
                Initialize <br/>
                <span style={{ color: 'var(--cyan)' }}>Player One.</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: 480, lineHeight: 1.6, fontWeight: 500, background: 'rgba(0,0,0,0.4)', padding: '16px 24px', borderRadius: '16px', borderLeft: '4px solid var(--violet)', backdropFilter: 'blur(10px)' }}>
                Log in to sync your progress, interact with ARIA, and continue mastering your skill trees.
              </p>
           </motion.div>
           
           {/* Decorative floating feeds replacing the single card */}
           <div style={{ position: 'absolute', right: 40, bottom: 80, display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
             {[
               { title: 'Level 8 Data Science', blurp: '+400 XP earned', color: 'var(--violet)', delay: 0 },
               { title: 'Quest Complete!', blurp: 'Python Async/Await', color: 'var(--cyan)', delay: 0.2 },
               { title: 'New Badge Unlocked', blurp: 'Early Adopter', color: '#FFD700', delay: 0.4 },
             ].map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }} transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i }, default: { type: 'spring', delay: card.delay, stiffness: 100 } }} style={{ width: 260, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${card.color}55`, borderRadius: 20, padding: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                  <motion.div animate={{ left: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: card.delay }} style={{ position: 'absolute', top: 0, bottom: 0, width: '50%', background: `linear-gradient(90deg, transparent, ${card.color}22, transparent)`, skewX: '-20deg' }} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${card.color}33`, border: `1px solid ${card.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{i === 0 ? '📊' : i === 1 ? '🎯' : '🏆'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{card.title}</div>
                      <div style={{ fontSize: '0.75rem', color: card.color }}>{card.blurp}</div>
                    </div>
                  </div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* Right Side (Form) */}
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <motion.div variants={containerVariant} initial="hidden" animate="visible" className="glass" style={{ width: '100%', padding: '56px', position: 'relative', background: 'rgba(6, 11, 24, 0.6)', backdropFilter: 'blur(50px)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '32px', boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.2)' }}>

            {/* Title */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '2.2rem', marginBottom: 8, color: '#fff' }}>
                {tab === 'signin' ? 'Welcome Back 👋' : 'Create Avatar 🚀'}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
                {tab === 'signin' ? 'Enter your credentials to jack in.' : 'Every master was once a beginner. Start now.'}
              </p>
            </div>

            {/* Tab Toggle - Playful Pill */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8, marginBottom: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
              {[['signin', 'Log In'], ['signup', 'Sign Up']].map(([val, label]) => (
                <div key={val} style={{ flex: 1, position: 'relative' }}>
                  {tab === val && (
                    <motion.div layoutId="auth-tab-bg" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} style={{ position: 'absolute', inset: 0, background: 'var(--cyan)', borderRadius: 16, boxShadow: '0 4px 15px rgba(0,245,255,0.3)' }} />
                  )}
                  <button onClick={() => { setTab(val); setError(''); setMessage(''); }}
                    style={{
                      position: 'relative', zIndex: 1, width: '100%', padding: '14px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', background: 'transparent',
                      color: tab === val ? '#000' : 'var(--text-muted)', transition: 'color 0.2s',
                    }}>
                    {label}
                  </button>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid rgba(0,245,255,0.4)', borderRadius: 16, padding: '16px', fontSize: '0.95rem', color: 'var(--cyan)', marginBottom: 24, fontWeight: 600 }}>
                  {message}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'rgba(255,68,102,0.1)', border: '2px solid rgba(255,68,102,0.4)', borderRadius: 16, padding: '16px', fontSize: '0.95rem', color: '#ff4466', marginBottom: 24, fontWeight: 600 }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="popLayout">
                {tab === 'signup' && (
                  <motion.div key="name" variants={formItemVariant} initial="hidden" animate="visible" exit="exit" className="input-wrap" style={{ marginBottom: 24 }}>
                    <label className="input-label" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>Player Name</label>
                    <input className="input-field" type="text" placeholder="YourQuestName" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: 16, fontSize: '1rem', fontWeight: 500 }} />
                  </motion.div>
                )}

                <motion.div key="email" variants={formItemVariant} initial="hidden" animate="visible" exit="exit" className="input-wrap" style={{ marginBottom: 24 }}>
                  <label className="input-label" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>Email Address</label>
                  <input className="input-field" type="email" placeholder="seeker@mail.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: 16, fontSize: '1rem', fontWeight: 500 }} />
                </motion.div>

                <motion.div key="password" variants={formItemVariant} initial="hidden" animate="visible" exit="exit" className="input-wrap" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="input-label" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>Password</label>
                    {tab === 'signin' && (
                      <motion.a whileHover={{ color: 'var(--cyan)' }} href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'none' }}>Forgot code?</motion.a>
                    )}
                  </div>
                  <input className="input-field" type="password" placeholder="••••••••" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: 16, fontSize: '1rem', fontWeight: 500 }} />
                </motion.div>

                {tab === 'signup' && (
                  <motion.div key="confirm" variants={formItemVariant} initial="hidden" animate="visible" exit="exit" className="input-wrap" style={{ marginBottom: 32 }}>
                    <label className="input-label" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>Confirm Key</label>
                    <input className="input-field" type="password" placeholder="••••••••" value={form.confirm}
                      onChange={e => setForm({ ...form, confirm: e.target.value })} style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: 16, fontSize: '1rem', fontWeight: 500 }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button layout whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0,245,255,0.4)' }} whileTap={{ scale: 0.97 }} type="submit" className="btn" disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: '1.15rem', marginTop:tab==='signin'?24:8, borderRadius: 16, background: 'var(--cyan)', color: '#000', fontWeight: 900, border: 'none', position: 'relative', overflow: 'hidden' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 22, height: 22, border: '3px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin-ring 0.6s linear infinite' }} />
                    {tab === 'signin' ? 'Authenticating...' : 'Generating Profile...'}
                  </span>
                ) : tab === 'signin' ? 'Log In / Mount' : 'Create Character ⚔️'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Autofill generic styling fix to prevent bg bleeding */
        input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 50px rgba(10, 15, 30, 0.45) inset;
            -webkit-text-fill-color: var(--text);
        }
      `}</style>
    </>
  );
}
