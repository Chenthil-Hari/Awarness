'use client';

import { ShieldAlert, Wallet, Heart, Zap, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  ShieldAlert: <ShieldAlert size={24} />,
  Wallet: <Wallet size={24} />,
  Heart: <Heart size={24} />,
  Zap: <Zap size={24} />
};

export default function ScenarioCard({ scenario, onSelect }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card" 
      style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        height: '100%'
      }}
      onClick={() => onSelect(scenario)}
    >
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: 'var(--radius-md)',
        background: scenario.domain === 'Cybersecurity' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(6, 182, 212, 0.15)',
        color: scenario.domain === 'Cybersecurity' ? 'var(--accent-primary)' : 'var(--accent-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {iconMap[scenario.icon] || <Zap size={24} />}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ 
            fontSize: '0.7rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            color: 'var(--text-secondary)',
            fontWeight: 700 
          }}>{scenario.domain}</span>
          <span style={{ 
            fontSize: '0.7rem', 
            padding: '2px 8px', 
            background: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)'
          }}>{scenario.difficulty}</span>
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{scenario.title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {scenario.description}
        </p>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ 
              width: '12px', 
              height: '4px', 
              borderRadius: '2px', 
              background: i <= (scenario.difficulty === 'Beginner' ? 1 : 2) ? 'var(--accent-primary)' : 'var(--bg-tertiary)' 
            }} />
          ))}
        </div>
        <button className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={16} fill="white" />
          Start
        </button>
      </div>
    </motion.div>
  );
}
