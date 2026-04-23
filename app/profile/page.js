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
      
      <div className="flex-center" style={{ marginTop: '4rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'var(--bg-tertiary)', 
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--accent-primary)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <ProfileIcon size={70} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Account <span className="gradient-text">Settings</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your unique identity on the platform</p>
          </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>YOUR ACHIEVEMENTS</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {session.user.badges?.length > 0 ? (
                  session.user.badges.map((badge, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                      <Star size={16} color="var(--accent-secondary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{badge}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete simulations to earn badges!</p>
                )}
              </div>
            </div>

          {status.message && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
              color: status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}>
              {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span style={{ fontSize: '0.9rem' }}>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNIQUE USERNAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 700 }}>@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_handle"
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Only letters, numbers, and underscores allowed. Must be unique.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
            >
              {loading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
