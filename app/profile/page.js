'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileIcon from '../components/ProfileIcon';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Save, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
  }, [session]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Update the local session to reflect the new username
      await update({
        ...session,
        user: {
          ...session.user,
          username: data.username
        }
      });

      setStatus({ type: 'success', message: 'Username updated successfully!' });
      
      // Force refresh to update Navbar
      router.refresh();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-primary)' }}>
        <LoadingSpinner size={180} message="Authenticating session..." />
      </div>
    );
  }

  return (
    <main className="container">
      <Navbar score={1200} level={4} />
      
      <div className="flex-center" style={{ marginTop: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--bg-tertiary)', 
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--accent-primary)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <ProfileIcon size={56} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account <span className="gradient-text">Settings</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your unique identity</p>
          </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>YOUR ACHIEVEMENTS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {session.user.badges?.length > 0 ? (
                  session.user.badges.map((badge, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                      <Star size={14} color="var(--accent-secondary)" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{badge}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete simulations to earn badges!</p>
                )}
              </div>
            </div>

          {status.message && (
            <div style={{ 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
              color: status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}>
              {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span style={{ fontSize: '0.85rem' }}>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNIQUE USERNAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 700 }}>@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_handle"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Letters, numbers, and underscores only.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
