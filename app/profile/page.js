'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Trophy, Target, Zap, Clock, TrendingUp, Shield, 
  BarChart3, Calendar, ChevronRight, Edit2, Save, X, 
  Mail, LogOut, Settings, Award, Check, AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['phishing', 'smishing', 'finance', 'security'];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Analyzing your performance..." />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '10rem' }}>
        <Navbar />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to view your analytics.</p>
      </main>
    );
  }

  const { user } = session;
  const performance = user.performance || {};
  const history = [...(user.history || [])].reverse();

  // Calculate overall accuracy
  let totalAttempts = 0;
  let totalSuccesses = 0;
  CATEGORIES.forEach(cat => {
    totalAttempts += performance[cat]?.attempts || 0;
    totalSuccesses += performance[cat]?.successes || 0;
  });
  const accuracy = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0;

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await update({
        ...session,
        user: { ...session.user, username: data.username }
      });

      setUpdateStatus({ type: 'success', message: 'Handle updated!' });
      setTimeout(() => {
        setIsEditing(false);
        setUpdateStatus({ type: '', message: '' });
      }, 1500);
      router.refresh();
    } catch (err) {
      setUpdateStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navbar />

      <div style={{ marginTop: '3rem' }}>
        
        {/* HERO SECTION */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ flex: '1 1 500px', padding: '2.5rem', display: 'flex', gap: '2.5rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
          >
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.05, zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 0 40px rgba(124, 58, 237, 0.3)' }}>
                {user.name?.charAt(0) || 'U'}
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                style={{ position: 'absolute', bottom: 0, right: 0, width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                <Edit2 size={16} />
              </motion.button>
            </div>

            <div style={{ zIndex: 1, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>{user.name || 'Agent'}</h1>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase' }}>
                  {user.league || 'Bronze'} League
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>@{user.username || 'user'}</p>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user.badges?.length || 0} Badges</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--accent-secondary)" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Level {Math.floor((user.xp || 0) / 1000) + 1}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <button onClick={() => signOut()} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                 <LogOut size={14} /> Sign Out
               </button>
            </div>
          </motion.div>

          {/* Quick Stats Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '0 0 280px' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total XP</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', margin: 0 }}>{user.xp || 0}</h3>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Streak</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', margin: 0 }}>{user.streak || 0} 🔥</h3>
            </motion.div>
          </div>
        </div>

        {/* ANALYTICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Skill Matrix Radar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2.5rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={22} color="var(--accent-primary)" /> Skill Matrix
            </h3>
            <SkillRadar performance={performance} />
          </motion.div>

          {/* Performance Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card" 
            style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart3 size={22} color="var(--accent-secondary)" /> Category Proficiency
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1, justifyContent: 'center' }}>
              {CATEGORIES.map(cat => {
                const stats = performance[cat] || {};
                const xp = stats.xp || 0;
                const successes = stats.successes || 0;
                const attempts = stats.attempts || 0;
                const catAccuracy = attempts > 0 ? Math.round((successes / attempts) * 100) : 0;
                
                // Scale XP for the bar (cap at 2000 for full bar)
                const percent = Math.min(100, (xp / 2000) * 100);

                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 800, fontSize: '0.9rem' }}>{cat}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{catAccuracy}% Accuracy</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        style={{ height: '100%', background: getCategoryColor(cat), boxShadow: `0 0 10px ${getCategoryColor(cat)}40` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RECENT ACTIVITY & ACCURACY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="flex-mobile-column">
          
          {/* History List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card" 
            style={{ padding: '2rem' }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={20} color="var(--accent-primary)" /> Mission Log
            </h3>
            {history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.slice(0, 6).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', transition: 'all 0.2s ease' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${item.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                      {item.success ? <Shield size={18} color="var(--accent-success)" /> : <AlertCircle size={18} color="var(--accent-danger)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <p style={{ fontWeight: 800, margin: 0, fontSize: '0.9rem' }}>{item.type} {item.success ? 'Neutralized' : 'Breached'}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                        {item.xp > 0 ? `Confirmed +${item.xp} XP gain` : 'Standard drill completed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 700 }}>No mission logs found. Engage in training to populate your history.</p>
              </div>
            )}
          </motion.div>

          {/* Accuracy Circle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card" 
            style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2.5rem', alignSelf: 'flex-start' }}>Overall Accuracy</h3>
            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="15" />
                <motion.circle 
                  cx="110" cy="110" r="90" fill="none" 
                  stroke="var(--accent-success)" strokeWidth="15" 
                  strokeDasharray="565.5"
                  initial={{ strokeDashoffset: 565.5 }}
                  animate={{ strokeDashoffset: 565.5 - (565.5 * accuracy / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                  style={{ filter: 'drop-shadow(0 0 8px var(--accent-success))' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>{accuracy}%</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Precision</p>
              </div>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '200px' }}>
              Based on {totalAttempts} total decisions made across all platforms.
            </p>
          </motion.div>
        </div>
      </div>

      {/* EDIT USERNAME MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(5, 7, 10, 0.9)', backdropFilter: 'blur(10px)' }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="glass-card" 
              style={{ position: 'relative', width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', zIndex: 1001 }}
            >
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Update Handle</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Choose a unique identifier for the leaderboards.</p>
              
              <form onSubmit={handleUsernameUpdate}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.2rem' }}>@</span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="agent_name"
                    autoFocus
                    style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 2.75rem', background: 'rgba(255,255,255,0.05)', border: '2px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                {updateStatus.message && (
                  <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', background: updateStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${updateStatus.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}`, color: updateStatus.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {updateStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    {updateStatus.message}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, background: 'var(--accent-primary)' }}>
                    {loading ? 'Processing...' : 'Save Identity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

function getCategoryColor(cat) {
  switch(cat) {
    case 'phishing': return '#8b5cf6';
    case 'smishing': return '#ec4899';
    case 'finance': return '#f59e0b';
    case 'security': return '#10b981';
    default: return 'var(--accent-primary)';
  }
}

function SkillRadar({ performance }) {
  const size = 260;
  const center = size / 2;
  const radius = 100;

  const points = CATEGORIES.map((cat, i) => {
    // Scale value based on XP and Success rate
    const stats = performance[cat] || {};
    const xpVal = Math.min(100, (stats.xp || 0) / 15); // Normalize XP
    const accVal = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
    const value = (xpVal * 0.4) + (accVal * 0.6); // Combined metric
    
    const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
    const r = (value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grids */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {/* Axes */}
        {CATEGORIES.map((_, i) => {
          const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
          return (
            <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          );
        })}
        {/* Shape */}
        <motion.polygon 
          points={points}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="var(--accent-primary)"
          strokeWidth="3"
          strokeLinejoin="round"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "backOut", delay: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}
        />
      </svg>
      {CATEGORIES.map((cat, i) => {
        const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
        const r = radius + 25;
        return (
          <div key={cat} style={{ position: 'absolute', top: center + r * Math.sin(angle), left: center + r * Math.cos(angle), transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {cat}
          </div>
        );
      })}
    </div>
  );
}
