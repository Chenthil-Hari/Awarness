'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import TrophyIcon from '../components/TrophyIcon';
import { motion } from 'framer-motion';
import { Medal, Star, Target, Crown } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={24} color="#FFD700" />; // Gold
    if (index === 1) return <Medal size={24} color="#C0C0C0" />; // Silver
    if (index === 2) return <Medal size={24} color="#CD7F32" />; // Bronze
    return <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{index + 1}</span>;
  };

  return (
    <main className="container">
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

        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ padding: '4rem' }}>
              <LoadingSpinner size={150} message="Calculating elite rankings..." />
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {/* Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 1fr 150px 150px', 
                padding: '1.5rem', 
                borderBottom: '1px solid var(--glass-border)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1rem'
              }}>
                <span>Rank</span>
                <span>User</span>
                <span style={{ textAlign: 'center' }}>Badges</span>
                <span style={{ textAlign: 'right' }}>Total XP</span>
              </div>

              {/* Rows */}
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '80px 1fr 150px 150px', 
                    padding: '1.5rem', 
                    alignItems: 'center',
                    borderBottom: index === users.length - 1 ? 'none' : '1px solid var(--glass-border)',
                    background: index === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
                    borderRadius: index === 0 ? 'var(--radius-md)' : '0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {getRankIcon(index)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${index < 3 ? 'var(--accent-primary)' : 'var(--glass-border)'}`
                    }}>
                      <span style={{ fontWeight: 700 }}>{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>@{user.username || 'user'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {user.badges?.slice(0, 3).map((badge, i) => (
                      <div key={i} title={badge} style={{ width: '24px', height: '24px', background: 'var(--accent-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={14} color="white" />
                      </div>
                    )) || <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                    {user.xp || 0} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
