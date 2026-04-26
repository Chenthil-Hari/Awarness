import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, LogOut, Home, BookOpen, Mail, Bell, Award, Hammer } from 'lucide-react';
import StreakIcon from './StreakIcon';
import TrophyIcon from './TrophyIcon';
import LevelIcon from './LevelIcon';
import ProfileIcon from './ProfileIcon';
import SettingsIcon from './SettingsIcon';
import Lottie from 'lottie-react';
import bellAnimation from '../../images/bell.json';
import mobileWifiAnimation from '../../images/mobile-wifi.json';

export default function Navbar({ score = 0, level = 1 }) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
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
          <div className="hide-mobile hide-tablet">
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Awareness <span className="gradient-text">Pro</span></h2>
          </div>
        </Link>

        {session && (
          <Link href="/" title="Home Dashboard" className="hide-mobile hide-tablet" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            color: 'var(--text-secondary)', 
            transition: 'all 0.3s ease', 
            padding: '0.4rem 0.75rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)'
          }}>
            <Home size={16} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>HOME</span>
          </Link>
        )}

        <Link href="/wiki" title="Learning Hub" className="hide-mobile hide-tablet" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          color: 'var(--text-secondary)', 
          transition: 'all 0.3s ease', 
          padding: '0.4rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)'
        }}>
          <BookOpen size={16} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>WIKI</span>
        </Link>

        {session && (
          <Link href="/smishing" title="Smishing Simulator" className="hide-mobile hide-tablet" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            color: 'var(--text-secondary)', 
            transition: 'all 0.3s ease', 
            padding: '0.4rem 0.75rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lottie animationData={mobileWifiAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>PHONE DRILL</span>
          </Link>
        )}

        {session && (
          <Link href="/architect" title="Mission Designer" className="hide-mobile hide-tablet" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            color: 'var(--text-secondary)', 
            transition: 'all 0.3s ease', 
            padding: '0.4rem 0.75rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(255, 120, 0, 0.05)',
            border: '1px solid rgba(255, 120, 0, 0.2)'
          }}>
            <Hammer size={16} color="#FF7800" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FF7800' }}>ARCHITECT</span>
          </Link>
        )}

        <div style={{ position: 'relative' }} className="hide-mobile hide-tablet">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'var(--text-secondary)', 
              transition: 'all 0.3s ease', 
              padding: '0.4rem 0.75rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer'
            }}>
            <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '-2px' }}>
              <Lottie animationData={bellAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </button>

          {showNotifications && (
            <div className="glass" style={{
              position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
              width: '280px', padding: '1rem', borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 1000,
              border: '1px solid var(--glass-border)'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800 }}>NOTIFICATIONS</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>No new notifications</p>
            </div>
          )}
        </div>

        <Link href="/inbox" title="Live Drills" className="hide-mobile hide-tablet" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          color: 'var(--text-secondary)', 
          transition: 'all 0.3s ease', 
          padding: '0.4rem 0.75rem', 
          borderRadius: 'var(--radius-md)', 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          position: 'relative'
        }}>
          <Mail size={16} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>INBOX</span>
          <span className="pulse" style={{ 
            position: 'absolute', top: '2px', right: '2px', 
            width: '6px', height: '6px', background: '#ef4444', 
            borderRadius: '50%' 
          }}></span>
        </Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Link href="/leaderboard" title="Leaderboard" className="hide-mobile hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <TrophyIcon size={18} />
            </Link>

            <Link href="/achievements" title="Achievements" className="hide-mobile hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <Award size={18} />
            </Link>
            
            <div title="Daily Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', padding: '0.15rem 0.5rem 0.15rem 0.2rem', background: 'rgba(255, 120, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 120, 0, 0.2)' }}>
              <StreakIcon size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FF7800' }}>{session.user.streak || 0}</span>
            </div>
          </div>
        )}

        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--glass-border)' }}>
            <Link href="/settings" title="Settings" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <SettingsIcon size={18} />
            </Link>
            <div style={{ textAlign: 'right' }} className="hide-mobile hide-tablet">
              <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>@{session.user.username || 'user'}</p>
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
