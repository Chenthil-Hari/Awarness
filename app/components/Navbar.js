import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import StreakIcon from './StreakIcon';
import TrophyIcon from './TrophyIcon';
import LevelIcon from './LevelIcon';
import ProfileIcon from './ProfileIcon';
import SettingsIcon from './SettingsIcon';
import { useTheme } from '../context/ThemeContext';

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
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Awareness <span className="gradient-text">Pro</span></h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Simulate. Learn. Survive.</p>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right', display: 'none', md: 'block', marginRight: '0.25rem' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 700 }}>XP</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 900, margin: 0, color: 'var(--accent-secondary)' }}>{score}</p>
        </div>

        <div style={{
          padding: '0.35rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: '1px solid var(--glass-border)'
        }}>
          <LevelIcon size={20} />
          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Lv. {level}</span>
        </div>

        {session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/leaderboard" title="Leaderboard" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', transition: 'color 0.2s', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <TrophyIcon size={22} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Ranking</span>
            </Link>

            <Link href="/settings" title="Account Settings" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', transition: 'color 0.2s', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <SettingsIcon size={22} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Settings</span>
            </Link>
            
            <div title="Daily Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.75rem 0.15rem 0.3rem', background: 'rgba(255, 120, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 120, 0, 0.2)' }}>
              <StreakIcon size={24} />
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FF7800' }}>{session.user.streak || 0}</span>
            </div>
          </div>
        )}

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--glass-border)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>{session.user.name}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', margin: '0 0 0.25rem 0', display: 'block' }}>@{session.user.username || 'user'}</span>
              <button 
                onClick={() => signOut()}
                style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              <ProfileIcon size={28} />
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
