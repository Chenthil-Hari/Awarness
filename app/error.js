'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, ArrowLeft, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Crash:', error);
  }, [error]);

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: '#050101', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '3rem',
          borderRadius: '32px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          backdropFilter: 'blur(10px)',
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
          color: '#ef4444',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={40} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
          System <span style={{ color: '#ef4444' }}>Fault</span> Detected
        </h1>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          The neural link encountered an unexpected anomaly. Our sentinels have been notified of this protocol failure.
        </p>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '2.5rem',
          fontSize: '0.8rem',
          color: '#ef4444',
          fontFamily: 'monospace',
          textAlign: 'left',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          <span style={{ opacity: 0.5 }}>ERROR_TRACE:</span> {error.message || 'Unknown Protocol Error'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => reset()}
            style={{
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
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={20} /> Reload Operation
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft size={18} /> Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Home size={18} /> Home Base
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
