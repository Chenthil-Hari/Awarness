import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Shield, LogOut, Home, BookOpen, Mail, Bell, Award, Hammer, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import StreakIcon from './StreakIcon';
import TrophyIcon from './TrophyIcon';
import LevelIcon from './LevelIcon';
import ProfileIcon from './ProfileIcon';
import SettingsIcon from './SettingsIcon';
import GooeyNav from './GooeyNav/GooeyNav';
import { calculateLevel } from '@/lib/game';

export default function Navbar({ score = null, level = null }) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  
  // Real-time level tracking
  const [currentLevel, setCurrentLevel] = useState(level || 1);

  useEffect(() => {
    // Sync with prop if provided
    if (level !== null) {
      setCurrentLevel(level);
    } else if (session?.user?.xp !== undefined) {
      setCurrentLevel(calculateLevel(session.user.xp));
    }
  }, [session, level]);

  useEffect(() => {
    const handleXpUpdate = (e) => {
      const { xp } = e.detail;
      const newLevel = calculateLevel(xp);
      setCurrentLevel(newLevel);
    };

    window.addEventListener('xp-update', handleXpUpdate);
    return () => window.removeEventListener('xp-update', handleXpUpdate);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Wiki', href: '/wiki' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Shop', href: '/shop' },
    { label: 'Duels', href: '/duels' },
    { label: 'Inbox', href: '/inbox' },
    { label: 'Heist', href: '/heist' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const activeIndex = navItems.findIndex(item => item.href === pathname);

  // Right side content (Level, Streak, Profile)
  const RightSide = (
    <>
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
        <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>Lvl {currentLevel}</span>
      </div>

      {session && (
        <div title="Daily Streak" style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', padding: '0.15rem 0.5rem 0.15rem 0.2rem', background: 'rgba(255, 120, 0, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 120, 0, 0.2)' }}>
          <StreakIcon size={18} />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FF7800' }}>{session.user.streak || 0}</span>
        </div>
      )}

      {session ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--glass-border)' }}>
          <Link href="/settings" title="Settings" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)' }}>
            <SettingsIcon size={18} />
          </Link>
          <Link href="/profile" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', overflow: 'hidden', flexShrink: 0 }}>
            <ProfileIcon size={24} />
          </Link>
        </div>
      ) : (
        <Link href="/auth/login" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          Sign In
        </Link>
      )}
    </>
  );

  return (
    <GooeyNav
      items={navItems}
      initialActiveIndex={activeIndex >= 0 ? activeIndex : 0}
      rightContent={RightSide}
    />
  );
}
