import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const plans = [
  { 
    name: 'Quest: Foundational', 
    price: '0', 
    period: '/mo', 
    phrase: 'Begin your journey with<br/>foundation protocols',
    perks: ['1 Free Technical Course', 'ARIA Basic AI Support', 'Community Roadmap Access'],
    color: '#00F5FF',
    icon: 'M17.303 5.197A7.5 7.5 0 0 0 6.697 15.803a.75.75 0 0 1-1.061 1.061A9 9 0 1 1 21 10.5a.75.75 0 0 1-1.5 0c0-1.92-.732-3.839-2.197-5.303Zm-2.121 2.121a4.5 4.5 0 0 0-6.364 6.364.75.75 0 1 1-1.06 1.06A6 6 0 1 1 18 10.5a.75.75 0 0 1-1.5 0c0-1.153-.44-2.303-1.318-3.182Zm-3.634 1.314a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68Z',
    bg: 'https://static.wixstatic.com/media/0d6674_6b2a6e4ca17a4fdfa3af22ac8cfb94b8~mv2.png/v1/fill/w_510,h_600,al_c,lg_1,q_85,enc_avif,quality_auto/Group%204721221.png'
  },
  { 
    name: 'Quest: Infinite', 
    price: '499', 
    period: '/mo', 
    phrase: 'Unlock consistent growth<br/>with unlimited modules',
    perks: ['Unlimited AI Courses', 'ARIA Pro Support', 'Custom Learning Path'],
    color: '#bc13fe',
    icon: 'M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z',
    bg: 'https://static.wixstatic.com/media/0d6674_bf5ed4c16a044f6b86d67ea508319d85~mv2.png/v1/fill/w_1103,h_542,fp_0.43_0.17,q_90,enc_avif,quality_auto/Group%201000003094.png'
  },
  { 
    name: 'Horizon: Quarterly', 
    price: '1,299', 
    period: '/qtr', 
    phrase: 'Extended focus for<br/>serious practitioners',
    perks: ['Everything in Infinite', 'Offline Course Access', 'Priority Roadmap Items'],
    color: '#00F5FF',
    icon: 'M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 0 1 .878.645 49.17 49.17 0 0 1 .376 5.452.657.657 0 0 1-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 0 0-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 0 1-.595 4.845.75.75 0 0 1-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 0 1-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 0 1-.658.643 49.118 49.118-0.36.75.75 0 0 1-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 0 0 5.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 0 0 .659-.663 47.703 47.703 0 0 0-.31-4.82.75.75 0 0 1 .83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 0 0 .657-.642Z',
    bg: 'https://static.wixstatic.com/media/0d6674_6f7baf7f6bbc4842b8b5446838b73c5a~mv2.png/v1/fill/w_606,h_600,al_c,lg_1,q_90,enc_avif,quality_auto/icecream.png'
  },
  { 
    name: 'Nebula: Semestral', 
    price: '2,499', 
    period: '/sem', 
    phrase: 'Master your field<br/>with priority updates',
    perks: ['Early Feature Access', 'Professional Certifications', 'Priority Support'],
    color: '#ff6100',
    icon: 'M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z',
    bg: 'https://static.wixstatic.com/media/0d6674_523047e73ed04f5da4d01e2013ead27c~mv2.png/v1/fill/w_779,h_543,fp_0.49_0.52,q_90,enc_avif,quality_auto/beauty.png'
  },
  { 
    name: 'Cosmos: Yearly', 
    price: '3,999', 
    period: '/yr', 
    phrase: 'The ultimate legacy<br/>in cognitive expansion',
    perks: ['Full Lifetime Mind-Map', 'Personal AI Coach', 'VIP Presentation Access'],
    color: '#FFD700',
    icon: 'M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z',
    bg: 'https://static.wixstatic.com/media/0d6674_db8c76159aef4e0fad0bf37dcad1b8ac~mv2.png/v1/fill/w_948,h_559,al_c,q_90,enc_avif,quality_auto/extream.png'
  }
];

export default function ScalingSlidingCards() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const cards = gsap.utils.toArray('.pricing-card');
    const orbs = gsap.utils.toArray('.floating-orb');
    
    // Main Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=200%',
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      }
    });

    // Horizontal Scroll
    tl.to(trackRef.current, {
      x: () => -(trackRef.current.scrollWidth - window.innerWidth),
      ease: 'none'
    });

    // Individual Scaling & Movement
    cards.forEach((card, i) => {
       gsap.to(card, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        scrollTrigger: {
          trigger: card,
          containerAnimation: tl,
          start: 'left center+=300',
          end: 'center center',
          scrub: true,
        }
      });
      gsap.set(card, { scale: 0.8, opacity: 0.2, y: 50 });
    });

    // Animate Orbs independently for depth
    orbs.forEach((orb) => {
      gsap.to(orb, {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        duration: 'random(3, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Optimized Pointer Update (using quickSetter for performance)
    const setX = gsap.quickSetter(document.documentElement, '--x', 'px');
    const setY = gsap.quickSetter(document.documentElement, '--y', 'px');

    const onMove = (e) => {
      setX(e.clientX);
      setY(e.clientY);
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div ref={containerRef} className="scaling-container">
      {/* Background Orbs for "Flying Animation" effect */}
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="floating-orb" 
          style={{ 
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? 'var(--cyan)' : 'var(--violet)'
          }} 
        />
      ))}

      <div ref={trackRef} className="scaling-track">
        {plans.map((plan, i) => (
          <div 
            key={plan.name} 
            className="pricing-card glow-card moving-glow" 
            data-glow
            style={{ 
              minWidth: '400px', 
              height: '580px', 
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '40px',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)',
              '--glow-hue': plan.color === '#bc13fe' ? 280 : 180 // Map colors to hues for the glow engine
            }}
          >
            {/* Background Texture with higher contrast overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${plan.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1,
              zIndex: 0
            }} />
            
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(6,11,24,0.9), rgba(6,11,24,0.6))',
              backdropFilter: 'blur(20px)',
              zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '25px' }}>
                <div style={{ color: plan.color, fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, marginRight: '4px' }}>₹</span>
                  <span style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginLeft: '8px', fontWeight: 500 }}>{plan.period}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '35px' }}>
                {[...Array(4)].map((_, j) => (
                  <svg
                    key={j}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ width: '24px', height: '24px', color: plan.color, filter: `drop-shadow(0 0 8px ${plan.color}55)` }}
                  >
                    <path d={plan.icon} />
                  </svg>
                ))}
              </div>

              <h2 
                style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '30px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                dangerouslySetInnerHTML={{ __html: plan.phrase }} 
              />

              <div style={{ flex: 1 }}>
                {plan.perks.map((perk, j) => (
                  <div key={j} style={{ display: 'flex', gap: '14px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `${plan.color}22`, border: `1px solid ${plan.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    {perk}
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-primary" 
                style={{ 
                  marginTop: '40px', 
                  width: '100%', 
                  height: '64px',
                  justifyContent: 'center',
                  background: plan.color,
                  color: '#060b18',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  borderRadius: '20px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: `0 15px 30px -10px ${plan.color}77`
                }}
              >
                Access Protocol
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-card:hover button {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px var(--cyan);
        }
      `}</style>
    </div>
  );
}
