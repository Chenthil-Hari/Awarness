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
        const res = await fetch(`/api/config/public?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const config = await res.json();
          setIsMaintenance(config.maintenanceMode);
          setMaintenanceUntil(config.maintenanceUntil);
        }
      } catch (err) {
        console.error("Maintenance Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 5000); // 5 second pulse
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
        color: 'white',
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        fontFamily: 'var(--font-outfit)'
      }}>
        {/* Animated Background Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(124, 58, 237, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.5,
          perspective: '1000px',
          transform: 'rotateX(60deg) translateY(-200px)',
          zIndex: 0
        }} />

        {/* Ambient Glows */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 1 }} />

        <div style={{ maxWidth: '1000px', width: '100%', padding: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem', justifyContent: 'center' }}>
            
            {/* Visual Terminal Side */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ flex: '1', minWidth: '350px', position: 'relative' }}
            >
              <div style={{ 
                position: 'relative',
                borderRadius: '32px',
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                overflow: 'hidden'
              }}>
                <img 
                  src="/images/freepik__talk__75941.png" 
                  alt="Neural Recalibration"
                  style={{ width: '100%', height: 'auto', borderRadius: '24px', opacity: 0.8 }}
                />
                
                {/* Scanning Line Animation */}
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                    boxShadow: '0 0 15px var(--accent-primary)',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Status Pings */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '1px' }}>CORE_UPTIME: 99.9%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  <div className="pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '1px' }}>RECALIBRATING...</span>
                </div>
              </div>
            </motion.div>

            {/* Information Side */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              style={{ flex: '1', minWidth: '350px', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <ShieldAlert size={28} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '3px', textTransform: 'uppercase' }}>Protocol 404_SECURE</span>
              </div>

              <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 0.9, letterSpacing: '-0.05em' }}>
                NEURAL <br/> <span className="gradient-text">UPGRADE</span>
              </h1>
              
              <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '450px' }}>
                The training mainframe is currently undergoing a deep-sector optimization. We are deploying new security layers and mission content.
              </p>

              <div style={{ 
                padding: '2.5rem', 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', 
                borderRadius: '32px', 
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-primary)' }} />
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1rem' }}>Uplink Available In</p>
                
                {maintenanceUntil ? (
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{new Date(maintenanceUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>TARGET_DATE</p>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '40px', alignSelf: 'center' }} />
                    <div>
                      <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{new Date(maintenanceUntil).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: '0.2rem' }}>TARGET_TIME</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--accent-warning)' }}>CALCULATING...</p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '3rem', opacity: 0.3 }}>
                <div style={{ width: '30px', height: '1px', background: 'white' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px' }}>CYBER_BRAIN COMMAND SYSTEM</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    );
  }

  return children;
}
