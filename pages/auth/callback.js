import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

/**
 * OAuth Callback Handler
 * Supabase redirects here after Google/GitHub login.
 * We exchange the code for a session, fetch the profile,
 * store it in localStorage, then redirect to /dashboard.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically handles the token exchange from the URL hash/code
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push('/auth?error=oauth_failed');
        return;
      }

      const user = session.user;

      // Fetch or create profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const lqUser = {
        id: user.id,
        name: profile?.name || user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        streak: profile?.streak ?? 0,
        badges: profile?.badges ?? [],
      };

      localStorage.setItem('lq_user', JSON.stringify(lqUser));
      router.push('/dashboard');
    };

    handleCallback();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 20,
    }}>
      {/* Spinner */}
      <div style={{
        width: 48, height: 48,
        border: '3px solid rgba(0,245,255,0.2)',
        borderTopColor: 'var(--cyan)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '1rem' }}>
        Authenticating your quest...
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        :root {
          --bg: #090e1c;
          --cyan: #00F5FF;
          --text-muted: #a6aabf;
          --font-head: 'Space Grotesk', sans-serif;
        }
        body { background: #090e1c; margin: 0; }
      `}</style>
    </div>
  );
}
