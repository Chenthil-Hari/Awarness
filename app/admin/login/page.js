'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError('Invalid Administrative Credentials');
        setLoading(false);
      } else {
        // Success - double check role on redirect
        router.push('/admin');
      }
    } catch (err) {
      setError('System connection failed');
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="flex-center" style={{ flex: 1, padding: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ 
            width: '100%', 
            maxWidth: '450px', 
            padding: '3rem', 
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
            textAlign: 'center'
          }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--accent-primary)', 
            borderRadius: 'var(--radius-xl)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem',
            color: 'white',
            boxShadow: '0 10px 20px rgba(139, 92, 246, 0.4)'
          }}>
            <Shield size={40} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Admin <span className="gradient-text">Portal</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2.5rem' }}>
            Restricted Access Zone. Authorization required.
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--accent-danger)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '2rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required
                type="email" 
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required
                type="password" 
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1rem 1rem 3rem', 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1.2rem', 
                marginTop: '1rem',
                boxShadow: '0 10px 20px rgba(139, 92, 246, 0.2)'
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: 800 }}>
                  Initiate Override <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          <p style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Secure Session Monitoring Active
          </p>
        </motion.div>
      </div>
    </main>
  );
}
