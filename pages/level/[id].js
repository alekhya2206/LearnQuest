import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../../components/Nav';
import { LEVEL_CONTENT, FLASHCARDS, TUTOR_RESPONSES, ML_ROADMAP } from '../../data/content';
import useVoice from '../../hooks/useVoice';

const ConceptVideo = dynamic(() => import('../../components/ConceptVideo'), { ssr: false });

// ─── FLOATING CHAT WIDGET ─────────────────────────────────────────────────────
function FloatingChat({ topic }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'aria', text: `Hey! I'm ARIA 🤖 Ask me anything about ${topic}!` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const bottomRef = useRef(null);
  const voice = useVoice();

  // Pipe voice transcript into input
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

  const send = async (text) => {
    const msgType = typeof text === 'string' ? text : input;
    if (!msgType.trim()) return;
    const currentInput = msgType;
    setMessages(m => [...m, { role: 'user', text: currentInput }]);
    setInput('');
    setTyping(true);
    
    // Add context from past messages (skip the initial system/aria message)
    const history = messages.map(m => ({ role: m.role === 'aria' ? 'assistant' : 'user', content: m.text }));
    
    try {
      const res = await fetch('/api/chat', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content: currentInput }], topic: topic })
      });
      const data = await res.json();
      setTyping(false);
      if (res.ok) {
        setMessages(m => [...m, { role: 'aria', text: data.reply }]);
        if (voiceMode) voice.speak(data.reply);
      } else {
        setMessages(m => [...m, { role: 'aria', text: 'Error connecting to ARIA 😔 ' + data.error }]);
      }
    } catch(e) {
      setTyping(false);
      setMessages(m => [...m, { role: 'aria', text: 'Network connection lost...' }]);
    }
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const chips = ['Explain simply', 'Real analogy', 'Common mistakes', 'Quiz me'];

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%',
          background: open ? 'var(--violet)' : 'var(--cyan)',
          border: 'none', cursor: 'pointer',
          boxShadow: open ? 'var(--glow-violet)' : 'var(--glow-cyan)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', transition: 'all 0.3s',
          animation: open ? 'none' : 'pulse-ring 2.5s ease-in-out infinite',
        }}
        title="Chat with ARIA"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Unread dot */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 28, zIndex: 1000,
          width: 12, height: 12, borderRadius: '50%', background: '#00ff88',
          border: '2px solid var(--bg)', boxShadow: '0 0 8px #00ff88'
        }} />
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 999,
          width: 360, height: 480,
          background: 'rgba(13,19,35,0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,245,255,0.25)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), var(--glow-cyan-sm)',
          animation: 'slideUp 0.25s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid rgba(0,245,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,245,255,0.04)', borderRadius: '16px 16px 0 0'
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'radial-gradient(circle, #1a2340, #090e1c)',
              border: '1.5px solid var(--cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', boxShadow: 'var(--glow-cyan-sm)'
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--cyan)' }}>ARIA Tutor</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                Online · {topic}
              </div>
            </div>
            {/* Voice Mode Toggle */}
            {voice.supported && (
              <button onClick={() => { setVoiceMode(!voiceMode); if (voice.isSpeaking) voice.stopSpeaking(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 999, fontSize: '0.65rem', fontWeight: 600,
                  background: voiceMode ? 'rgba(0,245,255,0.15)' : 'transparent',
                  border: `1px solid ${voiceMode ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                  color: voiceMode ? 'var(--cyan)' : 'var(--text-dim)',
                  cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'center'
                }}>
                {voiceMode ? '🎙️ On' : '🔇 Off'}
              </button>
            )}
          </div>

          {/* Starter chips */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(0,245,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {chips.map((c, i) => (
              <button key={i} onClick={() => send(c)}
                style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--violet)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.borderColor = ''; }}>
                {c}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'aria' ? 'flex-start' : 'flex-end',
                maxWidth: '85%', padding: '9px 13px', borderRadius: m.role === 'aria' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: m.role === 'aria' ? 'var(--surface-bright)' : 'rgba(123,47,255,0.25)',
                border: m.role === 'aria' ? '1px solid rgba(0,245,255,0.12)' : '1px solid rgba(123,47,255,0.3)',
                fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--text)',
              }}>
                {m.text}
                {m.role === 'aria' && voice.supported && (
                  <div style={{ marginTop: 6, display: 'flex' }}>
                    <button onClick={() => voice.isSpeaking ? voice.stopSpeaking() : voice.speak(m.text)}
                      style={{ background: 'none', border: 'none', color: voice.isSpeaking ? 'var(--cyan)' : 'var(--text-dim)', fontSize: '0.7rem', cursor: 'pointer', padding: 0, transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {voice.isSpeaking ? '🔊 Speaking...' : '🔈 Listen'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--surface-bright)', borderRadius: '4px 12px 12px 12px', border: '1px solid rgba(0,245,255,0.12)' }}>
                {[0.1, 0.2, 0.3].map((d, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: `bounce 0.8s ${d}s ease-in-out infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(0,245,255,0.1)', display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Mic Button */}
            {voice.supported && (
              <button
                onClick={() => voice.isListening ? voice.stopListening() : voice.startListening()}
                disabled={typing}
                style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: voice.isListening ? 'rgba(255,50,50,0.2)' : 'var(--surface-bright)',
                  border: `1.5px solid ${voice.isListening ? '#ff4444' : 'rgba(0,245,255,0.15)'}`,
                  cursor: typing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'all 0.3s ease',
                  boxShadow: voice.isListening ? '0 0 15px rgba(255,50,50,0.3)' : 'none',
                  animation: voice.isListening ? 'pulse-ring-red 1.5s ease-in-out infinite' : 'none',
                  opacity: typing ? 0.4 : 1
                }}>
                {voice.isListening ? '⏹️' : '🎤'}
              </button>
            )}
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={voice.isListening ? 'Listening...' : "Ask ARIA anything..."}
              style={{
                flex: 1, background: 'var(--surface)', 
                border: `1px solid ${voice.isListening ? 'rgba(255,50,50,0.3)' : 'rgba(0,245,255,0.2)'}`,
                borderRadius: 999, padding: '9px 14px', color: 'var(--text)', fontSize: '0.84rem', outline: 'none',
                transition: 'border-color 0.3s'
              }}
              disabled={typing || voice.isListening}
            />
            <button onClick={() => send()} disabled={typing || voice.isListening}
              style={{
                width: 38, height: 38, borderRadius: '50%', background: 'var(--cyan)',
                border: 'none', cursor: (typing || voice.isListening) ? 'default' : 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1rem', color: '#060b18',
                boxShadow: 'var(--glow-cyan-sm)', flexShrink: 0, opacity: (typing || voice.isListening) ? 0.6 : 1
              }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── FLASHCARD PANEL ──────────────────────────────────────────────────────────
function FlashcardPanel({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [scores, setScores] = useState({});
  const [finished, setFinished] = useState(false);
  const [deck, setDeck] = useState([...cards]);

  const current = deck[idx];
  const known = Object.values(scores).filter(v => v === 'known').length;

  const respond = (res) => {
    setScores(s => ({ ...s, [idx]: res }));
    setFlipped(false);
    setTimeout(() => {
      if (idx < deck.length - 1) setIdx(i => i + 1);
      else setFinished(true);
    }, 180);
  };

  const reset = () => { setIdx(0); setFlipped(false); setScores({}); setFinished(false); setDeck([...cards].sort(() => Math.random() - 0.5)); };

  if (finished) return (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{known >= cards.length * 0.8 ? '🎉' : '📖'}</div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>Deck Complete!</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
        <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '1.4rem' }}>{known}</span> / {cards.length} mastered
      </p>
      {known >= cards.length * 0.8 && (
        <div style={{ padding: '10px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, marginBottom: 14, fontSize: '0.82rem', color: 'var(--cyan)' }}>
          ⚡ +50 Bonus XP!
        </div>
      )}
      <button className="btn btn-ghost btn-sm" onClick={reset} style={{ width: '100%', justifyContent: 'center' }}>Shuffle & Restart ↺</button>
    </div>
  );

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Card {idx + 1} / {deck.length}</span>
        <span style={{ color: 'var(--cyan)' }}>{known} known</span>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {deck.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', transition: 'all 0.2s',
            background: scores[i] === 'known' ? 'var(--cyan)' : scores[i] === 'learning' ? 'var(--violet)' : i === idx ? 'var(--text)' : 'var(--outline)'
          }} />
        ))}
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          cursor: 'pointer', minHeight: 160, borderRadius: 12, padding: '20px',
          background: flipped ? 'rgba(123,47,255,0.12)' : 'var(--surface-bright)',
          border: `1.5px solid ${flipped ? 'rgba(123,47,255,0.35)' : 'rgba(0,245,255,0.12)'}`,
          transition: 'all 0.3s', marginBottom: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: flipped ? 'var(--glow-violet)' : 'none'
        }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, color: flipped ? 'var(--violet)' : 'var(--cyan)', fontWeight: 700 }}>
          {flipped ? '✦ Answer' : '? Question'}
        </div>
        <p style={{ fontFamily: flipped ? 'var(--font-body)' : 'var(--font-head)', fontWeight: flipped ? 400 : 600, fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text)' }}>
          {flipped ? current.a : current.q}
        </p>
        {!flipped && <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-dim)' }}>Click to flip →</div>}
      </div>

      {/* Nav arrows */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { setFlipped(false); setTimeout(() => setIdx(i => Math.max(0, i - 1)), 150); }} disabled={idx === 0} style={{ flex: 1, justifyContent: 'center' }}>←</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setFlipped(false); setTimeout(() => idx < deck.length - 1 ? setIdx(i => i + 1) : setFinished(true), 150); }} style={{ flex: 1, justifyContent: 'center' }}>→</button>
      </div>

      {/* Response */}
      {flipped && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => respond('learning')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid rgba(123,47,255,0.35)', background: 'rgba(123,47,255,0.1)', color: 'var(--violet)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>↺ Still learning</button>
          <button onClick={() => respond('known')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.08)', color: '#00ff88', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>✓ Got it!</button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LevelDetail() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('video');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Dynamic state
  const [levelData, setLevelData] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('lq_user');
    if (!u) { router.push('/auth'); return; }
    setUser(JSON.parse(u));
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    const { id } = router.query;
    if (!id) return;
    
    // Look up the level title
    const node = ML_ROADMAP.find(n => n.id.toString() === id.toString()) || { title: 'Unknown Protocol', xp: 500 };
    
    const fetchDynamicLevel = async () => {
      // 1. If we have a hardcoded fallback, we could use it immediately, but user wants them ALL dynamic!
      try {
        setLoading(true);
        const res = await fetch('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Generate a structured educational learning module for the technology topic: "${node.title}". Output strictly as JSON matching EXACTLY this schema: { "title": "${node.title}", "subtitle": "A catchy, short one-line subtitle", "xp": ${node.xp || 300}, "video_summary": "3 brief paragraphs explaining the concept", "manim_code": "Generate a short mock python manim script representing this topic, using \\n and HTML tags like <span class='kw'> <span class='str'> <span class='num'> for syntax highlighting. The code must be inside a single string.", "slides": [ { "num": 1, "title": "Slide 1 Title", "bullets": ["Point 1", "Point 2"], "visual": "Visual description" }, { "num": 2, "title": "Slide 2 Title", "bullets": ["Point 1", "Point 2"], "visual": "Visual description" } ], "key_concepts": [ { "term": "Term 1", "def": "Def 1" }, { "term": "Term 2", "def": "Def 2" } ], "flashcards": [ { "q": "Question 1", "a": "Answer 1" }, { "q": "Question 2", "a": "Answer 2" } ] }`
          })
        });
        const data = await res.json();
        if(res.ok && data.title) {
          setLevelData(data);
          setCards(data.flashcards || []);
          setLoading(false);
        } else {
          // fallback if API fails
          console.error("Using fallback due to API fail", data);
          setLevelData(LEVEL_CONTENT[5]);
          setCards(FLASHCARDS[5]);
          setLoading(false);
        }
      } catch (err) {
        console.error("Generate error", err);
        setLevelData(LEVEL_CONTENT[5]);
        setCards(FLASHCARDS[5]);
        setLoading(false);
      }
    };
    
    // Let's force generate everything! Even if LEVEL_CONTENT[5] exists, it will fall back to it only if API fails.
    fetchDynamicLevel();
  }, [router.isReady, router.query.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200)); // We actually just simulated this one since it generated everything up front!
    setGenerating(false);
    setGenerated(true);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText('from manim import *\\n# See full code in LearnQuest');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = async () => {
    if(!levelData) return;
    setCompleting(true);
    await new Promise(r => setTimeout(r, 1500));
    const u = JSON.parse(localStorage.getItem('lq_user'));
    u.xp = Math.min(u.xp + levelData.xp, 2999);
    localStorage.setItem('lq_user', JSON.stringify(u));
    setCompleting(false);
    setCompleted(true);
    await new Promise(r => setTimeout(r, 1800));
    router.push('/roadmap');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(0,245,255,0.2)', borderTopColor: 'var(--cyan)', animation: 'spin-ring 1s linear infinite' }} />
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--cyan)', animation: 'pulse-ring 2s infinite' }}>AI is dynamically generating protocol data...</div>
      </div>
    );
  }

  const level = levelData;
  const VIDEO_SUMMARY = level.video_summary;

  return (
    <>
      <Head><title>Level 5: {level.title} — LearnQuest</title></Head>

      {/* Fixed background */}
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(0,245,255,0.025)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(123,47,255,0.03)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      <Nav user={user} />

      {/* XP Toast */}
      {completed && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: 'var(--surface-highest)', border: '1px solid var(--cyan)', borderRadius: 12, padding: '16px 24px', boxShadow: 'var(--glow-cyan)', animation: 'slideUp 0.4s ease' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--cyan)', fontSize: '1.1rem' }}>⚡ +{level.xp} XP earned!</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Returning to roadmap…</div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 64 }}>

        {/* Breadcrumb */}
        <div style={{ background: 'rgba(6,11,24,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,245,255,0.07)', padding: '10px 40px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', position: 'sticky', top: 64, zIndex: 50 }}>
          <span onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = ''}>Home</span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span onClick={() => router.push('/roadmap')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'} onMouseLeave={e => e.currentTarget.style.color = ''}>Machine Learning</span>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>Level 5: {level.title}</span>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 0, maxWidth: '100%', minHeight: 'calc(100vh - 108px)' }}>

          {/* ══════════════════ MAIN COLUMN ══════════════════ */}
          <div style={{ overflowY: 'auto', padding: '36px 44px 80px', borderRight: '1px solid rgba(0,245,255,0.06)' }}>

            {/* Level Header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ padding: '4px 14px', borderRadius: 999, background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.35)', fontSize: '0.75rem', color: 'var(--violet)', fontFamily: 'var(--font-head)', fontWeight: 700 }}>LEVEL 5</span>
                <span style={{ padding: '4px 14px', borderRadius: 999, background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700 }}>⚡ {level.xp} XP</span>
                <span style={{ padding: '4px 14px', borderRadius: 999, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', fontSize: '0.75rem', color: '#00ff88', fontWeight: 600 }}>Intermediate</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', letterSpacing: '-0.025em', marginBottom: 8, lineHeight: 1.15 }}>{level.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic' }}>{level.subtitle}</p>
            </div>

            {/* Tab Toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 32, padding: 4, background: 'var(--surface)', borderRadius: 12, width: 'fit-content' }}>
              {[['video', '🎬 Concept Video'], ['slides', '📊 AI Slides'], ['code', '💻 Manim Code']].map(([val, label]) => (
                <button key={val} onClick={() => setTab(val)}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                    background: tab === val ? 'var(--surface-highest)' : 'transparent',
                    color: tab === val ? 'var(--cyan)' : 'var(--text-muted)',
                    boxShadow: tab === val ? '0 1px 12px rgba(0,245,255,0.1)' : 'none'
                  }}>{label}</button>
              ))}
            </div>

            {/* ── VIDEO TAB ── */}
            {tab === 'video' && (
              <div>
                {/* AI GENERATED CONCEPT VIDEO */}
                <ConceptVideo />

                {/* VIDEO SUMMARY CARD */}
                <div style={{ background: 'var(--surface-high)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>📋</div>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--cyan)' }}>Video Summary</h3>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)', color: 'var(--text-muted)' }}>~12 min</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
                    {VIDEO_SUMMARY}
                  </div>
                  <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['Supervised Learning', 'Classification', 'Regression', 'Overfitting', 'Decision Boundary'].map(tag => (
                      <span key={tag} style={{ fontSize: '0.74rem', padding: '4px 12px', borderRadius: 999, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.2)', color: 'var(--violet)', fontWeight: 600 }}>
                        #{tag.replace(' ', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SLIDES TAB ── */}
            {tab === 'slides' && (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20, fontStyle: 'italic' }}>Full slide deck tailored for Intermediate level learners.</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                  {level.slides.map((s, i) => (
                    <button key={i} onClick={() => setSlideIdx(i)}
                      style={{
                        flexShrink: 0, padding: '8px 16px', borderRadius: 8, border: `1px solid ${slideIdx === i ? 'var(--violet)' : 'var(--outline)'}`,
                        background: slideIdx === i ? 'rgba(123,47,255,0.15)' : 'var(--surface)',
                        color: slideIdx === i ? 'var(--violet)' : 'var(--text-muted)', cursor: 'pointer',
                        fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.8rem',
                        boxShadow: slideIdx === i ? 'var(--glow-violet)' : 'none', transition: 'all 0.2s'
                      }}>Slide {s.num}</button>
                  ))}
                </div>

                {(() => {
                  const s = level.slides[slideIdx];
                  return (
                    <div style={{ background: 'linear-gradient(135deg, var(--surface-highest), var(--surface-bright))', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 14, padding: 32, marginBottom: 20, minHeight: 280 }}>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>SLIDE {s.num} OF {level.slides.length}</div>
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 20, letterSpacing: '-0.02em' }}>{s.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        {s.bullets.map((b, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 3, fontWeight: 700 }}>▸</span> {b}
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '12px 16px', background: 'rgba(0,245,255,0.04)', borderRadius: 8, border: '1px dashed rgba(0,245,255,0.15)', fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        📐 Suggested visual: {s.visual}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0}>← Previous</button>
                  <button className="btn btn-ghost-violet btn-sm" onClick={() => alert('In production: exports a .pptx file!')}>⬇ Export .pptx</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSlideIdx(i => Math.min(level.slides.length - 1, i + 1))} disabled={slideIdx === level.slides.length - 1}>Next →</button>
                </div>
              </div>
            )}

            {/* ── CODE TAB ── */}
            {tab === 'code' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem' }}>Manim Animation Generator</h2>
                  <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(0,245,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(0,245,255,0.15)' }}>✨ AI</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20, fontStyle: 'italic' }}>
                  Generate a production-ready Python Manim animation script for this topic.
                </p>

                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  {[['Complexity', 'Intermediate'], ['Focus', 'Intuition + Math']].map(([k, v], i) => (
                    <select key={i} className="input-field" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}>
                      <option>{k}: {v}</option>
                    </select>
                  ))}
                </div>

                {!generated && (
                  <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}
                    style={{ marginBottom: 24, width: '100%', justifyContent: 'center' }}>
                    {generating ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, height: 18, border: '2px solid #060b18', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-ring 0.7s linear infinite' }} />
                        Generating Manim Script…
                      </span>
                    ) : '🎬 Generate Manim Code'}
                  </button>
                )}

                {generated && (
                  <div style={{ background: '#000a14', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,245,255,0.05)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--cyan)', fontFamily: 'var(--font-head)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Python · Manim</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={handleCopy} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
                        <button className="btn btn-ghost btn-sm" onClick={handleGenerate} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>↺ Regenerate</button>
                      </div>
                    </div>
                    <div style={{ padding: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.7, color: '#a8c1e0', overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: level.manim_code }} />
                  </div>
                )}
              </div>
            )}

            {/* MARK COMPLETE */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(0,245,255,0.08)' }}>
              <button
                onClick={handleComplete}
                disabled={completing || completed}
                style={{
                  width: '100%', padding: '16px', border: 'none', borderRadius: 12, cursor: completing || completed ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.05rem',
                  background: completed ? 'rgba(0,255,136,0.1)' : 'linear-gradient(135deg, var(--violet), #00c8d4)',
                  color: completed ? '#00ff88' : '#fff',
                  border: completed ? '1px solid rgba(0,255,136,0.3)' : 'none',
                  boxShadow: completed ? 'none' : '0 4px 24px rgba(123,47,255,0.4)',
                  transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                }}>
                {completing ? (
                  <>
                    <span style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-ring 0.7s linear infinite' }} />
                    Saving Progress…
                  </>
                ) : completed ? '✓ Level Complete! Returning to Roadmap…' : `✓ Mark Level Complete — Earn ${level.xp} XP`}
              </button>
            </div>
          </div>

          {/* ══════════════════ SIDEBAR COLUMN ══════════════════ */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0, background: 'rgba(9,14,28,0.6)' }}>

            {/* Level Progress Card */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your Progress</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[{ label: 'Level', val: '5 / 30', color: 'var(--cyan)' }, { label: 'XP', val: `${user.xp.toLocaleString()}`, color: 'var(--gold)' }, { label: 'Streak', val: `🔥 ${user.streak}d`, color: '#FF6B35' }].map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: '10px 8px', background: 'var(--surface-bright)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${(user.xp / 3000) * 100}%` }} /></div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>{user.xp} / 3,000 XP to next level</div>
            </div>

            {/* Flashcard Section */}
            <div style={{ borderBottom: '1px solid rgba(0,245,255,0.06)' }}>
              <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--violet)' }}>📚 Flashcards</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Level 5 · {cards.length} cards</div>
                </div>
                <span style={{ borderTop: '2px solid var(--violet)', width: 36, display: 'inline-block' }} />
              </div>
              <FlashcardPanel cards={cards} />
            </div>

            {/* Key Concepts */}
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Key Concepts</div>
              {(level.key_concepts || []).map((c, i) => (
                <div key={i} style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--surface-bright)', borderRadius: 8, borderLeft: '2px solid rgba(0,245,255,0.3)' }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.82rem', color: 'var(--cyan)', marginBottom: 3 }}>{c.term}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.def}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat */}
      <FloatingChat topic={level.title} />

      <style jsx global>{`
        @keyframes spin-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring-red { 0%,100% { box-shadow: 0 0 0 0 rgba(255,68,68,0.4); } 50% { box-shadow: 0 0 0 8px rgba(255,68,68,0); } }
      `}</style>
    </>
  );
}

