'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, BookOpen, Mail, User, Trophy, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, href: '/' },
    { name: 'Wiki', icon: <BookOpen size={20} />, href: '/wiki' },
    { name: 'Duels', icon: <Swords size={20} />, href: '/duels' },
    { name: 'Inbox', icon: <Mail size={20} />, href: '/inbox' },
    { name: 'Profile', icon: <User size={20} />, href: '/profile' },
  ];

  return (
    <div className="show-mobile-tablet" style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '500px',
      zIndex: 1000,
    }}>
      <nav style={{
        background: 'rgba(15, 15, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.5rem',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.3s ease',
                flex: 1,
                position: 'relative'
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div style={{
                color: isActive ? 'var(--accent-primary)' : 'inherit',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s ease'
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: isActive ? 800 : 500,
                opacity: isActive ? 1 : 0.7
              }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
