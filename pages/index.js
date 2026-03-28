import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import Nav from '../components/Nav';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

const features = [
  { icon: '🧠', color: '#00F5FF', title: 'Adaptive AI Roadmaps', desc: 'Personalized learning paths generated from your cognitive profile and goals.' },
  { icon: '⚡', color: '#7B2FFF', title: 'Gamified XP & Levels', desc: 'Earn XP, level up, unlock badges, and maintain daily streaks.' },
  { icon: '🗝️', color: '#FFD700', title: 'Hidden Quest Nodes', desc: 'Mysterious unlockable nodes with rare meta-skills and cross-domain insights.' },
  { icon: '🤖', color: '#00F5FF', title: 'ARIA AI Tutor', desc: 'Your always-on AI companion — explains, analogizes, and guides in real-time.' },
  { icon: '🎬', color: '#7B2FFF', title: 'Manim Video Generator', desc: 'AI-generated mathematical animations for complex visual explanations.' },
  { icon: '📚', color: '#00F5FF', title: 'Smart Flashcard Engine', desc: 'Spaced-repetition flashcards generated per level with progress tracking.' },
];

const steps = [
  { n: '01', title: 'Search Your Topic', desc: 'Type any skill — ML, Finance, Design, Blockchain. ARIA searches thousands of learning paths.' },
  { n: '02', title: 'Take the AI Assessment', desc: 'ARIA asks 7 cognitive questions to understand your learning style and experience level.' },
  { n: '03', title: 'Get Your Roadmap', desc: 'Receive a personalized, gamified roadmap placing you exactly where you need to start.' },
  { n: '04', title: 'Learn & Level Up', desc: 'Unlock levels, defeat hidden quests, earn XP, and track your progress to mastery.' },
];

const stats = [
  { num: '10,000+', label: 'Quests Completed' },
  { num: '94%', label: 'Reach Expert Level' },
  { num: '50+', label: 'Learning Domains' },
];

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const textVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } }
};

// Character reveal animation for Codédex style typography
const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { delay: 0.1, staggerChildren: 0.05 }
  }
};
const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } }
};

