import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, LogOut, Home, BookOpen } from 'lucide-react';
import StreakIcon from './StreakIcon';
import TrophyIcon from './TrophyIcon';
import LevelIcon from './LevelIcon';
import ProfileIcon from './ProfileIcon';
import SettingsIcon from './SettingsIcon';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ score = 0, level = 1 }) {
  const { data: session } = useSession();

  return (
    <nav className="glass navbar-responsive" style={{
      position: 'sticky',
      top: '0.5rem',
      zIndex: 100,
      padding: '0.75rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      width: 'calc(100% - 1rem)',
      margin: '0.5rem auto',
      borderRadius: 'var(--radius-lg)',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={18} color="white" />
          </div>
          <div className="hide-mobile">
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Awareness <span className="gradient-text">Pro</span></h2>
          </div>
        </Link>

        {session && (
          <Link href="/" title="Home Dashboard" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            color: 'var(--text-secondary)', 
            transition: 'all 0.3s ease', 
            padding: '0.4rem 0.75rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)'
          }} className="hover-lift">
            <Home size={16} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>HOME</span>
          </Link>
        )}

        <Link href="/wiki" title="Learning Hub" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          color: 'var(--text-secondary)', 
          transition: 'all 0.3s ease', 
          padding: '0.4rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)'
        }} className="hover-lift">
          <BookOpen size={16} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>WIKI</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
        <div style={{ textAlign: 'right', display: 'none', lg: 'block' }}>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 700 }}>XP</p>
          <p style={{ fontSize: '0.85rem', fontWeight: 900, margin: 0, color: 'var(--accent-secondary)' }}>{score}</p>
        </div>

        <div style={{
          padding: '0.3rem 0.6rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          border: '1px solid var(--glass-border)'
        }}>
          <LevelIcon size={18} />
          <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>Lvl {level}</span>
        </div>

        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/leaderboard" title="Leaderboard" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <TrophyIcon size={18} />
              <span className="hide-mobile" style={{ fontSize: '0.65rem', fontWeight: 700 }}>Ranking</span>
            </Link>

            <Link href="/settings" title="Account Settings" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <SettingsIcon size={18} />
              <span className="hide-mobile" style={{ fontSize: '0.65rem', fontWeight: 700 }}>Settings</span>
            </Link>
            
            <div title="Daily Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', padding: '0.15rem 0.6rem 0.15rem 0.2rem', background: 'rgba(255, 120, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 120, 0, 0.2)' }}>
              <StreakIcon size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FF7800' }}>{session.user.streak || 0}</span>
            </div>
          </div>
        )}

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--glass-border)' }}>
            <div style={{ textAlign: 'right' }} className="hide-mobile">
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>@{session.user.username || 'user'}</p>
              <button 
                onClick={() => signOut()}
                style={{ fontSize: '0.65rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}
              >
                <LogOut size={10} /> Out
              </button>
            </div>
            <Link href="/profile" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', overflow: 'hidden', flexShrink: 0 }}>
              <ProfileIcon size={24} />
            </Link>
          </div>
        ) : (
          <Link href="/auth/login" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
