'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldAlert, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MaintenanceGuard({ children }) {
  const { data: session, status } = useSession();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceUntil, setMaintenanceUntil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`/api/config/public?t=${Date.now()}`);
        if (res.ok) {
          const config = await res.json();
          setIsMaintenance(config.maintenanceMode);
          setMaintenanceUntil(config.maintenanceUntil);
        }
      } catch (err) {
        console.error("Maintenance check failed");
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Admins always bypass maintenance
  const isExcluded = session?.user?.role === 'admin';

  if (!loading && isMaintenance && !isExcluded) {
    const formattedDate = maintenanceUntil ? new Date(maintenanceUntil).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'TBD';

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
        zIndex: 99999,
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ marginBottom: '2rem' }}
          >
            <div style={{ 
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto 3rem',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <img 
                src="/images/freepik__talk__75941.png" 
                alt="System Maintenance"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.05em' }}>
              SYSTEM <span className="gradient-text">RECALIBRATION</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              We are currently enhancing the Neural Network to provide a more secure and immersive training experience.
            </p>

            <div style={{ 
              padding: '2rem', 
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(6, 182, 212, 0.1))', 
              borderRadius: '24px', 
              border: '1px solid rgba(124, 58, 237, 0.2)',
              marginBottom: '3rem'
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>Estimated Return</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{formattedDate}</p>
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
