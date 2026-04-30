'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, Sparkles } from 'lucide-react';

export default function IntelFragment({ id, title, xp = 100, onCollect }) {
  const [collected, setCollected] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleCollect = async () => {
    if (collected) return;
    
    setCollected(true);
    try {
      const res = await fetch('/api/intel/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intelId: id, xp })
      });
      
      if (res.ok) {
        if (onCollect) onCollect(id);
      }
    } catch (err) {
      console.error("Failed to collect intel");
    }
  };

  return (
    <div style={{ margin: '2rem 0', position: 'relative' }}>
      <AnimatePresence>
        {!collected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleCollect}
            style={{
              padding: '1.5rem',
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px dashed var(--accent-primary)',
              borderRadius: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glitch Overlay */}
            {isHovering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                  zIndex: 0
                }}
              />
            )}

            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'var(--accent-primary)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
              color: 'white',
              zIndex: 1
            }}>
              <Database size={24} />
            </div>

            <div style={{ flex: 1, zIndex: 1 }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Intel Fragment Detected</span>
              <h4 style={{ margin: '0.2rem 0', fontWeight: 800 }}>{title}</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click to decrypt and neutralize this data packet.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
              <Zap size={14} color="var(--accent-warning)" />
              <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>{xp} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {collected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid var(--accent-success)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--accent-success)'
          }}
        >
          <Sparkles size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>INTEL NEUTRALIZED: {title} decrypted.</span>
        </motion.div>
      )}
    </div>
  );
}
