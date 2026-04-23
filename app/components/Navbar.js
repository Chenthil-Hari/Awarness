import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, LogOut, User, Flame, Trophy } from 'lucide-react';

export default function Navbar({ score = 0, level = 1 }) {
  const { data: session } = useSession();

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Awareness <span className="gradient-text">Pro</span></h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Simulate. Learn. Survive.</p>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>CURRENT SCORE</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--accent-secondary)' }}>{score} XP</p>
        </div>
        
        <div style={{
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--glass-border)'
        }}>
          <Trophy size={18} color="var(--accent-warning)" />
          <span style={{ fontWeight: 600 }}>Level {level}</span>
        </div>

        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginRight: '1rem' }}>
            <Link href="/leaderboard" title="Leaderboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
              <Trophy size={18} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Ranking</span>
            </Link>
            
            <div title="Daily Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(255, 120, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 120, 0, 0.2)' }}>
              <Flame size={18} color="#FF7800" fill="#FF7800" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF7800' }}>{session.user.streak || 0}</span>
            </div>
          </div>
        )}

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--glass-border)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{session.user.name}</p>
              <Link href="/profile" style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', margin: '0 0 0.25rem 0', display: 'block' }}>@{session.user.username || 'user'}</Link>
              <button 
                onClick={() => signOut()}
                style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid var(--glass-border)' }}>
              <User size={20} style={{ margin: 'auto' }} />
            </div>
          </div>
        ) : (
          <Link href="/auth/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
