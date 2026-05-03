'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Target, Activity, MessageSquare, 
  Map as MapIcon, ShoppingBag, User, Settings, 
  Bell, ChevronUp, ChevronDown, WiFi, Battery, Volume2, Mail as MailIcon 
} from 'lucide-react';
import NeuralMail from '../NeuralMail';
import { INITIAL_MAILS } from '../data/neuralMail';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { calculateLevel } from '@/lib/game';
import './HUD.css';

export default function HUD() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [isCommsOpen, setIsCommsOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(INITIAL_MAILS.filter(m => !m.isRead).length);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "GDI Command: Welcome back, Operative.", time: "Just now" },
    { id: 2, text: "System: Tactical map updated.", time: "2m ago" }
  ]);

  useEffect(() => {
    if (session?.user?.xp !== undefined) {
      setXp(session.user.xp);
      setLevel(calculateLevel(session.user.xp));
    }

    const handleXpUpdate = (e) => {
      const newXp = e.detail.xp;
      setXp(newXp);
      setLevel(calculateLevel(newXp));
    };

    window.addEventListener('xp-update', handleXpUpdate);
    return () => window.removeEventListener('xp-update', handleXpUpdate);
  }, [session]);

  const xpInCurrentLevel = xp % 100; // Assuming 100 XP per level for simple visual
  const xpPercentage = xpInCurrentLevel; 

  const navItems = [
    { icon: <MapIcon size={20} />, label: 'DEPLOY', href: '/' },
    { icon: <ShoppingBag size={20} />, label: 'ARMORY', href: '/shop' },
    { icon: <User size={20} />, label: 'DOSSIER', href: '/profile' },
    { icon: <Settings size={20} />, label: 'SYSTEM', href: '/settings' },
  ];

  if (!session) return null;

  return (
    <div className="hud-container">
      {/* --- TOP HUD --- */}
      <header className="hud-header">
        <div className="hud-top-left">
          <div className="hud-profile-frame">
            <div className="hud-avatar">
              <User size={24} color="var(--accent-primary)" />
            </div>
            <div className="hud-user-info">
              <span className="hud-username">{session.user.username || 'RECRUIT'}</span>
              <span className="hud-rank">RANK: {session.user.league || 'BRONZE'}</span>
            </div>
          </div>
          <div className="hud-level-badge">
             <span className="hud-level-val">{level}</span>
             <span className="hud-level-label">LVL</span>
          </div>
        </div>

        <div className="hud-top-center">
          <div className="hud-xp-container">
            <div className="hud-xp-header">
              <span className="hud-xp-label">NEURAL LINK STABILITY</span>
              <span className="hud-xp-val">{xpPercentage}%</span>
            </div>
            <div className="hud-xp-bar-outer">
              <motion.div 
                className="hud-xp-bar-inner"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
              <div className="hud-xp-bar-grid" />
            </div>
          </div>
        </div>

        <div className="hud-top-right">
          <div className="hud-stat-box credits">
            <Zap size={16} color="var(--accent-warning)" />
            <div className="hud-stat-content">
               <span className="hud-stat-val">{session.user.xp || 0}</span>
               <span className="hud-stat-label">CREDITS</span>
            </div>
          </div>
          <div className="hud-stat-box streak">
            <Activity size={16} color="var(--accent-success)" />
            <div className="hud-stat-content">
               <span className="hud-stat-val">{session.user.streak || 1}D</span>
               <span className="hud-stat-label">STABILITY</span>
            </div>
          </div>

          {/* --- SYSTEM TRAY --- */}
          <div className="hud-system-tray">
            <div className="tray-icon sync-active">
              <WiFi size={14} />
              <span className="tray-tooltip">NEURAL SYNC: STABLE</span>
            </div>
            <div className="tray-icon battery-optimal">
              <Battery size={14} />
              <span className="tray-tooltip">ENERGY: 100%</span>
            </div>
            <div className="tray-icon" onClick={() => setIsMailOpen(true)}>
              <MailIcon size={14} />
              {unreadCount > 0 && <div className="tray-badge">{unreadCount}</div>}
              <span className="tray-tooltip">NEURAL MAIL</span>
            </div>
            <div className="tray-icon">
              <Volume2 size={14} />
            </div>
            <div className="tray-clock">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
          </div>
        </div>
      </header>

      {/* --- BOTTOM HUD --- */}
      <footer className="hud-footer">
        <div className={`hud-comms-relay ${isCommsOpen ? 'open' : ''}`}>
          <div className="hud-comms-header" onClick={() => setIsCommsOpen(!isCommsOpen)}>
            <MessageSquare size={18} />
            <span>COMMS RELAY</span>
            {isCommsOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
          <AnimatePresence>
            {isCommsOpen && (
              <motion.div 
                className="hud-comms-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {notifications.map(n => (
                  <div key={n.id} className="hud-notification">
                    <span className="hud-notif-text">{n.text}</span>
                    <span className="hud-notif-time">{n.time}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="hud-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`hud-nav-item ${pathname === item.href ? 'active' : ''}`}>
              <div className="hud-nav-icon">{item.icon}</div>
              <span className="hud-nav-label">{item.label}</span>
              {pathname === item.href && <motion.div layoutId="hud-nav-active" className="hud-nav-active-indicator" />}
            </Link>
          ))}
        </nav>
      </footer>

      {/* Decorative Glitch Elements */}
      <div className="hud-vignette" />
      <div className="hud-scanlines" />

      <NeuralMail 
        isOpen={isMailOpen} 
        onClose={() => setIsMailOpen(false)} 
      />
    </div>
  );
}
