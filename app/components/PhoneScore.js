'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TIER_CONFIG = {
  Unhackable: { color: '#10b981', emoji: '🛡️', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  Secure: { color: '#06b6d4', emoji: '🔐', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
  Cautious: { color: '#f59e0b', emoji: '⚠️', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  Vulnerable: { color: '#ef4444', emoji: '🚨', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

export default function PhoneScore({ result, onRetry }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = TIER_CONFIG[result.tier] || TIER_CONFIG.Vulnerable;

  // Animate score counting up
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(result.score / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= result.score) {
        setAnimatedScore(result.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [result.score]);

  // SVG circle progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (result.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1rem 0.75rem',
        overflowY: 'auto',
        maxHeight: '100%',
      }}
    >
      {/* Score Circle */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={50} cy={50} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
          <motion.circle
            cx={50} cy={50} r={radius} fill="none"
            stroke={config.color} strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <p style={{ fontSize: '1.6rem', fontWeight: 900, color: config.color, margin: 0, lineHeight: 1 }}>
            {animatedScore}
          </p>
          <p style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 700, margin: 0 }}>/ 100</p>
        </div>
      </div>

      {/* Tier Badge */}
      <div style={{
        padding: '0.4rem 1rem',
        borderRadius: '2rem',
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        <span>{config.emoji}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: config.color }}>{result.tier}</span>
      </div>

      {/* XP Earned */}
      <div style={{ textAlign: 'center' }}>
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          style={{ fontSize: '1.1rem', fontWeight: 900, color: '#8b5cf6', margin: 0 }}
        >
          +{result.earnedXP} XP
        </motion.p>
        <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0 }}>Earned this session</p>
      </div>

      {/* Breakdown */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Decision Log
        </p>
        {result.breakdown.map((item, i) => (
          <motion.div
            key={item.scenarioId}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            style={{
              padding: '0.5rem 0.6rem',
              borderRadius: '0.6rem',
              background: item.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${item.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flexShrink: 0, fontSize: '0.9rem' }}>{item.isCorrect ? '✅' : '❌'}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.15rem 0' }}>
                {item.sender} — You chose: <span style={{ color: item.isCorrect ? '#10b981' : '#ef4444' }}>{item.userAction.toUpperCase()}</span>
              </p>
              <p style={{ fontSize: '0.6rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                {item.explanation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Retry Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        style={{
          width: '100%',
          padding: '0.7rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          border: 'none',
          color: 'white',
          fontWeight: 800,
          fontSize: '0.8rem',
          cursor: 'pointer',
          marginTop: '0.5rem',
        }}
      >
        🔄 Try Again
      </motion.button>
    </motion.div>
  );
}
