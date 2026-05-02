'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Terminal, AlertCircle } from 'lucide-react';

export default function VoidTaunt({ isActive, onComplete }) {
  const [insult, setInsult] = useState("Your security protocols are... adorable.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isActive) {
      const fetchInsult = async () => {
        try {
          const res = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
          const data = await res.json();
          if (data && data.insult) {
            setInsult(data.insult);
          }
        } catch (error) {
          console.error("The Void is silent today.");
        } finally {
          setLoading(false);
        }
      };

      fetchInsult();
      
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        onComplete?.();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 2, 20, 0.85)',
            backdropFilter: 'blur(8px) contrast(1.5)',
          }}
        >
          {/* Glitch Overlay */}
          <div className="void-glitch-overlay" />
          
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#05010a',
              border: '2px solid #ff0055',
              boxShadow: '0 0 50px rgba(255, 0, 85, 0.3)',
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#ff0055' }}>
              <Skull size={32} className="shake" />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px' }}>UNAUTHORIZED INTERCEPT</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'monospace' }}>THE VOID HAS SPOKEN</div>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255, 0, 85, 0.05)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              borderLeft: '4px solid #ff0055',
              fontFamily: 'monospace',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#ffcce0',
              position: 'relative'
            }}>
              <Terminal size={14} style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.3 }} />
              {loading ? "DECRYPTING TRANSMISSION..." : `"${insult}"`}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,0,85,0.5)', fontFamily: 'monospace' }}>
                 ERROR_CODE: 0xDEADBEEF<br />
                 LOCATION: UNKNOWN_NODE
               </div>
               <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ff0055', display: 'flex', alignItems: 'center', gap: '5px' }}>
                 <AlertCircle size={14} /> CONNECTION COMPROMISED
               </div>
            </div>

            {/* Scanning line */}
            <div className="void-scan" />
          </motion.div>

          <style jsx>{`
            .void-glitch-overlay {
              position: absolute;
              inset: 0;
              background: repeating-linear-gradient(0deg, rgba(255,0,85,0.03) 0px, rgba(255,0,85,0.03) 1px, transparent 1px, transparent 2px);
              background-size: 100% 2px;
              pointer-events: none;
            }
            .shake { animation: shake 0.5s infinite; }
            @keyframes shake {
              0% { transform: translate(0,0); }
              25% { transform: translate(2px, -2px); }
              50% { transform: translate(-2px, 2px); }
              75% { transform: translate(2px, 2px); }
              100% { transform: translate(0,0); }
            }
            .void-scan {
              position: absolute;
              top: 0; left: 0; right: 0; height: 100%;
              background: linear-gradient(to bottom, transparent 0%, rgba(255,0,85,0.1) 50%, transparent 100%);
              animation: scan-vertical 3s linear infinite;
              pointer-events: none;
            }
            @keyframes scan-vertical {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
