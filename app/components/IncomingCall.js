'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export default function IncomingCall({ scenario, onAction }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.15, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [controls]);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Incoming Call Label */}
      <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        📞 Incoming Call
      </p>

      {/* Avatar Pulse */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={controls}
          style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.25)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          style={{
            position: 'absolute',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.35)',
          }}
        />
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {scenario.avatar}
        </div>
      </div>

      {/* Caller Info */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.25rem 0' }}>
          {scenario.sender}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{scenario.number}</p>
        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.5rem 0 0 0', lineHeight: 1.4, padding: '0 0.5rem' }}>
          {scenario.content}
        </p>
      </div>

      {/* Accept / Decline */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction('decline')}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ef4444',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 20px rgba(239,68,68,0.5)',
          }}
        >
          📵
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAction('accept')}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#10b981',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 20px rgba(16,185,129,0.5)',
          }}
        >
          📞
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '3rem', marginTop: '0.25rem' }}>
        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>DECLINE</p>
        <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>ACCEPT</p>
      </div>
    </motion.div>
  );
}
