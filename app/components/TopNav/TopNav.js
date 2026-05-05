'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Trophy, Shield, Map as MapIcon,
  User, Settings, BookOpen, Sword, Menu, X,
  Zap, LogOut, ChevronDown, Flame, ShoppingBag, Mail, Award
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';
import Lottie from 'lottie-react';
import fireAnim from '@/images/fire.json';
import './TopNav.css';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/', icon: <LayoutGrid size={16} /> },
  { label: 'Duels', href: '/duels', icon: <Sword size={16} /> },
  { label: 'Heist', href: '/heist', icon: <MapIcon size={16} /> },
  { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={16} /> },
  { label: 'Wiki', href: '/wiki', icon: <BookOpen size={16} /> },
  { label: 'Shop', href: '/shop', icon: <ShoppingBag size={16} /> },
];

export default function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (session?.user?.xp !== undefined) {
      setXp(session.user.xp);
      setLevel(calculateLevel(session.user.xp));
    }
  }, [session]);

  useEffect(() => {
    const handleXpUpdate = (e) => {
      setXp(e.detail.xp);
      setLevel(calculateLevel(e.detail.xp));
    };
    window.addEventListener('xp-update', handleXpUpdate);
    return () => window.removeEventListener('xp-update', handleXpUpdate);
  }, []);

  const xpPct = (xp % 1000) / 10; // % within current level

  if (!session) return null;

  return (
    <>
      <nav className="topnav">
        {/* Logo */}
        <Link href="/" className="topnav-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">CYBER<span className="logo-accent">BRAIN</span></span>
        </Link>

        {/* Center Links */}
        <div className="topnav-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`topnav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div layoutId="nav-indicator" className="nav-indicator" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="topnav-right">
          {/* XP / Level Pill */}
          <div className="xp-pill">
            <div className="xp-pill-level">LV {level}</div>
            <div className="xp-pill-bar-track">
              <motion.div
                className="xp-pill-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="xp-pill-val">{xp} XP</div>
          </div>

          {/* Streak */}
          <div className="streak-badge">
            <div className="streak-lottie">
              <Lottie animationData={fireAnim} loop={true} />
            </div>
            <span>{session.user.streak || 0}</span>
          </div>

          {/* User Avatar Dropdown */}
          <div className="user-menu-wrapper">
            <button
              className="user-avatar-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="avatar-circle">
                {session.user.image ? (
                  <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (session.user.username || 'O')[0].toUpperCase()
                )}
              </div>
              <span className="avatar-name">{session.user.username || 'Operative'}</span>
              <motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }}>
                <ChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  className="user-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link href="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={15} /> Profile
                  </Link>
                  <Link href="/inbox" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Mail size={15} /> Live Drills
                  </Link>
                  <Link href="/achievements" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Award size={15} /> Achievements
                  </Link>
                  <Link href="/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={() => signOut()}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            <div className="mobile-drawer-header">
              <span className="logo-text">CYBER<span className="logo-accent">BRAIN</span></span>
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <div className="mobile-drawer-links">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mobile-link ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="mobile-divider" />
              <button className="mobile-link danger" onClick={() => signOut()}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mobileOpen && <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
