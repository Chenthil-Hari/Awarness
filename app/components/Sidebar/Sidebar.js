'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingBag, User, Settings, 
  Trophy, BookOpen, Shield, LogOut, Zap, 
  Menu, X 
} from 'lucide-react';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/' },
    { icon: <Zap size={20} />, label: 'Neural Pass', href: '/#neural-pass' },
    { icon: <ShoppingBag size={20} />, label: 'Armory', href: '/shop' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', href: '/leaderboard' },
    { icon: <BookOpen size={20} />, label: 'Wiki', href: '/wiki' },
    { icon: <Shield size={20} />, label: 'Dossier', href: '/profile' },
  ];

  if (!session) return null;

  return (
    <aside className={`bento-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={24} />
        </div>
        {isOpen && (
          <span className="brand-name">
            CYBER <span className="accent">BRAIN</span>
            <div className="brand-sub">AWRNESS</div>
          </span>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <div className="nav-icon">{item.icon}</div>
            {isOpen && <span className="nav-label">{item.label}</span>}
            {pathname === item.href && <motion.div layoutId="active-indicator" className="active-indicator" />}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item">
          <Settings size={20} />
          {isOpen && <span className="nav-label">Settings</span>}
        </Link>
        <button onClick={() => signOut()} className="nav-item logout">
          <LogOut size={20} />
          {isOpen && <span className="nav-label">Sign Out</span>}
        </button>
      </div>

      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={16} /> : <Menu size={16} />}
      </button>
    </aside>
  );
}
