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

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} style={{ height: '400vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Centered Heading that fades out */}
        <motion.div 
          style={{
            position: 'absolute',
            top: '15%',
            textAlign: 'center',
            zIndex: 10,
            opacity: useTransform(smoothProgress, [0, 0.15], [1, 0]),
            y: useTransform(smoothProgress, [0, 0.15], [0, -20])
          }}
        >
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Choose Your <span style={{ color: 'var(--cyan)' }}>Quest</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Scroll to reveal our personalized learning dimensions.</p>
        </motion.div>

        <div style={{ display: 'flex', gap: 0, perspective: '2000px', width: '90vw', height: '60vh' }}>
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
  // Split Logic (0 to 0.4)
  // Each card moves from its center position to a spaced out position
  const centerOffset = (index - (total - 1) / 2) * 5; // Initial slight overlap or spacing
  const finalOffset = (index - (total - 1) / 2) * 22; // Final % offset
  
  const x = useTransform(progress, [0.1, 0.4], [`${centerOffset}vw`, `${finalOffset}vw`]);
  
  // Flip Logic (0.4 to 0.8)
  const rotateY = useTransform(progress, [0.4, 0.8], [0, 180]);
  
  // Fade in content (0.6 to 0.9)
  const contentOpacity = useTransform(progress, [0.7, 0.9], [0, 1]);
  const imageOpacity = useTransform(progress, [0.7, 0.8], [1, 0]);

  // Scale and Lift (0.8 to 1.0)
  const scale = useTransform(progress, [0.8, 0.95], [1, 1.05]);
  const y = useTransform(progress, [0.8, 0.95], [0, -10]);

  const bgPosX = `${(index / (total - 1)) * 100}%`;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        x: '-50%',
        translateX: x,
        rotateY,
        scale,
        y,
        width: '18%',
        height: '100%',
        transformStyle: 'preserve-3d',
        zIndex: index,
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
          border: '1px solid rgba(0, 245, 255, 0.2)',
          opacity: imageOpacity,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '24px',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,14,28,0.8), transparent)' }} />
        <h3 style={{ position: 'relative', zIndex: 2, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{plan.name}</h3>
      </motion.div>

      {/* BACK FACE: CONTENT */}
      <motion.div
        className="glass"
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'rgba(19, 25, 43, 0.95)',
          border: `1px solid ${plan.color}44`,
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 0 40px ${plan.accent}`,
          opacity: contentOpacity
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.name}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>${plan.price}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '4px' }}>{plan.period}</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plan.perks.map((perk, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            justifyContent: 'center',
            marginTop: '24px',
            background: plan.color,
            color: '#060b18',
            boxShadow: `0 0 15px ${plan.color}55`
          }}
        >
          Select Plan
        </button>
      </motion.div>
    </motion.div>
  );
}
