'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import TrophyIcon from '../components/TrophyIcon';
import { motion } from 'framer-motion';
import { Medal, Star, Target, Crown, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import Lottie from 'lottie-react';
import eiffelCelebration from '../../images/eiffel-celebration.json';

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Hacker-Tier'];

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [errorMsg, setErrorMsg] = useState(null);

  // Determine allowed leagues
  const allowedLeagues = LEAGUES;

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/leaderboard?league=${activeLeague}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch");
        }
        return data;
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard fetch error:", err);
        setUsers([]);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [activeLeague]);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={24} color="#FFD700" />; // Gold
    if (index === 1) return <Medal size={24} color="#C0C0C0" />; // Silver
    if (index === 2) return <Medal size={24} color="#CD7F32" />; // Bronze
    return <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{index + 1}</span>;
  };

  return (
    <main className="container" style={{ position: 'relative', zIndex: 1 }}>
      {/* Full Background Animation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        opacity: 0.15,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <Lottie 
          animationData={eiffelCelebration} 
          loop={true} 
          style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }} 
        />
      </div>

      <Navbar />
      
      <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <TrophyIcon size={120} />
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '1rem' }}>Global <span className="gradient-text">Leaderboard</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>The elite hall of awareness masters.</p>
          </motion.div>
        </div>

        {/* League Tabs */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {allowedLeagues.map((league) => (
            <button
              key={league}
              onClick={() => setActiveLeague(league)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: activeLeague === league ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                background: activeLeague === league ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-secondary)',
                color: activeLeague === league ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {league === 'Bronze' && <Shield size={16} />}
              {league === 'Silver' && <Star size={16} />}
              {league === 'Gold' && <Crown size={16} />}
              {league === 'Hacker-Tier' && <Zap size={16} />}
              {league}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '0.5rem', borderRadius: 'var(--radius-xl)' }}>
          {loading ? (
            <div style={{ padding: '4rem' }}>
              <LoadingSpinner size={100} message="Calculating elite rankings..." />
            </div>
          ) : errorMsg ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🔒</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tier Locked</h3>
              <p style={{ fontSize: '1rem' }}>{errorMsg}</p>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {/* Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px 1fr 100px', 
                padding: '1.25rem 1rem', 
                borderBottom: '1px solid var(--glass-border)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05rem'
              }}>
                <span>Rank</span>
                <span>User</span>
                <span style={{ textAlign: 'right' }}>Total XP</span>
              </div>

              {/* Rows */}
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user, index) => {
                  
                  return (
                    <motion.div
                      key={user._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px 1fr 120px', 
                        padding: '1.25rem 1rem', 
                        alignItems: 'center',
                        borderBottom: index === users.length - 1 ? 'none' : '1px solid var(--glass-border)',
                        background: 'transparent',
                        borderRadius: index === 0 ? 'var(--radius-md)' : '0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {getRankIcon(index)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${index < 3 ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                          flexShrink: 0
                        }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{user.name?.charAt(0) || '?'}</span>
                        </div>
                        <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'Anonymous'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>@{user.username || 'user'}</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1rem' }}>
                        {user.xp || 0} <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>XP</span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No rankings available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
