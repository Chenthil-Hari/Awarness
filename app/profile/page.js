'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileIcon from '../components/ProfileIcon';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Save, Star, Mail, Shield, Zap, Edit2, X } from 'lucide-react';
import { calculateLevel } from '../../lib/game';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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

      // Update the local session
      await update({
        ...session,
        user: {
          ...session.user,
          username: data.username
        }
      });

      setStatus({ type: 'success', message: 'Username updated successfully!' });
      setIsEditing(false); // CLOSE THE FORM
      
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

  const userXp = session?.user?.xp || 0;
  const level = calculateLevel(userXp);

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      <Navbar score={userXp} level={level} />
      
      <div className="flex-center" style={{ marginTop: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
        >
          {/* Header Section */}
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
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)'
            }}>
              <ProfileIcon size={64} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{session.user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> {session.user.email}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <Zap size={20} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{level}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Level</p>
            </div>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
              <Shield size={20} color="var(--accent-secondary)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0.4rem 0', textTransform: 'capitalize' }}>{session.user.role || 'Citizen'}</p>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Rank</p>
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                color: status.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'
              }}
            >
              {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{status.message}</span>
            </motion.div>
          )}

          {/* Identity Form */}
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>IDENTITY HANDLE</label>
                {!isEditing ? (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="hover-lift"
                    style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.3rem 0.75rem', borderRadius: '20px', cursor: 'pointer' }}
                  >
                    <Edit2 size={12} /> EDIT
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={12} /> CANCEL
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.03)' }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem' }}>@</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{session.user.username || 'user'}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', fontWeight: 900 }}>@</span>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="your_handle"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 2.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px solid var(--accent-secondary)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.1)'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Letters, numbers, and underscores only.
                  </p>
                </div>
              )}
            </div>

            {isEditing && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', background: 'var(--accent-secondary)', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)' }}
              >
                {loading ? 'Processing...' : <><Save size={20} /> Save Changes</>}
              </motion.button>
            )}
          </form>

          {/* Profile Actions */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <Link href="/leaderboard" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover-lift">
               <Star size={16} color="var(--accent-primary)" /> View Rankings
             </Link>
             <button style={{ fontSize: '0.85rem', color: 'var(--accent-danger)', background: 'none', border: 'none', fontWeight: 600 }}>Delete Account</button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
