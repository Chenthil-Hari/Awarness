'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, Trophy, Shield, 
  Map as MapIcon, User, Settings,
  MessageSquare
} from 'lucide-react';
import './BottomDock.css';

const DOCK_ITEMS = [
  { id: 'dashboard', icon: <LayoutGrid size={24} />, label: 'SYSTEM', href: '/' },
  { id: 'pass', icon: <Shield size={24} />, label: 'PASS', href: '/neural-pass' },
  { id: 'armory', icon: <MapIcon size={24} />, label: 'ARMORY', href: '/armory' },
  { id: 'leaderboard', icon: <Trophy size={24} />, label: 'RANKINGS', href: '/leaderboard' },
  { id: 'wiki', icon: <MessageSquare size={24} />, label: 'INTEL', href: '/wiki' },
  { id: 'profile', icon: <User size={24} />, label: 'OPERATIVE', href: '/profile' },
  { id: 'settings', icon: <Settings size={24} />, label: 'CONFIG', href: '/settings' },
];

export default function BottomDock() {
  const pathname = usePathname();

  return (
    <div className="dock-container">
      <motion.div 
        className="dock-wrapper"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="dock-glass">
          {DOCK_ITEMS.map((item) => (
            <Link key={item.id} href={item.href} className="dock-item-link">
              <motion.div 
                className={`dock-item ${pathname === item.href ? 'active' : ''}`}
                whileHover={{ y: -10, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="dock-icon-wrapper">
                  {item.icon}
                </div>
                <span className="dock-label">{item.label}</span>
                {pathname === item.href && (
                  <motion.div 
                    layoutId="dock-active"
                    className="dock-active-dot"
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
