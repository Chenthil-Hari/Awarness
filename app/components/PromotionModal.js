'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, X, ShieldCheck, Sparkles, Medal } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PromotionModal({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Check if we should show the modal (e.g. if the user just leveled up)
  useEffect(() => {
    const lastSeenLeague = localStorage.getItem('last_seen_league');
    if (user?.league && lastSeenLeague && lastSeenLeague !== user.league) {
      setShow(true);
    }
    localStorage.setItem('last_seen_league', user?.league || 'Bronze');
  }, [user]);

  if (!show) return null;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'LEAGUE_PROMOTION',
          metadata: { newLeague: user.league }
        })
      });
      const data = await res.json();
      if (data.pdfUrl) window.open(data.pdfUrl, '_blank');
    } catch (error) {
      console.error("Failed to generate promotion order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '500px',
            background: '#0a0b10',
            border: '1px solid var(--accent-primary)',
            borderRadius: '32px',
            padding: '3rem',
            position: 'relative',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)'
          }}
        >
          <button 
            onClick={() => setShow(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>

          <div style={{ marginBottom: '2rem' }}>
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ display: 'inline-block' }}
            >
              <div style={{ 
                width: '100px', height: '100px', background: 'var(--accent-primary)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px var(--accent-primary)'
              }}>
                <Medal size={50} color="white" />
              </div>
            </motion.div>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>LEAGUE GRADUATION</h2>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem', letterSpacing: '2px' }}>
            {user.league?.toUpperCase()} PROTOCOL REACHED
          </p>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Attention, Operative. You have exceeded the training requirements for your previous sector. 
            The High Command has issued a formal Promotion Order for your file.
          </p>

          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 900,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'GENERATING ORDER...' : <><Download size={20} /> DOWNLOAD PROMOTION ORDER</>}
          </button>

          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
            ENCRYPTED DATA LINK: GDI-SEC-7742
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
