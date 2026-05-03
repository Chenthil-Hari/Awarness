'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, Trophy, Shield, 
  Map as MapIcon, User, Settings,
  MessageSquare, ChevronUp
} from 'lucide-react';
import './CommandPill.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'SYSTEM', href: '/' },
  { id: 'pass', icon: <Shield size={20} />, label: 'PASS', href: '/neural-pass' },
  { id: 'armory', icon: <MapIcon size={20} />, label: 'ARMORY', href: '/armory' },
  { id: 'leaderboard', icon: <Trophy size={20} />, label: 'RANKINGS', href: '/leaderboard' },
  { id: 'wiki', icon: <MessageSquare size={20} />, label: 'INTEL', href: '/wiki' },
  { id: 'profile', icon: <User size={20} />, label: 'OPERATIVE', href: '/profile' },
  { id: 'settings', icon: <Settings size={20} />, label: 'CONFIG', href: '/settings' },
];

export default function CommandPill() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const active = NAV_ITEMS.find(i => i.href === pathname);

  return (
    <div className="cmd-pill-container">
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="cmd-pill-nav"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`cmd-nav-item ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsExpanded(false)}
              >
                <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.9 }}>
                  <div className="cmd-nav-icon">{item.icon}</div>
                  <span className="cmd-nav-label">{item.label}</span>
                  {pathname === item.href && (
                    <motion.div layoutId="cmd-active" className="cmd-active-dot" />
                  )}
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="cmd-pill-trigger"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <span className="cmd-pill-icon">
          {active ? active.icon : <LayoutGrid size={18} />}
        </span>
        <span className="cmd-pill-text">{active?.label || 'SYSTEM'}</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronUp size={16} />
        </motion.span>
      </motion.button>
    </div>
  );
}
