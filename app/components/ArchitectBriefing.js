'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, AlertTriangle, ChevronRight, X } from 'lucide-react';
import ScrambleText from './ScrambleText';

export default function ArchitectBriefing({ user }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 2 seconds
    const timer = setTimeout(() => {
      const lastSeen = localStorage.getItem('architect_briefing_last_seen');
      const now = Date.now();
      // Show if not seen in the last hour
      if (!lastSeen || now - parseInt(lastSeen) > 3600000) {
        setIsVisible(true);
        localStorage.setItem('architect_briefing_last_seen', now.toString());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, x: 20 }}
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            zIndex: 2000,
            maxWidth: '380px',
            width: 'calc(100% - 4rem)'
          }}
        >
          <div className="glass-card" style={{
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(30px)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '32px', height: '32px', background: 'rgba(139, 92, 246, 0.2)', 
                  borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Terminal size={18} color="var(--accent-primary)" />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--accent-primary)' }}>THE ARCHITECT</span>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                <ScrambleText text={`NEURAL SYNC: STABLE`} delay={500} />
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Operative <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{user?.username}</span>, 
                system integrity is holding. I have identified a critical training gap in your **Cybersecurity** nodes. 
                I suggest stabilizing the "Neural Pass" immediately.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>THREAT LEVEL</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '4px', flex: 1, background: i <= 2 ? 'var(--accent-warning)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsVisible(false);
                  document.getElementById('neural-pass')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                }}
              >
                INITIATE <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
