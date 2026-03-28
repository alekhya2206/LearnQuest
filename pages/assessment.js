import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { ARIA_QUESTIONS, ARIA_PROFILES } from '../data/content';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Assessment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); // 0 = intro, 1-7 = questions, 8 = result
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState('Machine Learning');
  const [typing, setTyping] = useState('');
  const [resultProfile] = useState(ARIA_PROFILES[0]);
  const [ariaAppear, setAriaAppear] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('lq_user');
    if (!u) { router.push('/auth'); return; }
    setUser(JSON.parse(u));
    if (router.query.topic) setTopic(decodeURIComponent(router.query.topic));
    setTimeout(() => setAriaAppear(true), 400);
    // Typewriter for intro
    const msg = `Hello! I'm ARIA — your Adaptive Roadmap Intelligence Agent. Before I build your personalized ${router.query.topic ? decodeURIComponent(router.query.topic) : 'Machine Learning'} roadmap, I need to understand how your mind works. This will take about 2 minutes.`;
    let i = 0;
    const iv = setInterval(() => {
      setTyping(msg.slice(0, i++));
      if (i > msg.length) { clearInterval(iv); }
    }, 22);
    return () => clearInterval(iv);
  }, [router.query.topic]);

  const currentQ = ARIA_QUESTIONS[step - 1];

  const handleSelect = (idx) => setSelected(idx);

  const handleNext = () => {
    if (step === 0) { setStep(1); setSelected(null); return; }
    if (selected === null) return;
    setAnswers({ ...answers, [step]: selected });
    setSelected(null);
    if (step >= ARIA_QUESTIONS.length) setStep(step + 1); // result
    else setStep(step + 1);
  };

  const handleViewRoadmap = () => router.push('/roadmap');

  if (!user) return null;

  return (
    <>
      <Head><title>AI Assessment — LearnQuest</title></Head>
      <Particles />
      <div className="orb orb-violet" style={{ top: '20%', left: '10%' }} />
      <Nav user={user} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 40px' }}>

        {/* Progress Bar (questions only) */}
        {step > 0 && step <= ARIA_QUESTIONS.length && (
          <div style={{ width: '100%', maxWidth: 700, marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Question {step} of {ARIA_QUESTIONS.length}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--cyan)', fontWeight: 600 }}>{Math.round((step / ARIA_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="xp-bar-track" style={{ height: 6 }}>
              <div className="xp-bar-fill" style={{ width: `${(step / ARIA_QUESTIONS.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* ARIA Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, position: 'relative', zIndex: 1, opacity: ariaAppear ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 12 }}>
            {/* Rotating ring */}
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px dashed rgba(0,245,255,0.4)', animation: 'spin-ring 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid rgba(123,47,255,0.3)' }} />
            {/* Avatar core */}
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #1a2340, #090e1c)', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-cyan)' }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="20" r="10" fill="none" stroke="#00F5FF" strokeWidth="1.5"/>
                <circle cx="28" cy="20" r="4" fill="#00F5FF" opacity="0.8"/>
                <circle cx="16" cy="36" r="6" fill="none" stroke="#7B2FFF" strokeWidth="1.5"/>
                <circle cx="40" cy="36" r="6" fill="none" stroke="#7B2FFF" strokeWidth="1.5"/>
                <line x1="28" y1="30" x2="28" y2="50" stroke="#00F5FF" strokeWidth="1" opacity="0.5"/>
                <line x1="28" y1="38" x2="16" y2="36" stroke="#00F5FF" strokeWidth="1" opacity="0.3"/>
                <line x1="28" y1="38" x2="40" y2="36" stroke="#00F5FF" strokeWidth="1" opacity="0.3"/>
                <circle cx="28" cy="50" r="3" fill="#7B2FFF"/>
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--cyan)', letterSpacing: '0.05em' }}>ARIA</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Adaptive Roadmap Intelligence Agent</div>
        </div>

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div style={{ width: '100%', maxWidth: 620, position: 'relative', zIndex: 1 }}>
            <div className="glass" style={{ padding: 32, marginBottom: 28, borderLeft: '3px solid var(--cyan)', borderRadius: '4px 12px 12px 12px' }}>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text)' }}>
                {typing}<span className="blink" style={{ color: 'var(--cyan)' }}>|</span>
              </p>
              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(0,245,255,0.05)', borderRadius: 8, display: 'flex', gap: 16 }}>
                {['7 Questions', '~2 Minutes', 'Fully Personalized'].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--cyan)' }}>
                    <span>✦</span> {t}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost-violet btn-sm" onClick={() => router.push('/roadmap')}>Skip Assessment</button>
              <button className="btn btn-primary btn-lg" onClick={handleNext}>Begin Assessment →</button>
            </div>
          </div>
        )}

        {/* STEPS 1-7: Questions */}
        {step >= 1 && step <= ARIA_QUESTIONS.length && currentQ && (
          <div style={{ width: '100%', maxWidth: 680, position: 'relative', zIndex: 1 }}>
            {/* Question bubble */}
            <div className="glass" style={{ padding: '24px 28px', marginBottom: 28, borderLeft: '3px solid var(--cyan)', borderRadius: '4px 12px 12px 12px' }}>
              <p style={{ fontSize: '1.15rem', fontFamily: 'var(--font-head)', fontWeight: 600 }}>{currentQ.question}</p>
            </div>

            {/* Answer options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {currentQ.options.map((opt, i) => (
                <div key={i}
                  onClick={() => handleSelect(i)}
                  style={{
                    padding: '20px 20px', borderRadius: 12, cursor: 'pointer',
                    background: selected === i ? 'rgba(0,245,255,0.08)' : 'var(--surface-high)',
                    border: `1px solid ${selected === i ? 'var(--cyan)' : 'rgba(0,245,255,0.08)'}`,
                    boxShadow: selected === i ? 'var(--glow-cyan-sm)' : 'none',
                    transition: 'all 0.2s', position: 'relative',
                  }}
                  onMouseEnter={e => { if (selected !== i) { e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)'; } }}
                  onMouseLeave={e => { if (selected !== i) { e.currentTarget.style.borderColor = 'rgba(0,245,255,0.08)'; } }}>
                  {selected === i && (
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#060b18', fontWeight: 700 }}>✓</div>
                  )}
                  <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{opt.icon}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, color: selected === i ? 'var(--cyan)' : 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ghost-violet btn-sm" onClick={() => router.push('/dashboard')}>Exit</button>
              <button className="btn btn-primary btn-lg" onClick={handleNext} disabled={selected === null}>
                {step < ARIA_QUESTIONS.length ? 'Next Question →' : 'See My Profile →'}
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step > ARIA_QUESTIONS.length && (
          <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Assessment Complete</div>

            <div className="glass card-glow" style={{ padding: 40, marginBottom: 28, animation: 'levelUp 0.5s ease' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧠</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cyan)', marginBottom: 12 }}>
                {resultProfile.label}
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>{resultProfile.desc}</p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { label: 'Tier', val: resultProfile.tier, color: 'var(--cyan)' },
                  { label: 'Topic', val: topic, color: 'var(--violet)' },
                  { label: 'Levels', val: '30 nodes', color: 'var(--text-muted)' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '8px 16px', background: 'var(--surface-bright)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                Spawning you at Level 5 (Intermediate start point)
              </div>
            </div>

            <button className="btn btn-primary btn-lg pulse-ring" onClick={handleViewRoadmap} style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
              🗺️ View My Roadmap →
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes levelUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}
