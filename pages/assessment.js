import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import useVoice from '../hooks/useVoice';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

export default function Assessment() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [topic, setTopic] = useState('Machine Learning');
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [resultProfile, setResultProfile] = useState(null);
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
    const u = localStorage.getItem('lq_user');
    if (!u) { router.push('/auth'); return; }
    setUser(JSON.parse(u));
    
    if (router.query.topic) {
      setTopic(decodeURIComponent(router.query.topic));
    }
  }, [router.query.topic, router]);

  // Once user & topic are resolved, trigger first fetch from AI
  useEffect(() => {
    if (!user) return; // wait until user is loaded

    const initiateChat = async () => {
      setTyping(true);
      try {
        const payload = { 
          messages: [], 
          topic, 
          psychProfile: user.psychProfile ? user.psychProfile.psychProfile : "Unknown" 
        };
        const res = await fetch('/api/assessment-chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
    
    // Only fetch if messages are empty to prevent refetch on remounts
    if (messages.length === 0) {
      initiateChat();
    }
  }, [user, topic]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const currentInput = input;
    
    const newMessages = [...messages, { role: 'user', text: currentInput }];
    setMessages(newMessages);
    setInput('');
    setTyping(true);
    
    const history = newMessages.map(m => ({ role: m.role === 'aria' ? 'assistant' : 'user', content: m.text }));
    
    try {
      const payload = { 
        messages: history, 
        topic, 
        psychProfile: user.psychProfile ? user.psychProfile.psychProfile : "Unknown" 
      };
      const res = await fetch('/api/assessment-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
              // Extract conversational text if present
              const conversationPart = reply.replace(jsonMatch[0], '').trim();
              if (conversationPart && conversationPart.length > 10) {
                 setMessages(m => [...m, { role: 'aria', text: conversationPart }]);
                 if (voiceMode) voice.speak(conversationPart);
              }
              setResultProfile(parsed);
              return;
            }
          }
          
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

  const handleViewRoadmap = () => router.push('/roadmap');

  if (!user) return null;

  return (
    <>
      <Head><title>ARIA Assessment — LearnQuest</title></Head>
      <Particles />
      <div className="orb orb-violet" style={{ top: '20%', left: '10%' }} />
      <Nav user={user} />

      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 24px 40px' }}>

        {/* ARIA Avatar Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, position: 'relative', zIndex: 1, transition: 'all 0.5s ease' }}>
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 12 }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px dashed rgba(0,245,255,0.4)', animation: 'spin-ring 8s linear infinite' }} />
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid rgba(123,47,255,0.3)' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #1a2340, #090e1c)', border: '2px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-cyan)' }}>
              <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
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
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--cyan)', letterSpacing: '0.05em' }}>ARIA Assessment Area</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Topic: {topic}</div>
        </div>

        {/* CHAT INTERFACE */}
        {!resultProfile && (
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
            
            {/* Messages Container */}
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

            {/* Input Container */}
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
                placeholder={voice.isListening ? '🔴 Listening...' : 'Type your answer to ARIA...'}
                style={{
                  flex: 1, background: 'var(--surface)',
                  border: `1px solid ${voice.isListening ? 'rgba(255,50,50,0.4)' : 'rgba(0,245,255,0.2)'}`,
                  borderRadius: 999, padding: '14px 20px', color: 'var(--text)', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                disabled={typing || voice.isListening}
                onFocus={e => { if (!voice.isListening) e.target.style.borderColor = 'var(--cyan)'; }}
                onBlur={e => { if (!voice.isListening) e.target.style.borderColor = 'rgba(0,245,255,0.2)'; }}
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
        {resultProfile && (
          <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, fontWeight: 700, animation: 'fadeIn 0.5s ease' }}>
              Assessment Complete // Roadmap Calibrated
            </div>

            <div className="glass card-glow" style={{ padding: '0', overflow: 'hidden', marginBottom: 32, animation: 'levelUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid rgba(0,245,255,0.3)' }}>
              {/* Header Visual */}
              <div style={{ background: 'linear-gradient(135deg, rgba(123,47,255,0.2) 0%, rgba(0,245,255,0.1) 100%)', padding: '40px 20px', borderBottom: '1px solid rgba(0,245,255,0.15)', position: 'relative' }}>
                <div style={{ fontSize: '4.5rem', marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.4))' }}>🧠</div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2.2rem', color: '#fff', marginBottom: 8, textShadow: '0 0 30px rgba(0,245,255,0.5)' }}>
                  Level: {resultProfile.tier}
                </h2>
                <div style={{ fontSize: '1rem', color: 'var(--cyan)', opacity: 0.9, letterSpacing: '0.05em' }}>{resultProfile.profileLabel} // {topic}</div>
                <div style={{ width: 100, height: 2, background: 'var(--cyan)', margin: '16px auto', borderRadius: 99 }} />
              </div>

              {/* Cognitive Breakdown */}
              <div style={{ padding: '30px 40px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, opacity: 0.8 }}>Knowledge Verification</div>
                <p style={{ color: 'var(--text)', lineHeight: 1.8, marginBottom: 28, fontSize: '1.05rem', fontWeight: 400 }}>
                  {resultProfile.desc}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 30 }}>
                  {[
                    { label: 'Calculated Tier', val: resultProfile.tier, icon: '⚡' },
                    { label: 'Subject Aura', val: topic, icon: '🌫️' },
                    { label: 'Total Nodes', val: '30 Roadmap Units', icon: '📍' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(0,245,255,0.05)', padding: '20px', borderRadius: 16, border: '1px solid rgba(0,245,255,0.15)', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,245,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📍</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--cyan)' }}>Initialization Point:</strong> spwaning your local neural roadmap at <strong>Node #{resultProfile.tier === 'Advanced' ? '10' : resultProfile.tier === 'Intermediate' ? '5' : '1'}</strong> based on your proficiency.
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary pulse-ringPulse" onClick={handleViewRoadmap} 
              style={{ padding: '20px 60px', fontSize: '1.2rem', borderRadius: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: 'var(--glow-cyan)' }}>
              Open My Personalized Roadmap →
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
