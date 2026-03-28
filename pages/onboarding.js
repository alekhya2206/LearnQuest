import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { supabase } from '../lib/supabase';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [psychProfile, setPsychProfile] = useState(null);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const u = localStorage.getItem('lq_user');
      if (!u && !session) { router.push('/auth'); return; }
      const lqUser = u ? JSON.parse(u) : {};
      
      // If already onboarded, send to dashboard unless forced here
      if (lqUser.onboarded && !router.query.force) {
        router.push('/dashboard');
        return;
      }
      
      setUser(lqUser);
    };
    init();
  }, [router]);

  // Initial greeting
  useEffect(() => {
    if (!user) return;

    const initiateChat = async () => {
      setTyping(true);
      try {
        const res = await fetch('/api/onboarding-chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] })
        });
        const data = await res.json();
        setTyping(false);
        if (res.ok) {
           setMessages([{ role: 'aria', text: data.reply }]);
        } else {
           setMessages([{ role: 'aria', text: 'Error connecting to ARIA 😔 ' + data.error }]);
        }
      } catch (e) {
        setTyping(false);
        setMessages([{ role: 'aria', text: "Network error..." }]);
      }
    };
    
    if (messages.length === 0) initiateChat();
  }, [user]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const saveProfile = async (profileData) => {
    setPsychProfile(profileData);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase.from('profiles').update({
        onboarded: true,
        psych_profile: JSON.stringify(profileData)
      }).eq('id', session.user.id);
    }
    
    // Update local storage
    if (user) {
      const updatedUser = { ...user, onboarded: true, psychProfile: profileData };
      localStorage.setItem('lq_user', JSON.stringify(updatedUser));
    }
  };

  const send = async () => {
    if (!input.trim() || typing) return;
    const currentInput = input;
    
    const newMessages = [...messages, { role: 'user', text: currentInput }];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    
    const history = newMessages.map(m => ({ role: m.role === 'aria' ? 'assistant' : 'user', content: m.text }));
    
    try {
      const res = await fetch('/api/onboarding-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      setTyping(false);
      
      if (res.ok) {
        try {
          let rawText = data.reply.trim();
          if (rawText.startsWith('```json')) rawText = rawText.slice(7, -3).trim();
          else if (rawText.startsWith('```')) rawText = rawText.slice(3, -3).trim();
          
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.type === 'result') {
            await saveProfile(parsed);
          } else {
             setMessages(m => [...m, { role: 'aria', text: data.reply }]);
          }
        } catch(e) {
          setMessages(m => [...m, { role: 'aria', text: data.reply }]);
        }
      } else {
        setMessages(m => [...m, { role: 'aria', text: 'Error connecting to ARIA 😔 ' + data.error }]);
      }
    } catch(e) {
       setTyping(false);
       setMessages(m => [...m, { role: 'aria', text: 'Network connection lost...' }]);
    }
  };

  const handleEnterDashboard = () => router.push('/dashboard');

  if (!user) return null;

  return (
    <>
      <Head><title>Initialize Profile — LearnQuest</title></Head>
      <Particles />
      <div className="orb orb-violet" style={{ top: '20%', left: '10%' }} />
      <Nav user={user} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 40px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, position: 'relative', zIndex: 1, transition: 'all 0.5s ease' }}>
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 12 }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px dashed rgba(0,245,255,0.4)', animation: 'spin-ring 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid rgba(123,47,255,0.3)' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #1a2340, #090e1c)', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-cyan)' }}>
              <span style={{ fontSize: '2rem' }}>🧠</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.2rem', color: '#fff', letterSpacing: '0.05em' }}>Neural Link Initialization</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Synchronizing Cognitive Profile...</div>
        </div>

        {/* CHAT INTERFACE */}
        {!psychProfile && (
          <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, 
               background: 'rgba(13,19,35,0.85)', backdropFilter: 'blur(24px)',
               border: '1px solid rgba(0,245,255,0.2)', borderRadius: 16, height: 500,
               boxShadow: '0 20px 60px rgba(0,0,0,0.5), var(--glow-cyan-sm)' }}>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'aria' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%', padding: '12px 18px',
                  borderRadius: m.role === 'aria' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  background: m.role === 'aria' ? 'var(--surface-bright)' : 'rgba(123,47,255,0.25)',
                  border: m.role === 'aria' ? '1px solid rgba(0,245,255,0.12)' : '1px solid rgba(123,47,255,0.3)',
                  fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap'
                }}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, padding: '16px 20px', background: 'var(--surface-bright)', borderRadius: '4px 16px 16px 16px', border: '1px solid rgba(0,245,255,0.12)' }}>
                  {[0.1, 0.2, 0.3].map((d, i) => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: `bounce 0.8s ${d}s ease-in-out infinite` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,245,255,0.1)', display: 'flex', gap: 12 }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Talk to ARIA..."
                style={{
                  flex: 1, background: 'var(--surface)', border: '1px solid rgba(0,245,255,0.2)',
                  borderRadius: 999, padding: '14px 20px', color: 'var(--text)', fontSize: '1rem', outline: 'none'
                }}
                disabled={typing}
              />
              <button onClick={send} disabled={typing}
                style={{
                  width: 50, height: 50, borderRadius: '50%', background: 'var(--cyan)',
                  border: 'none', cursor: typing ? 'default' : 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.2rem', color: '#060b18',
                  boxShadow: 'var(--glow-cyan-sm)', flexShrink: 0, opacity: typing ? 0.6 : 1
                }}>→</button>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {psychProfile && (
          <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Profile Calibrated</div>

            <div className="glass card-glow" style={{ padding: 40, marginBottom: 28, animation: 'levelUp 0.5s ease', borderColor: 'var(--cyan)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🧬</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--cyan)', marginBottom: 8 }}>
                {psychProfile.psychProfile}
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontSize: '1.05rem' }}>{psychProfile.desc}</p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                {psychProfile.traits?.map((trait, i) => (
                   <span key={i} style={{ background: 'rgba(123,47,255,0.2)', color: '#d0b0ff', padding: '6px 14px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(123,47,255,0.3)' }}>
                     {trait}
                   </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.85rem', color: 'var(--cyan)', background: 'rgba(0,245,255,0.1)', padding: '10px 16px', borderRadius: 12, border: '1px dashed rgba(0,245,255,0.3)' }}>
                <span>ARIA is now tuned exactly to your brainwaves. Every course will adapt to this style before you even start.</span>
              </div>
            </div>

            <button className="btn btn-primary pulse-ring" onClick={handleEnterDashboard} style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: 999, fontWeight: 800 }}>
              Enter the Dashboard →
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes levelUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
}