export default function Landing() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const dashY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  return (
    <>
      <Head>
        <title>LearnQuest — AI-Powered Gamified Learning</title>
        <meta name="description" content="Master any skill with AI-powered adaptive learning, gamified roadmaps, and intelligent tutoring." />
      </Head>
      
      <Particles />
      {/* Decorative Orbs with slower, more deliberate floating */}
      <motion.div animate={{ y: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="orb orb-cyan" style={{ top: '-10%', right: '-5%' }} />
      <motion.div animate={{ y: [0, 40, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="orb orb-violet" style={{ bottom: '-10%', left: '-5%' }} />
      
      <Nav />

      {/* HERO SECTION */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 0 60px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'center' }}>
          
          <motion.div style={{ y: heroY }} initial="hidden" animate="visible" variants={staggerContainer} className="hero-content">
            <motion.div variants={popIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0, 245, 255, 0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 245, 255, 0.3)', borderRadius: 999, padding: '8px 20px', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: 24, fontWeight: 700, boxShadow: '0 4px 15px rgba(0,245,255,0.1)' }}>
              <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)' }} />
              Welcome to the Future of Learning
            </motion.div>
            
            {/* Codédex-inspired bouncy text reveal */}
            <motion.h1 variants={sentence} initial="hidden" animate="visible" style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 28 }}>
              {["Master.", " Any.", " Skill."].map((word, i) => (
                 <span key={word + i} style={{ display: 'inline-block', marginRight: i !== 2 ? '12px' : 0 }}>
                   {word.split('').map((char, index) => (
                      <motion.span key={char + "-" + index} variants={letter} style={{ display: 'inline-block' }}>
                        {char}
                      </motion.span>
                   ))}
                 </span>
              ))}
              <br/>
              <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.3)' }}>Your. Quest.</span>
            </motion.h1>

            <motion.p variants={textVariant} style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 40, maxWidth: 500 }}>
              Embark on an epic journey. Turn mundane subjects into thrilling adventures with AI-powered, gamified roadmaps personalized entirely to your brain.
            </motion.p>
            
            <motion.div variants={textVariant} style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.05, y: -4, boxShadow: '0 15px 30px rgba(0,245,255,0.3)' }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-lg glass" onClick={() => router.push('/auth?tab=signup')} style={{ fontSize: '1.1rem', padding: '16px 40px', background: 'rgba(0, 245, 255, 0.8)', border: '2px solid var(--cyan)', color: '#000', fontWeight: 800, borderRadius: '16px' }}>
                🚀 Start Your Quest
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, y: -4, borderColor: 'var(--violet)', boxShadow: '0 15px 30px rgba(123,47,255,0.2)' }} whileTap={{ scale: 0.95 }} className="btn btn-ghost-violet btn-lg glass" onClick={() => router.push('/auth')} style={{ borderRadius: '16px', border: '2px solid rgba(123,47,255,0.4)' }}>
                Sign In →
              </motion.button>
            </motion.div>
            
            <motion.div variants={staggerContainer} style={{ display: 'flex', gap: 40, marginTop: 56 }}>
              {stats.map(s => (
                <motion.div variants={popIn} key={s.label} whileHover={{ y: -5 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cyan)', textShadow: '0 0 15px rgba(0,245,255,0.3)' }}>{s.num}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Interactive Hero Graphic */}
          <motion.div style={{ y: dashY }} initial={{ opacity: 0, rotate: -5, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.3 }} className="animate-float">
            <motion.div whileHover={{ rotate: 2, scale: 1.02 }} className="glass card-glow" style={{ padding: 32, background: 'linear-gradient(145deg, rgba(13,19,35,0.7), rgba(6,11,24,0.9))', backdropFilter: 'blur(40px)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{ flex: 1, height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>https://learnquest.ai/roadmap</span>
                </div>
              </div>
              
              <div style={{ position: 'relative', height: 220, overflow: 'hidden', borderRadius: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Nodes with bouncy animations */}
                {[
                  { x: 30, y: 30, done: true, label: 'L1', delay: 0.5 },
                  { x: 120, y: 70, done: true, label: 'L2', delay: 0.6 },
                  { x: 210, y: 30, done: true, label: 'L3', delay: 0.7 },
                  { x: 300, y: 90, active: true, label: 'L5', delay: 0.8 },
                  { x: 400, y: 40, label: 'L6', delay: 0.9 },
                  { x: 360, y: 150, hidden: true, label: '?', delay: 1.0 },
                ].map((n, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: n.delay, bounce: 0.6 }} style={{
                    position: 'absolute', left: n.x, top: n.y,
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-head)', zIndex: 2,
                    background: n.done ? 'rgba(0,245,255,0.2)' : n.active ? 'var(--cyan)' : n.hidden ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${n.done ? 'var(--cyan)' : n.active ? '#fff' : n.hidden ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                    color: n.done ? 'var(--cyan)' : n.active ? '#000' : n.hidden ? 'var(--gold)' : 'var(--text-dim)',
                    boxShadow: n.active ? '0 0 20px var(--cyan)' : n.hidden ? 'var(--glow-gold)' : 'none',
                    animation: n.hidden ? 'gold-shimmer 2s infinite' : 'none',
                  }}>
                    {n.active && <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ position: 'absolute', inset: -4, border: '2px solid var(--cyan)', borderRadius: '50%' }} />}
                    {n.done ? '✓' : n.label}
                  </motion.div>
                ))}
                
                {/* SVG connection lines with drawing animation */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} d="M 52 52 L 120 90 L 210 52 L 300 110" stroke="rgba(0,245,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 2.5 }} d="M 322 110 L 400 62" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 6" fill="none" />
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 2.5 }} d="M 322 110 L 360 172" stroke="rgba(255,215,0,0.4)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                </svg>
              </div>
              
              <div style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(0,245,255,0.1)', border: '2px solid var(--cyan)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🤖</div>
                <div style={{ flex: 1 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                     <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Machine Learning <span style={{ color: 'var(--text)' }}>Lvl 5</span></span>
                     <span style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 800 }}>2,450 XP</span>
                   </div>
                   <div className="xp-bar-track" style={{ height: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', borderRadius: 4 }}>
                     <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }} className="xp-bar-fill" style={{ height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--violet))', borderRadius: 4 }} />
                   </div>
                </div>
              </div>
            </motion.div>
            
            {/* Playful Floating Badge */}
            <motion.div animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: -20, right: -20, background: 'linear-gradient(135deg, #FFD700, #FFA500)', padding: '10px 20px', borderRadius: '16px', color: '#000', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(255,215,0,0.3)', border: '2px solid #FFF', transformOrigin: 'center' }}>
              🔥 7 Day Streak!
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE SEPARATOR */}
      <div style={{ width: '100%', overflow: 'hidden', background: 'var(--cyan)', padding: '16px 0', borderTop: '2px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, ease: 'linear', duration: 20 }} style={{ display: 'flex', whiteSpace: 'nowrap', gap: 40, color: '#000', fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase' }}>
          {[...Array(10)].map((_, i) => <span key={i}>Learn Faster ⚡ Level Up 🕹️ Master Anything 🚀</span>)}
        </motion.div>
      </div>

      {/* FEATURES - Interactive Grid */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} id="features" className="section" style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <motion.div variants={textVariant} style={{ display: 'inline-block', background: 'rgba(123,47,255,0.1)', color: 'var(--violet)', padding: '6px 16px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', border: '1px solid rgba(123,47,255,0.3)', marginBottom: 20 }}>
              POWERUPS & ABILITIES
            </motion.div>
            <motion.h2 variants={textVariant} style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 20 }}>Your Toolkit To Master Anything</motion.h2>
            <motion.p variants={textVariant} style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>Six synergistic systems combining AI intelligence with game design, designed to keep you addicted to learning.</motion.p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {features.map((f, i) => (
              <motion.div variants={popIn} key={i} className="card glass glass-hover-effect" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: 32, border: '2px solid rgba(255,255,255,0.05)' }}
                whileHover={{ scale: 1.05, y: -10, borderColor: f.color, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '20px', background: `${f.color}22`, border: `1px solid ${f.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 24 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', color: '#fff', marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* HOW IT WORKS - Step by Step Journey */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} id="how" className="section" style={{ position: 'relative', zIndex: 1, background: 'rgba(6,11,24,0.6)', backdropFilter: 'blur(40px)', borderTop: '2px solid rgba(255,255,255,0.05)', borderBottom: '2px solid rgba(255,255,255,0.05)', padding: '120px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.h2 variants={popIn} style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2.5rem', marginBottom: 16 }}>From Noob to Master</motion.h2>
          <motion.p variants={popIn} style={{ color: 'var(--text-muted)', marginBottom: 80, fontSize: '1.1rem' }}>Four heavily optimized steps. Zero friction.</motion.p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, position: 'relative', textAlign: 'left' }}>
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'backOut' }} style={{ position: 'absolute', top: 32, left: '12%', right: '12%', height: 4, background: 'linear-gradient(90deg, var(--cyan), var(--violet))', borderRadius: 2, zIndex: 0, transformOrigin: 'left' }} />
            
            {steps.map((s, i) => (
              <motion.div variants={popIn} key={i} style={{ position: 'relative', zIndex: 1 }} whileHover={{ y: -10 }}>
                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--surface-highest)', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '1.2rem', color: '#fff', marginBottom: 24, boxShadow: '0 10px 20px rgba(0,245,255,0.2)', transition: 'all 0.2s' }}>
                  {s.n}
                </motion.div>
                <div className="glass" style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, color: '#fff' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA BANNER - Pop out style */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={popIn} className="section" style={{ position: 'relative', zIndex: 1, padding: '120px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div whileHover={{ scale: 1.02 }} className="glass card-glow" style={{ padding: '80px 40px', maxWidth: 800, margin: '0 auto', background: 'linear-gradient(45deg, rgba(0,245,255,0.1), rgba(123,47,255,0.1))', backdropFilter: 'blur(40px)', borderRadius: '32px', border: '2px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: -200, left: -200, width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,245,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: 20, color: '#fff' }}>It's dangerous to go alone.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 48, fontSize: '1.15rem', maxWidth: 500, margin: '0 auto 48px' }}>Join the community of learners leveling up their intellect with entirely personalized AI roadmaps.</p>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px var(--cyan)' }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-lg" onClick={() => router.push('/auth?tab=signup')} style={{ fontSize: '1.2rem', padding: '18px 56px', background: 'var(--cyan)', color: '#000', fontWeight: 900, borderRadius: '999px', border: 'none' }}>
              Create Your Avatar →
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '2px solid rgba(255,255,255,0.05)', padding: '40px 0', background: 'rgba(6,11,24,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--text)', fontSize: '1.2rem' }}>
            Learn<span style={{ color: 'var(--cyan)' }}>Quest</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['Privacy', 'Terms', 'About', 'Discord'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
