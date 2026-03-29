import Head from 'next/head';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import Particles from '../components/Particles';
import ScalingSlidingCards from '../components/ScalingSlidingCards';
import { motion } from 'framer-motion';

export default function Explore() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lq_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  return (
    <div className="page" style={{ background: 'var(--bg-deep)', color: '#fff' }}>
      <Head>
        <title>Explore Dimensions | LearnQuest</title>
        <meta name="description" content="Level up your knowledge with our personalized pricing dimensions." />
      </Head>

      <Nav user={user} />
      <Particles />

      {/* Hero Content */}
      <section className="section" style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingBottom: 0 }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="chip chip-active" style={{ marginBottom: '1.5rem' }}>// ACCESS PROTOCOL: EXPANSION</span>
            <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
              Choose Your <span style={{ color: 'var(--cyan)' }}>Dimension.</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
               Unlock the full potential of your cognitive growth. Select a plan to begin your quest.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The New Scaling Sliding Cards Component */}
      <ScalingSlidingCards />

      {/* Additional Features Section - Tighter Spacing */}
      <section className="section" style={{ background: 'rgba(0,0,0,0.5)', position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Beyond the Plans</h2>
            <p style={{ color: 'var(--text-dim)' }}>Every dimension includes our core AI-powered engine.</p>
          </div>
          
          <div style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid', gap: '30px' }}>
            <div className="card glass">
              <div style={{ color: 'var(--cyan)', fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ marginBottom: '1rem' }}>ARIA Brain-Sync</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ARIA learns how you learn, remembering context across all modules and roadmaps.</p>
            </div>
            <div className="card glass">
              <div style={{ color: 'var(--violet)', fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ marginBottom: '1rem' }}>Dynamic Synthesis</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time generation of study materials using Llama 3.3 and Gemini 1.5 Pro models.</p>
            </div>
            <div className="card glass">
              <div style={{ color: 'var(--gold)', fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ marginBottom: '1rem' }}>XP Progression</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gamified XP and badge system synchronized with your learning milestones.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '60px 0', borderTop: '1px solid var(--outline)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <div className="container">
          <LogoIcon />
          <p style={{ marginTop: '1rem' }}>© 2026 LearnQuest Parallel. All dimensions reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .page {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 34 34" fill="none" style={{ filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.3))' }}>
      <polygon points="17,2 32,10 32,24 17,32 2,24 2,10" fill="none" stroke="#00F5FF" strokeWidth="1.5"/>
      <circle cx="17" cy="17" r="4" fill="#00F5FF"/>
    </svg>
  );
}
