'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, AlertCircle, Loader2, Star, Zap, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const [username, setUsername] = useState('');
  const [checkStatus, setCheckStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session.user.username) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!username || username.length < 3) {
      setCheckStatus('idle');
      setMessage('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckStatus('checking');
      try {
        const res = await fetch('/api/user/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.available) {
          setCheckStatus('available');
          setMessage('Handle is available!');
        } else {
          setCheckStatus('taken');
          setMessage('This handle is already claimed');
        }
      } catch (err) {
        setCheckStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (checkStatus !== 'available' || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username })
      });
      
      if (res.ok) {
        // Explicitly update session
        await update({
          ...session,
          user: { ...session.user, username: username }
        });
        
        // Final verification before redirect
        setTimeout(() => {
          router.push('/');
          window.location.href = '/'; // Hard redirect for safety
        }, 500);
      }
    } catch (err) {
      alert('Failed to save username');
      setLoading(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: '#0a0a0b', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '480px', padding: '3rem', textAlign: 'center' }}
      >
        <div style={{ 
          width: '72px', height: '72px', background: 'var(--accent-primary)', 
          borderRadius: '20px', margin: '0 auto 2rem', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', color: 'white',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
        }}>
          <Shield size={36} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-1px' }}>
          Finalize Your <span className="gradient-text">Identity</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Welcome, Citizen. Before you enter the dashboard, please claim your unique handle to track your progress.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Choose Your Handle
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem' }}>@</span>
              <input 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="citizen_name"
                autoFocus
                disabled={loading}
                style={{
                  width: '100%', padding: '1rem 1rem 1rem 2.5rem', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  borderRadius: '14px', color: 'white', fontSize: '1.1rem', outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                className="focus-glow"
              />
              <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}>
                {checkStatus === 'checking' && <Loader2 className="spin" size={20} color="var(--accent-primary)" />}
                {checkStatus === 'available' && <Check size={20} color="var(--accent-success)" />}
                {checkStatus === 'taken' && <AlertCircle size={20} color="var(--accent-danger)" />}
              </div>
            </div>
            {message && (
              <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', color: checkStatus === 'available' ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {checkStatus === 'available' ? <Check size={14}/> : <AlertCircle size={14}/>} {message}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
              <Zap size={16} color="var(--accent-primary)" style={{ marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Unique ID</p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Required</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
              <Star size={16} color="var(--accent-secondary)" style={{ marginBottom: '0.4rem' }} />
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Rewards</p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Enabled</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={checkStatus !== 'available' || loading}
            className="btn-primary" 
            style={{ width: '100%', padding: '1.1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, gap: '0.75rem' }}
          >
            {loading ? <Loader2 size={20} className="spin" /> : <ArrowRight size={20} />}
            {loading ? 'Securing Your Identity...' : 'Confirm Identity & Enter'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
