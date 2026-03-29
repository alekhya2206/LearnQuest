import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const plans = [
  { 
    name: 'Free', 
    price: '0', 
    period: '/mo', 
    perks: ['1 Free Course', 'ARIA Basic Support', 'Basic XP Tracking', 'Public Roadmap'],
    color: 'var(--text-muted)',
    accent: 'rgba(166, 170, 191, 0.1)'
  },
  { 
    name: 'Monthly', 
    price: '19', 
    period: '/mo', 
    perks: ['Unlimited Courses', 'ARIA Pro Support', 'Custom Roadmaps', 'AI Flashcards & Quizzes'],
    color: 'var(--cyan)',
    accent: 'rgba(0, 245, 255, 0.1)'
  },
  { 
    name: '3 Months', 
    price: '49', 
    period: '/qtr', 
    perks: ['Everything in Monthly', 'Offline Access', 'Early Beta Features', 'Priority Roadmap Items'],
    color: 'var(--violet)',
    accent: 'rgba(123, 47, 255, 0.1)'
  },
  { 
    name: '6 Months', 
    price: '89', 
    period: '/sem', 
    perks: ['Everything in 3 Months', 'Priority Support', 'Custom Profile Badges', 'Legacy Certification'],
    color: 'var(--orange)',
    accent: 'rgba(255, 107, 53, 0.1)'
  },
  { 
    name: 'Yearly', 
    price: '149', 
    period: '/yr', 
    perks: ['Full Lifetime Mind-Map', 'Personal AI Career Coach', 'Exclusive Workshops', 'VIP Presentation Access'],
    color: 'var(--gold)',
    accent: 'rgba(255, 215, 0, 0.1)'
  }
];

export default function ScrollSplitCards() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress for cinematic feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Phase 1 Overlay Text */}
        <motion.div 
          style={{
            position: 'absolute',
            top: '15%',
            textAlign: 'center',
            zIndex: 20,
            opacity: useTransform(smoothProgress, [0, 0.15], [1, 0]),
            y: useTransform(smoothProgress, [0, 0.15], [0, -30])
          }}
        >
          <span className="chip" style={{ marginBottom: '1rem', background: 'rgba(0,245,255,0.05)', borderColor: 'rgba(0,245,255,0.2)' }}>// ACCESS PROTOCOL: DIMENSIONS</span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Choose Your <span style={{ color: 'var(--cyan)' }}>Quest</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Scroll to fragment the core image and reveal pricing.</p>
        </motion.div>

        {/* Phase 3 Header (reveals when flipping starts) */}
        <motion.div 
          style={{
            position: 'absolute',
            top: '12%',
            textAlign: 'center',
            zIndex: 10,
            opacity: useTransform(smoothProgress, [0.5, 0.7], [0, 1]),
            scale: useTransform(smoothProgress, [0.5, 0.7], [0.9, 1])
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Pricing <span style={{ color: 'var(--violet)' }}>Tiers</span></h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Comparative breakdown of learning access.</p>
        </motion.div>

        <div style={{ 
          display: 'flex', 
          perspective: '1500px', 
          width: '90vw', 
          height: '65vh', 
          position: 'relative', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {plans.map((plan, i) => (
            <Card 
              key={plan.name} 
              plan={plan} 
              index={i} 
              total={plans.length} 
              progress={smoothProgress} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ plan, index, total, progress }) {
  const cardWidthVw = 17.5; // 17.5vw per card
  const gapVw = 1; // 1vw gap in final state

  // PHASE 1-2: SPLIT (0.1 to 0.45)
  // At progress 0-0.1: Cards are locked adjacent.
  // At progress 0.45: Cards are spaced out.
  const initialX = (index - (total - 1) / 2) * cardWidthVw;
  const finalX = (index - (total - 1) / 2) * (cardWidthVw + gapVw);
  
  const x = useTransform(progress, [0.1, 0.45], [`${initialX}vw`, `${finalX}vw`]);

  // PHASE 3: FLIP (0.5 to 0.85)
  const rotateY = useTransform(progress, [0.5, 0.85], [0, 180]);
  
  // Opacity Handover (during flip)
  const imageOpacity = useTransform(progress, [0.65, 0.75], [1, 0]);
  const contentOpacity = useTransform(progress, [0.65, 0.75], [0, 1]);

  // Visual Polish (lift & scale)
  const scale = useTransform(progress, [0.85, 0.95], [1, 1.05]);
  const y = useTransform(progress, [0.85, 0.95], [0, -15]);

  const bgPosX = `${(index / (total - 1)) * 100}%`;

  return (
    <motion.div
      style={{
        position: 'absolute',
        translateX: x,
        rotateY,
        scale,
        y,
        width: `${cardWidthVw}vw`,
        height: '100%',
        transformStyle: 'preserve-3d',
        zIndex: index + 5,
        cursor: 'pointer'
      }}
    >
      {/* FRONT FACE: IMAGE SEGMENT */}
      <motion.div
        className="glass"
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          backgroundImage: 'url(/images/hero-split.png)',
          backgroundSize: `${total * 100}% 100%`,
          backgroundPosition: `${bgPosX} 0`,
          border: '1px solid rgba(0, 245, 255, 0.15)',
          opacity: imageOpacity,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '24px',
          overflow: 'hidden',
          borderRadius: '12px'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,14,28,0.7), transparent)' }} />
        <h3 style={{ position: 'relative', zIndex: 2, fontSize: '1.2rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</h3>
      </motion.div>

      {/* BACK FACE: CONTENT */}
      <motion.div
        className="glass"
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'rgba(13, 19, 35, 0.98)',
          border: `1px solid ${plan.color}33`,
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 20px ${plan.accent}`,
          opacity: contentOpacity,
          borderRadius: '12px'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.name}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '6px' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>${plan.price}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>{plan.period}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan.perks.map((perk, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                <div style={{ marginTop: '2px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="btn btn-sm" 
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            marginTop: '20px',
            background: plan.color,
            color: '#060b18',
            fontWeight: 700,
            boxShadow: `0 0 15px ${plan.color}44`
          }}
        >
          Select Dimension
        </button>
      </motion.div>
    </motion.div>
  );
}
