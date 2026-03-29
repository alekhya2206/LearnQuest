import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Nav from '../components/Nav';
import { supabase } from '../lib/supabase';

const Particles = dynamic(() => import('../components/Particles'), { ssr: false });

/* ─── Simulated Community Learners ─── */
const LEARNERS = [
  { name: 'Aarav Sharma', avatar: 'A', topic: 'Machine Learning', xp: 8420, level: 12, streak: 21, progress: 78, tier: 'Advanced', color: '#FF6B35' },
  { name: 'Priya Patel', avatar: 'P', topic: 'Data Science', xp: 7850, level: 11, streak: 18, progress: 72, tier: 'Advanced', color: '#7B2FFF' },
  { name: 'Ravi Kumar', avatar: 'R', topic: 'Web Development', xp: 7200, level: 10, streak: 30, progress: 65, tier: 'Intermediate', color: '#00F5FF' },
  { name: 'Sneha Gupta', avatar: 'S', topic: 'Python Programming', xp: 6900, level: 10, streak: 14, progress: 60, tier: 'Intermediate', color: '#FFD700' },
  { name: 'Manish Reddy', avatar: 'M', topic: 'Cybersecurity', xp: 6500, level: 9, streak: 25, progress: 55, tier: 'Intermediate', color: '#FF4466' },
  { name: 'Ananya Singh', avatar: 'A', topic: 'UX Design', xp: 6100, level: 9, streak: 12, progress: 52, tier: 'Intermediate', color: '#FF9D6F' },
  { name: 'Deepak Joshi', avatar: 'D', topic: 'Blockchain', xp: 5800, level: 8, streak: 9, progress: 48, tier: 'Intermediate', color: '#AFF0A0' },
  { name: 'Ishita Verma', avatar: 'I', topic: 'Marketing Analytics', xp: 5400, level: 8, streak: 15, progress: 45, tier: 'Intermediate', color: '#C9A0FF' },
  { name: 'Karthik Nair', avatar: 'K', topic: 'Finance', xp: 5100, level: 7, streak: 11, progress: 42, tier: 'Intermediate', color: '#00D4E5' },
  { name: 'Neha Chopra', avatar: 'N', topic: 'Business Analysis', xp: 4800, level: 7, streak: 8, progress: 38, tier: 'Beginner', color: '#FF6B9D' },
  { name: 'Rohan Malhotra', avatar: 'R', topic: 'Cloud Computing', xp: 4500, level: 6, streak: 19, progress: 35, tier: 'Beginner', color: '#6BE5FF' },
  { name: 'Tanya Mishra', avatar: 'T', topic: 'Psychology', xp: 4200, level: 6, streak: 7, progress: 33, tier: 'Beginner', color: '#FFB86B' },
  { name: 'Vikram Das', avatar: 'V', topic: 'Machine Learning', xp: 3900, level: 5, streak: 13, progress: 30, tier: 'Beginner', color: '#FF6B35' },
  { name: 'Pooja Agarwal', avatar: 'P', topic: 'Neuroscience', xp: 3600, level: 5, streak: 6, progress: 28, tier: 'Beginner', color: '#7B2FFF' },
  { name: 'Arjun Mehta', avatar: 'A', topic: 'Data Science', xp: 3200, level: 4, streak: 10, progress: 24, tier: 'Beginner', color: '#00F5FF' },
  { name: 'Divya Rao', avatar: 'D', topic: 'Quantum Computing', xp: 2900, level: 4, streak: 5, progress: 20, tier: 'Beginner', color: '#FFD700' },
  { name: 'Siddharth Iyer', avatar: 'S', topic: 'Web Development', xp: 2500, level: 3, streak: 16, progress: 18, tier: 'Beginner', color: '#AFF0A0' },
  { name: 'Megha Saxena', avatar: 'M', topic: 'Python Programming', xp: 2100, level: 3, streak: 4, progress: 15, tier: 'Beginner', color: '#C9A0FF' },
  { name: 'Nikhil Bose', avatar: 'N', topic: 'Finance', xp: 1800, level: 2, streak: 3, progress: 12, tier: 'Beginner', color: '#FF9D6F' },
  { name: 'Kavya Pillai', avatar: 'K', topic: 'Marketing Analytics', xp: 1500, level: 2, streak: 2, progress: 10, tier: 'Beginner', color: '#6BE5FF' },
];

