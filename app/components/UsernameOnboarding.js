'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, AlertCircle, Loader2, Star, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UsernameOnboarding({ isOpen, onComplete }) {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('idle'); // idle, checking, available, taken, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!username || username.length < 3) {
      setStatus('idle');
      setMessage('');
      return;
    }

    const timer = setTimeout(async () => {
      setStatus('checking');
      try {
        const res = await fetch('/api/user/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.available) {
          setStatus('available');
          setMessage('Handle is available!');
        } else {
          setStatus('taken');
          setMessage('This handle is already claimed');
        }
      } catch (err) {
        setStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'available') return;

    setLoading(true);
    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username })
      });
      
      if (res.ok) {
        // Update the local session state
        await update({
          ...session,
          user: { ...session.user, username: username }
        });
        
        onComplete();
        
        // Force a hard reload to ensure all components see the new username
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (err) {
      alert('Failed to save username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}
          >
            <div style={{ 
              width: '64px', height: '64px', background: 'var(--accent-primary)', 
              borderRadius: '16px', margin: '0 auto 1.5rem', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: 'white' 
            }}>
              <Shield size={32} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Claim Your <span className="gradient-text">Identity</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Every Citizen of Awareness Pro needs a unique handle to track progress and climb the leaderboard.
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  CHOOSE YOUR HANDLE
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 900 }}>@</span>
                  <input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="citizen_name"
                    autoFocus
                    style={{
                      width: '100%', padding: '0.8rem 1rem 0.8rem 2.2rem', 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                      borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none'
                    }}
                  />
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                    {status === 'checking' && <Loader2 className="spin" size={18} color="var(--accent-primary)" />}
                    {status === 'available' && <Check size={18} color="var(--accent-success)" />}
                    {status === 'taken' && <AlertCircle size={18} color="var(--accent-danger)" />}
                  </div>
                </div>
                {message && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: status === 'available' ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 700 }}>
                    {message}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                  <Zap size={14} color="var(--accent-primary)" style={{ marginBottom: '0.2rem' }} />
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unique ID</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800 }}>Required</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                  <Star size={14} color="var(--accent-secondary)" style={{ marginBottom: '0.2rem' }} />
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rewards</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800 }}>Enabled</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status !== 'available' || loading}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}
              >
                {loading ? 'Securing Identity...' : 'Confirm Handle'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
