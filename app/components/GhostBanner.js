'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, X, User, Zap } from 'lucide-react';

export default function GhostBanner() {
  const [ghostUser, setGhostUser] = useState(null);

  useEffect(() => {
    const checkGhost = () => {
      const cookies = document.cookie.split('; ');
      const userId = cookies.find(c => c.startsWith('impersonate_user_id='))?.split('=')[1];
      const username = cookies.find(c => c.startsWith('impersonate_username='))?.split('=')[1];
      
      if (userId && username) {
        setGhostUser(decodeURIComponent(username));
      } else {
        setGhostUser(null);
      }
    };

    checkGhost();
    // Check every few seconds in case of manual cookie changes
    const interval = setInterval(checkGhost, 3000);
    return () => clearInterval(interval);
  }, []);

  const exitGhostMode = async () => {
    try {
      const res = await fetch('/api/admin/impersonate', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Failed to exit Ghost Mode');
    }
  };

  return (
    <AnimatePresence>
      {ghostUser && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            background: 'rgba(139, 92, 246, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'white', color: 'var(--accent-primary)', 
              padding: '0.4rem', borderRadius: '50%', display: 'flex' 
            }}>
              <Ghost size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>Ghost Mode Active</span>
              <span style={{ fontSize: '1rem', fontWeight: 900 }}>Viewing as @{ghostUser}</span>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

          <button 
            onClick={exitGhostMode}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(255,255,255,0.15)', color: 'white',
              padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
            }}
          >
            <Zap size={14} /> Return to Reality
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