const TOPIC_ICONS = {
  'Machine Learning': '🧠', 'Data Science': '📊', 'Web Development': '💻',
  'Python Programming': '🐍', 'Cybersecurity': '🛡️', 'UX Design': '🎨',
  'Blockchain': '⛓️', 'Marketing Analytics': '📈', 'Finance': '💰',
  'Business Analysis': '💼', 'Cloud Computing': '☁️', 'Psychology': '🔮',
  'Neuroscience': '⚡', 'Quantum Computing': '⚛️',
};

const FILTERS = ['All Topics', 'Machine Learning', 'Data Science', 'Web Development', 'Python Programming', 'Cybersecurity', 'UX Design', 'Blockchain', 'Finance', 'Marketing Analytics', 'Business Analysis'];

function getRankBadge(rank) {
  if (rank === 1) return { emoji: '👑', bg: 'linear-gradient(135deg, #FFD700, #FF8C00)', glow: '0 0 20px rgba(255,215,0,0.5)', text: '#000' };
  if (rank === 2) return { emoji: '🥈', bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', glow: '0 0 15px rgba(192,192,192,0.4)', text: '#000' };
  if (rank === 3) return { emoji: '🥉', bg: 'linear-gradient(135deg, #CD7F32, #B87333)', glow: '0 0 15px rgba(205,127,50,0.4)', text: '#000' };
  return null;
}

function getTierColor(tier) {
  if (tier === 'Advanced') return { bg: 'rgba(123,47,255,0.15)', border: 'rgba(123,47,255,0.4)', text: '#c9a0ff' };
  if (tier === 'Intermediate') return { bg: 'rgba(0,245,255,0.1)', border: 'rgba(0,245,255,0.3)', text: '#00F5FF' };
  return { bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', text: '#FFD700' };
}

export default function Leaderboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('All Topics');
  const [animateIn, setAnimateIn] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let lqUser = null;
      if (!session) {
        const stored = localStorage.getItem('lq_user');
        if (!stored) { router.push('/auth'); return; }
        lqUser = JSON.parse(stored);
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        lqUser = {
          id: session.user.id,
          name: profile?.name || session.user.email.split('@')[0],
          email: session.user.email,
          level: profile?.level ?? 1,
          xp: profile?.xp ?? 0,
          streak: profile?.streak ?? 0,
          badges: profile?.badges ?? [],
          onboarded: profile?.onboarded ?? false,
          psychProfile: profile?.psych_profile ? JSON.parse(profile.psych_profile) : null,
        };
        localStorage.setItem('lq_user', JSON.stringify(lqUser));
      }
      setUser(lqUser);
      setTimeout(() => setAnimateIn(true), 100);
    };
    init();
  }, [router]);

  // The user's active topic (from their recent roadmaps on dashboard)
  const userTopic = 'Machine Learning';

  const filteredLearners = useMemo(() => {
    if (filter === 'All Topics') return LEARNERS;
    return LEARNERS.filter(l => l.topic === filter);
  }, [filter]);

  // Community-wide stats
  const totalLearners = LEARNERS.length;
  const totalXP = LEARNERS.reduce((sum, l) => sum + l.xp, 0);
  const uniqueTopics = [...new Set(LEARNERS.map(l => l.topic))].length;
  const avgStreak = Math.round(LEARNERS.reduce((sum, l) => sum + l.streak, 0) / LEARNERS.length);

  if (!user) return null;

  return (
    <>
      <Head><title>Community Progress — LearnQuest</title></Head>
      <Particles />
      <div className="orb orb-cyan" />
      <div className="orb orb-violet" />
      <Nav user={user} />

      <div className="page">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

          {/* ─── Header ─── */}
          <div style={{ textAlign: 'center', marginBottom: 48, opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 600, marginBottom: 12 }}>
              👥 Community Progress
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: 12 }}>
              See What Everyone's <span style={{ background: 'linear-gradient(90deg, var(--cyan), var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learning</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 560, margin: '0 auto' }}>
              Track the learning journeys of fellow questers. Not a competition — just inspiration.
            </p>
          </div>

          {/* ─── Community Stats Cards ─── */}
          <div className="lb-stats-grid" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.1s' }}>
            {[
              { label: 'Active Learners', value: totalLearners, icon: '🎓', accent: 'var(--cyan)' },
              { label: 'Total XP Earned', value: totalXP.toLocaleString(), icon: '⚡', accent: 'var(--gold)' },
              { label: 'Topics Being Explored', value: uniqueTopics, icon: '📚', accent: 'var(--violet)' },
              { label: 'Avg. Streak', value: `${avgStreak} days`, icon: '🔥', accent: 'var(--orange)' },
            ].map((stat, i) => (
              <div key={i} className="glass lb-stat-card" style={{ borderColor: `${stat.accent}22` }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', color: stat.accent, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* ─── Filter Chips ─── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32, opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.2s' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`chip ${filter === f ? 'chip-active' : ''}`}
                onClick={() => setFilter(f)}
                style={f !== 'All Topics' && f === userTopic ? {
                  borderColor: 'var(--cyan)',
                  background: filter === f ? 'rgba(0,245,255,0.12)' : 'rgba(0,245,255,0.05)',
                  color: 'var(--cyan)',
                  boxShadow: '0 0 8px rgba(0,245,255,0.15)',
                } : {}}
              >
                {f !== 'All Topics' && (TOPIC_ICONS[f] || '📘')}{' '}
                {f}
                {f === userTopic && <span style={{ fontSize: '0.65rem', marginLeft: 4, opacity: 0.7 }}>⭐ yours</span>}
              </button>
            ))}
          </div>

          {/* ─── Leaderboard Table ─── */}
          <div className="glass lb-table-wrap" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.3s' }}>

            {/* Table Header */}
            <div className="lb-table-header">
              <div className="lb-col-rank">Rank</div>
              <div className="lb-col-learner">Learner</div>
              <div className="lb-col-topic">Studying</div>
              <div className="lb-col-tier">Tier</div>
              <div className="lb-col-xp">XP</div>
              <div className="lb-col-streak">Streak</div>
              <div className="lb-col-progress">Progress</div>
            </div>

            {/* Table Rows */}
            <div className="lb-table-body">
              {filteredLearners.map((learner, idx) => {
                const rank = idx + 1;
                const badge = getRankBadge(rank);
                const tierStyle = getTierColor(learner.tier);
                const isUserTopic = learner.topic === userTopic;
                const isHovered = hoveredRow === idx;

                return (
                  <div
                    key={idx}
                    className={`lb-row ${rank <= 3 ? 'lb-row-top' : ''} ${isUserTopic ? 'lb-row-highlight' : ''}`}
                    onMouseEnter={() => setHoveredRow(idx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      animationDelay: `${idx * 0.04}s`,
                      transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                      zIndex: isHovered ? 10 : 1,
                    }}
                  >
                    {/* Rank */}
                    <div className="lb-col-rank">
                      {badge ? (
                        <div className="lb-rank-badge" style={{ background: badge.bg, boxShadow: badge.glow, color: badge.text }}>
                          {badge.emoji}
                        </div>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-dim)' }}>
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <div className="lb-col-learner">
                      <div className="lb-avatar" style={{ background: `linear-gradient(135deg, ${learner.color}, ${learner.color}88)` }}>
                        {learner.avatar}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {learner.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          Level {learner.level}
                        </div>
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="lb-col-topic">
                      <span className="lb-topic-pill" style={isUserTopic ? { borderColor: 'rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.08)', color: 'var(--cyan)' } : {}}>
                        {TOPIC_ICONS[learner.topic] || '📘'} {learner.topic}
                      </span>
                    </div>

                    {/* Tier */}
                    <div className="lb-col-tier">
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
                        borderRadius: 999, background: tierStyle.bg,
                        border: `1px solid ${tierStyle.border}`, color: tierStyle.text,
                      }}>
                        {learner.tier}
                      </span>
                    </div>

                    {/* XP */}
                    <div className="lb-col-xp">
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.88rem', color: 'var(--cyan)' }}>
                        {learner.xp.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginLeft: 3 }}>XP</span>
                    </div>

                    {/* Streak */}
                    <div className="lb-col-streak">
                      <span style={{ fontSize: '0.85rem' }}>🔥</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: '0.85rem', color: learner.streak >= 14 ? 'var(--orange)' : 'var(--text-muted)' }}>
                        {learner.streak}d
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="lb-col-progress">
                      <div className="lb-progress-track">
                        <div className="lb-progress-fill" style={{ width: `${learner.progress}%`, background: `linear-gradient(90deg, ${learner.color}, ${learner.color}88)` }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', minWidth: 32, textAlign: 'right' }}>
                        {learner.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLearners.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
                <p>No learners found for this topic yet.</p>
              </div>
            )}
          </div>

          {/* ─── Bottom Inspiration Banner ─── */}
          <div className="glass lb-banner" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.4s' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', marginBottom: 6, color: 'var(--text)' }}>
              Learning is not a race. It's a journey.
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: 480, margin: '0 auto' }}>
              Everyone on this board is on their own unique path. Pick a topic and start your quest today!
            </p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => router.push('/dashboard')}>
              Start Learning →
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
