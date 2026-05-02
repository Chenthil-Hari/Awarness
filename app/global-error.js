'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        background: '#050101', 
        color: 'white', 
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            maxWidth: '500px', 
            width: '100%', 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '3rem',
            borderRadius: '32px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2rem',
            color: '#ef4444'
          }}>
            <ShieldAlert size={40} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>
            Critical System <span style={{ color: '#ef4444' }}>Failure</span>
          </h1>
          
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            The application has encountered a catastrophic core anomaly. The root layout has been compromised.
          </p>

          <button
            onClick={() => reset()}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            <RefreshCw size={20} /> Attempt Core Restart
          </button>
        </motion.div>
      </body>
    </html>
  );
}
