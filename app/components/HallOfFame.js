'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Shield } from 'lucide-react';
import Image from 'next/image';

const HologramPlayer = ({ user, rank }) => {
  const isFirst = rank === 0;
  const scale = isFirst ? 1.2 : 1;
  const glowColor = isFirst ? 'var(--accent-warning)' : (rank === 1 ? 'rgba(148, 163, 184, 0.8)' : 'rgba(180, 83, 9, 0.8)');

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.2, duration: 0.8 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: isFirst ? 10 : 1,
        padding: '1rem'
      }}
    >
      {/* 3D Platform Base */}
      <div style={{
        width: isFirst ? '180px' : '140px',
        height: '40px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '50%',
        position: 'absolute',
        bottom: '-10px',
        border: `2px solid ${glowColor}`,
        boxShadow: `0 0 30px ${glowColor}, inset 0 0 15px ${glowColor}`,
        transform: 'perspective(500px) rotateX(60deg)',
      }} />

      {/* Hologram Light Rays */}
      <div style={{
        width: isFirst ? '140px' : '100px',
        height: '200px',
        background: `linear-gradient(to top, ${glowColor}22 0%, transparent 100%)`,
        position: 'absolute',
        bottom: '20px',
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        opacity: 0.3
      }} />

      {/* Rank Badge */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        background: glowColor,
        padding: '0.4rem 1rem',
        borderRadius: 'var(--radius-full)',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 900,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        boxShadow: `0 0 15px ${glowColor}`
      }}>
        <Trophy size={14} />
        RANK {rank + 1}
      </div>

      {/* Avatar Container */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotateY: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          width: isFirst ? '120px' : '100px',
          height: isFirst ? '120px' : '100px',
          borderRadius: '24px',
          overflow: 'hidden',
          border: `2px solid ${glowColor}`,
          background: 'var(--bg-secondary)',
          position: 'relative',
          boxShadow: `0 0 20px ${glowColor}44`,
        }}
      >
        <Image 
          src={user.avatar || '/avatars/cyber_ninja.png'} 
          alt={user.username} 
          width={120} 
          height={120}
          className="hologram-image"
        />
        {/* Scanlines Effect */}
        <div className="scanlines" />
      </motion.div>

      {/* Info Card */}
      <div className="hof-card" style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1rem 1.5rem',
        borderRadius: '16px',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '170px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ fontWeight: 800, fontSize: isFirst ? '1.1rem' : '0.9rem', marginBottom: '0.2rem', color: 'white' }}>
          {user.username}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <Zap size={12} />
          {(user.xp || 0).toLocaleString()} XP
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.4rem', fontWeight: 600, letterSpacing: '0.5px' }}>
          {(user.league || 'Bronze').toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
};

export default function HallOfFame() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hall-of-fame')
      .then(res => res.json())
      .then(data => {
        // Reorder for Podium (2nd, 1st, 3rd)
        const podium = [];
        if (data[1]) podium.push(data[1]);
        if (data[0]) podium.push(data[0]);
        if (data[2]) podium.push(data[2]);
        setTopUsers(podium);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section style={{ margin: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>
          THE <span className="gradient-text">HALL OF FAME</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Celebrating the world's most elite operatives</p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'flex-end', 
        gap: '1rem',
        flexWrap: 'wrap',
        minHeight: '300px'
      }}>
        {topUsers.map((user, idx) => {
          // Calculate actual rank: if 2nd item in array, it's rank 0 (1st place)
          const actualRank = topUsers.indexOf(user);
          // Wait, the order in data was [1st, 2nd, 3rd].
          // I reordered to [2nd, 1st, 3rd].
          // So if index is 1, it's rank 0. If 0, it's rank 1. If 2, it's rank 2.
          let rankLabel = 0;
          if (idx === 0) rankLabel = 1; // 2nd place
          if (idx === 1) rankLabel = 0; // 1st place
          if (idx === 2) rankLabel = 2; // 3rd place

          return (
            <HologramPlayer key={user._id} user={user} rank={rankLabel} />
          );
        })}
      </div>

      <style jsx global>{`
        .hologram-image {
          filter: brightness(1.2) contrast(1.2) saturate(1.2) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
        }
        .hof-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.2) 50%
          ), linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.06),
            rgba(0, 255, 0, 0.02),
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 4px, 3px 100%;
          pointer-events: none;
          z-index: 5;
        }
      `}</style>
    </section>
  );
}
