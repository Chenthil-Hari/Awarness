'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldAlert, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceGuard({ children }) {
  const { data: session, status } = useSession();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch('/api/config/public');
        if (res.ok) {
          const config = await res.json();
          setIsMaintenance(config.maintenanceMode);
        }
      } catch (err) {
        console.error("Maintenance check failed");
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    // Poll every 30 seconds for state changes
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Admins always bypass maintenance
  const isExcluded = session?.user?.role === 'admin';

  if (!loading && isMaintenance && !isExcluded) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        background: '#020617', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        color: 'white',
        textAlign: 'center',
        position: 'fixed',
        inset: 0,
        zIndex: 99999
      }}>
        <div style={{ maxWidth: '600px' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(124, 58, 237, 0.1)', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 2rem',
              border: '1px solid var(--accent-primary)',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)'
            }}>
              <ShieldAlert size={40} color="var(--accent-primary)" />
            </div>
            
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.05em' }}>
              SYSTEM <span className="gradient-text">OFFLINE</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              The Neural Network is currently undergoing scheduled recalibration. We are optimizing security protocols to better serve the community.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>Current Phase</p>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 800 }}>Core Hardening</p>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-secondary)', textTransform: 'uppercase' }}>ETA</p>
                <p style={{ margin: '0.5rem 0 0', fontWeight: 800 }}>60-90 Minutes</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: 0.5 }}>
              <Zap size={14} color="var(--accent-warning)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' }}>AWARENESS_PRO SECURE UPLINK</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return children;
}
