'use client';

import { motion } from 'framer-motion';
import { Ghost, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '4rem 3rem',
          borderRadius: '40px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ 
            width: '100px', 
            height: '100px', 
            background: 'rgba(139, 92, 246, 0.1)', 
            borderRadius: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 2.5rem',
            color: 'var(--accent-primary)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
          }}
        >
          <Ghost size={50} />
        </motion.div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>
          Ghost in the Machine
        </h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1rem' }}>
          The sector you are trying to access does not exist in our mainframe. It may have been purged or moved to a secure layer.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Home size={22} /> Return Home
            </motion.button>
          </Link>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: '1.2rem',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={18} /> Re-scan Previous Sector
          </button>
        </div>
      </motion.div>
    </main>
  );
}
