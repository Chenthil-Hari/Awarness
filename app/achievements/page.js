'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Lock, Star, Terminal, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import Lottie from 'lottie-react';
import { badges } from '../data/badges';

// Import all lotties explicitly to ensure they are bundled
import verifiedUserLottie from '../../images/verified-user.json';
import technyLottie from '../../images/techny-receiving-a-letter-or-email.json';
import euroLottie from '../../images/online-euro.json';
import fireLottie from '../../images/fire.json';
import trophyLottie from '../../images/trophy.json';

const lottieMap = {
  'verified-user': verifiedUserLottie,
  'techny-receiving-a-letter-or-email': technyLottie,
  'online-euro': euroLottie,
  'fire': fireLottie,
  'trophy': trophyLottie,
};

const lucideMap = {
  'Star': <Star size={40} />,
  'Terminal': <Terminal size={40} />,
  'ShieldCheck': <ShieldCheck size={40} />,
};

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Loading Gallery..." />
      </div>
    );
  }

  const userBadges = session?.user?.badges || [];
  
  // Calculate stats
  const unlockedCount = badges.filter(b => userBadges.includes(b.id)).length;
  const progressPercentage = Math.round((unlockedCount / badges.length) * 100);

  return (
    <main className="container" style={{ position: 'relative', zIndex: 1, minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar />

      <div style={{ marginTop: '3rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ width: '120px', height: '120px', marginBottom: '1rem' }}>
              <Lottie animationData={trophyLottie} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
              Trophy <span className="gradient-text">Room</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px' }}>
              Your collection of earned honors. Keep training to unlock them all.
            </p>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{unlockedCount} / {badges.length}</span>
              <div style={{ width: '150px', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{progressPercentage}%</span>
            </div>
          </motion.div>
        </div>

        <div className="grid-responsive" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {badges.map((badge, i) => {
            const isUnlocked = userBadges.includes(badge.id);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  background: isUnlocked ? 'var(--glass-bg)' : 'rgba(255,255,255,0.01)',
                  border: isUnlocked ? `1px solid ${badge.color}40` : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isUnlocked ? `0 10px 30px ${badge.color}15` : 'none',
                  filter: !isUnlocked ? 'grayscale(100%) opacity(0.6)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Glow Effect */}
                {isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                    height: '100px',
                    background: badge.color,
                    filter: 'blur(60px)',
                    opacity: 0.15,
                    zIndex: 0
                  }} />
                )}

                {!isUnlocked && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <Lock size={16} color="var(--text-muted)" />
                  </div>
                )}

                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  marginBottom: '1.5rem',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isUnlocked ? badge.color : 'var(--text-muted)'
                }}>
                  {badge.iconType === 'lottie' && lottieMap[badge.iconName] ? (
                    <Lottie animationData={lottieMap[badge.iconName]} loop={isUnlocked} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    lucideMap[badge.iconName] || <Trophy size={40} />
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', zIndex: 1 }}>
                  {badge.title}
                </h3>
                
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  color: isUnlocked ? badge.color : 'var(--text-muted)',
                  background: isUnlocked ? `${badge.color}15` : 'rgba(255,255,255,0.05)',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  zIndex: 1
                }}>
                  {badge.rarity}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal for Details */}
      <AnimatePresence>
        {selectedBadge && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5, 7, 10, 0.8)',
                backdropFilter: 'blur(5px)'
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                padding: '3rem 2rem',
                textAlign: 'center',
                zIndex: 1001,
                border: `1px solid ${userBadges.includes(selectedBadge.id) ? selectedBadge.color : 'var(--glass-border)'}`,
                boxShadow: userBadges.includes(selectedBadge.id) ? `0 20px 50px ${selectedBadge.color}20` : '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              {userBadges.includes(selectedBadge.id) && (
                <Sparkles 
                  size={24} 
                  color={selectedBadge.color} 
                  style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', opacity: 0.5 }} 
                />
              )}

              <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', color: userBadges.includes(selectedBadge.id) ? selectedBadge.color : 'var(--text-muted)' }}>
                {selectedBadge.iconType === 'lottie' && lottieMap[selectedBadge.iconName] ? (
                  <Lottie animationData={lottieMap[selectedBadge.iconName]} loop={true} style={{ width: '100%', height: '100%' }} />
                ) : (
                  lucideMap[selectedBadge.iconName] || <Trophy size={60} />
                )}
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {selectedBadge.title}
              </h2>
              
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
                {selectedBadge.description}
              </p>

              <button 
                onClick={() => setSelectedBadge(null)}
                className="btn-primary"
                style={{ width: '100%', background: userBadges.includes(selectedBadge.id) ? selectedBadge.color : 'var(--bg-tertiary)' }}
              >
                {userBadges.includes(selectedBadge.id) ? 'Awesome!' : 'Close'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
