'use client';

import { motion } from 'framer-motion';

export default function SmishingMessage({ scenario, onAction }) {
  const actions =
    scenario.type === 'notification'
      ? [
          { label: 'Clear', action: 'ignore', color: '#64748b', emoji: '✕' },
          { label: 'Block App', action: 'block', color: '#ef4444', emoji: '🚫' },
          { label: 'Open', action: 'reply', color: '#8b5cf6', emoji: '↗' },
        ]
      : [
          { label: 'Block', action: 'block', color: '#ef4444', emoji: '🚫' },
          { label: 'Ignore', action: 'ignore', color: '#64748b', emoji: '✕' },
          { label: 'Reply', action: 'reply', color: '#10b981', emoji: '↩' },
        ];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      {/* Message Bubble */}
      <div
        style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Sender Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {scenario.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              {scenario.sender}
            </p>
            <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0 }}>
              {scenario.number} · Just now
            </p>
          </div>
          <span
            style={{
              fontSize: '0.6rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '1rem',
              background: scenario.type === 'notification' ? 'rgba(6,182,212,0.2)' : 'rgba(139,92,246,0.2)',
              color: scenario.type === 'notification' ? '#06b6d4' : '#8b5cf6',
              fontWeight: 700,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {scenario.type === 'notification' ? '🔔 App' : '💬 SMS'}
          </span>
        </div>

        {/* Message Content */}
        <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: '#cbd5e1', margin: 0 }}>
          {scenario.content}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {actions.map((a) => (
          <motion.button
            key={a.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(a.action)}
            style={{
              flex: 1,
              padding: '0.6rem 0.25rem',
              borderRadius: '0.75rem',
              border: `1px solid ${a.color}44`,
              background: `${a.color}22`,
              color: a.color,
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>{a.emoji}</span>
            {a.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
