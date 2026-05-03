'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Award, ShieldCheck, Globe, X, Check, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function NeuralProUpgrade({ isOpen, onClose }) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const perks = [
    { icon: <Zap size={20} color="#fbbf24" />, title: 'Double XP Multiplier', desc: 'Accelerate your neural evolution 2x faster.' },
    { icon: <Crown size={20} color="#8b5cf6" />, title: 'Premium Battle Pass', desc: 'Unlock the exclusive Gold track rewards.' },
    { icon: <ShieldCheck size={20} color="#10b981" />, title: 'Unlimited Certificates', desc: 'Claim professional credentials for any domain.' },
    { icon: <Globe size={20} color="#3b82f6" />, title: 'Early Access', desc: 'Be the first to neutralizing new breach events.' }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    // Mocking the upgrade process
    try {
      const res = await fetch('/api/user/upgrade-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        await update(); // Sync session
        onClose();
        // Trigger a celebratory event
        window.dispatchEvent(new CustomEvent('pro-activated'));
      }
    } catch (err) {
      console.error("Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} 
          style={{ position: 'absolute', inset: 0, background: 'rgba(5, 7, 10, 0.9)', backdropFilter: 'blur(15px)' }} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            background: 'linear-gradient(145deg, #11111a, #0a0a0f)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '32px',
            padding: '3rem 2.5rem',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(139, 92, 246, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Sparkles */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150px', height: '150px', background: 'var(--accent-primary)', filter: 'blur(80px)', opacity: 0.1 }} />
          
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
            <X size={24} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              width: '70px', height: '70px', background: 'rgba(139, 92, 246, 0.1)', 
              borderRadius: '20px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent-primary)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <Crown size={36} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>NEURAL <span className="gradient-text">PRO</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Ascend to the highest tier of operative excellence.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            {perks.map((perk, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ marginTop: '0.2rem' }}>{perk.icon}</div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'white' }}>{perk.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '1px' }}>MONTHLY SYNC</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>$9.99<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mo</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', padding: '4px 10px', borderRadius: '1rem' }}>BEST VALUE</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: '16px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)'
            }}
          >
            {loading ? 'SYNCHRONIZING...' : <><Sparkles size={20} /> UPGRADE NOW</>}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Cancel anytime. Neural integrity guaranteed.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
