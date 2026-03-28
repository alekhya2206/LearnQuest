import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { supabase } from '../lib/supabase';
import useVoice from '../hooks/useVoice';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [psychProfile, setPsychProfile] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  
  const bottomRef = useRef(null);
  const voice = useVoice();

  // Pipe voice transcript into the input field
  useEffect(() => {
    if (voice.transcript) setInput(voice.transcript);
  }, [voice.transcript]);

  // Auto-send when user stops speaking in voice mode
  useEffect(() => {
    if (voiceMode && !voice.isListening && voice.transcript.trim()) {
      const timer = setTimeout(() => {
        send();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [voice.isListening, voiceMode]);

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
           if (voiceMode) voice.speak(data.reply);
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
        setTyping(false);
        const reply = data.reply;
        
        // ROBUST JSON EXTRACTION (Senior UI/UX Logic)
        try {
          const jsonMatch = reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && parsed.type === 'result') {
              // Extract non-JSON text if AI included conversational parts
              const conversationPart = reply.replace(jsonMatch[0], '').trim();
              if (conversationPart && conversationPart.length > 10) {
                 setMessages(m => [...m, { role: 'aria', text: conversationPart }]);
                 if (voiceMode) voice.speak(conversationPart);
              }
              
              await saveProfile(parsed);
              return; // Exit early as result is handled
            }
          }
          
          // Regular conversation path
          setMessages(m => [...m, { role: 'aria', text: reply }]);
          if (voiceMode) voice.speak(reply);
        } catch(e) {
          console.error("Parse Error:", e);
          setMessages(m => [...m, { role: 'aria', text: reply }]);
          if (voiceMode) voice.speak(reply);
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
            
            {/* Voice Mode Toggle */}
            <div style={{ padding: '10px 24px 0', display: 'flex', justifyContent: 'flex-end' }}>
              {voice.supported && (
                <button onClick={() => { setVoiceMode(!voiceMode); if (voice.isSpeaking) voice.stopSpeaking(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 999, fontSize: '0.78rem', fontWeight: 600,
                    background: voiceMode ? 'rgba(0,245,255,0.15)' : 'transparent',
                    border: `1px solid ${voiceMode ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                    color: voiceMode ? 'var(--cyan)' : 'var(--text-dim)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {voiceMode ? '🎙️ Voice On' : '🔇 Voice Off'}
                </button>
              )}
            </div>
            
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
                  {m.role === 'aria' && voice.supported && (
                    <button onClick={() => voice.isSpeaking ? voice.stopSpeaking() : voice.speak(m.text)}
                      style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: voice.isSpeaking ? 'var(--cyan)' : 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}>
                      {voice.isSpeaking ? '🔊 Speaking...' : '🔈 Listen'}
                    </button>
                  )}
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

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,245,255,0.1)', display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Mic Button */}
              {voice.supported && (
                <button
                  onClick={() => voice.isListening ? voice.stopListening() : voice.startListening()}
                  disabled={typing}
                  style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: voice.isListening ? 'rgba(255,50,50,0.25)' : 'var(--surface-bright)',
                    border: `2px solid ${voice.isListening ? '#ff4444' : 'rgba(0,245,255,0.2)'}`,
                    cursor: typing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', transition: 'all 0.3s ease',
                    boxShadow: voice.isListening ? '0 0 20px rgba(255,50,50,0.4)' : 'none',
                    animation: voice.isListening ? 'pulse-ring-red 1.5s ease-in-out infinite' : 'none',
                    opacity: typing ? 0.4 : 1
                  }}>
                  {voice.isListening ? '⏹️' : '🎤'}
                </button>
              )}
              <input
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={voice.isListening ? '🔴 Listening...' : 'Talk to ARIA...'}
                style={{
                  flex: 1, background: 'var(--surface)',
                  border: `1px solid ${voice.isListening ? 'rgba(255,50,50,0.4)' : 'rgba(0,245,255,0.2)'}`,
                  borderRadius: 999, padding: '14px 20px', color: 'var(--text)', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                disabled={typing || voice.isListening}
              />
              <button onClick={send} disabled={typing || voice.isListening}
                style={{
                  width: 50, height: 50, borderRadius: '50%', background: 'var(--cyan)',
                  border: 'none', cursor: typing ? 'default' : 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.2rem', color: '#060b18',
                  boxShadow: 'var(--glow-cyan-sm)', flexShrink: 0, opacity: (typing || voice.isListening) ? 0.6 : 1
                }}>→</button>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {psychProfile && (
          <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 700, animation: 'fadeIn 0.5s ease' }}>
              Neural Sync Complete // Profile Calibrated
            </div>

            <div className="glass card-glow" style={{ padding: '0', overflow: 'hidden', marginBottom: 32, animation: 'levelUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid rgba(0,245,255,0.3)' }}>
              {/* Header Visual */}
              <div style={{ background: 'linear-gradient(135deg, rgba(123,47,255,0.2) 0%, rgba(0,245,255,0.1) 100%)', padding: '40px 20px', borderBottom: '1px solid rgba(0,245,255,0.15)', position: 'relative' }}>
                <div style={{ fontSize: '4.5rem', marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.4))' }}>🧬</div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2.2rem', color: '#fff', marginBottom: 8, textShadow: '0 0 30px rgba(0,245,255,0.5)' }}>
                  {psychProfile.psychProfile}
                </h2>
                <div style={{ width: 100, height: 2, background: 'var(--cyan)', margin: '12px auto', borderRadius: 99 }} />
              </div>

              {/* Cognitive Breakdown */}
              <div style={{ padding: '30px 40px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, opacity: 0.8 }}>Cognitive Summary</div>
                <p style={{ color: 'var(--text)', lineHeight: 1.8, marginBottom: 28, fontSize: '1.05rem', fontWeight: 400 }}>
                  {psychProfile.desc}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, opacity: 0.8 }}>Neuro-Traits</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30 }}>
                  {(psychProfile.traits || ["Analytical", "Intuitive", "Reflexive"]).map((trait, i) => (
                    <div key={i} style={{ 
                      background: 'rgba(0,245,255,0.08)', 
                      color: 'var(--cyan)', 
                      padding: '8px 16px', 
                      borderRadius: 12, 
                      fontSize: '0.88rem', 
                      fontWeight: 600, 
                      border: '1px solid rgba(0,245,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
                      {trait}
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(123,47,255,0.05)', padding: '20px', borderRadius: 16, border: '1px solid rgba(123,47,255,0.15)', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📡</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--violet)' }}>ARIA Optimization:</strong> Every roadmap node from this point forward will pivot to your unique learning DNA.
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary pulse-ring" onClick={handleEnterDashboard} 
              style={{ padding: '20px 60px', fontSize: '1.2rem', borderRadius: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: 'var(--glow-cyan)' }}>
              Access Dashboard // Initialize Protocol
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes levelUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-ring-red { 0%,100% { box-shadow: 0 0 0 0 rgba(255,68,68,0.5); } 50% { box-shadow: 0 0 0 10px rgba(255,68,68,0); } }
      `}</style>
    </>
  );
}
