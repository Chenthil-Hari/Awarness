'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Medal, Star, Target, Crown, Shield, Zap, Swords, Info, X, 
  ChevronRight, Trophy, TrendingUp, TrendingDown, Minus, 
  Search, Filter, LayoutGrid, List, Sparkles, Award
} from 'lucide-react';
import { calculateLevel, calculateLevelProgress } from '@/lib/game';

const LEAGUES = [
  { id: 'Bronze', name: 'Bronze', color: '#cd7f32', icon: 'Shield' },
  { id: 'Silver', name: 'Silver', color: '#c0c0c0', icon: 'Medal' },
  { id: 'Gold', name: 'Gold', color: '#ffd700', icon: 'Crown' },
  { id: 'Hacker-Tier', name: 'Hacker-Tier', color: '#8b5cf6', icon: 'Zap' }
];

// --- Sub-components ---

const PodiumUser = ({ user, rank, isMe }) => {
  const isFirst = rank === 1;
  const height = isFirst ? '180px' : (rank === 2 ? '150px' : '130px');
  const glowColor = rank === 1 ? '#f59e0b' : (rank === 2 ? '#818cf8' : '#10b981');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.8 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: isFirst ? '180px' : '140px',
        zIndex: isFirst ? 10 : 1
      }}
    >
      {/* Rank Icon */}
      <div style={{
        position: 'absolute',
        top: '-15px',
        background: glowColor,
        color: 'white',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: '1rem',
        boxShadow: `0 0 15px ${glowColor}`,
        zIndex: 20
      }}>
        {rank}
      </div>

      {/* Avatar with Glow */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: isFirst ? '90px' : '70px',
          height: isFirst ? '90px' : '70px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
          border: `2px solid ${glowColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isFirst ? '2.5rem' : '1.8rem',
          fontWeight: 900,
          color: glowColor,
          marginBottom: '1rem',
          boxShadow: `0 0 30px ${glowColor}44`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {user.name?.charAt(0) || 'O'}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '30%', background: `linear-gradient(to top, ${glowColor}44, transparent)` }} />
      </motion.div>

      {/* Podium Block */}
      <div style={{
        width: '100%',
        height: height,
        background: `linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`,
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: 800, fontSize: isFirst ? '1rem' : '0.85rem', color: isMe ? 'var(--accent-primary)' : 'white', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
          {user.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Lvl {calculateLevel(user.xp || 0)}
        </div>
        <div style={{ marginTop: 'auto', fontWeight: 900, fontSize: isFirst ? '1.2rem' : '1rem', color: glowColor }}>
          {user.xp?.toLocaleString()}
          <span style={{ fontSize: '0.6rem', opacity: 0.7, marginLeft: '2px' }}>XP</span>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardRow = ({ user, rank, isMe, zone }) => {
  const zoneColor = zone === 'Promotion' ? '#10b981' : (zone === 'Safety' ? '#f59e0b' : '#ef4444');
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.04)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        background: isMe ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: isMe ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Zone Indicator (Side Strip) */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: zoneColor }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ 
          width: '32px', 
          fontWeight: 900, 
          fontSize: '1rem', 
          color: rank <= 10 ? 'white' : 'rgba(255,255,255,0.3)',
          textAlign: 'center'
        }}>
          {rank}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 900,
            color: 'var(--accent-primary)'
          }}>
            {user.name?.charAt(0) || 'O'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'white' }}>{user.name}</span>
              {isMe && <span style={{ background: 'var(--accent-primary)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>YOU</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              Level {calculateLevel(user.xp || 0)} • {user.league || 'Bronze'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white' }}>
            {user.xp?.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>
            Points
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.1)' }}>
          <ChevronRight size={18} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeLeague]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?league=${activeLeague}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const top3 = useMemo(() => users.slice(0, 3), [users]);
  const others = useMemo(() => filteredUsers.slice(3), [filteredUsers, users]);

  const userRankData = useMemo(() => {
    const rank = users.findIndex(u => u.username === session?.user?.username) + 1;
    const userData = users.find(u => u.username === session?.user?.username);
    return { rank, userData };
  }, [users, session]);

  const getZone = (rank) => {
    if (rank <= 15) return 'Promotion';
    if (rank <= 27) return 'Safety';
    return 'Demotion';
  };

  return (
    <main style={{ minHeight: '100vh', background: '#05070a', color: 'white', paddingBottom: '8rem' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1.5px' }}>
              GLOBAL <span className="gradient-text">RANKINGS</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              The most elite cybersecurity operatives currently active in the sector.
            </p>
          </motion.div>
        </div>

        {/* League Controls */}
        <div className="glass-card" style={{ 
          maxWidth: '800px', 
          margin: '0 auto 4rem', 
          padding: '0.75rem', 
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '0.4rem', gap: '0.4rem' }}>
            {LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league.id)}
                style={{
                  flex: 1,
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: activeLeague === league.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeLeague === league.id ? 'white' : 'rgba(255,255,255,0.4)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeLeague === league.id ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none'
                }}
              >
                {league.name}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Search operative..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 3rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <button style={{ padding: '0 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner message="Synchronizing global data nodes..." />
          </div>
        ) : (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Top 3 Podium Section */}
            {!searchTerm && top3.length > 0 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-end', 
                gap: '1rem', 
                marginBottom: '5rem',
                paddingTop: '2rem'
              }}>
                {/* 2nd Place */}
                {top3[1] && <PodiumUser user={top3[1]} rank={2} isMe={top3[1].username === session?.user?.username} />}
                
                {/* 1st Place */}
                {top3[0] && <PodiumUser user={top3[0]} rank={1} isMe={top3[0].username === session?.user?.username} />}
                
                {/* 3rd Place */}
                {top3[2] && <PodiumUser user={top3[2]} rank={3} isMe={top3[2].username === session?.user?.username} />}
              </div>
            )}

            {/* Zone Map Key */}
            {!searchTerm && (
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '3rem',
                background: 'rgba(255,255,255,0.02)',
                padding: '1.5rem',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>League Status Map</h4>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ flex: 15, background: '#10b981' }} />
                    <div style={{ flex: 12, background: '#f59e0b' }} />
                    <div style={{ flex: 23, background: '#ef4444' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: 800 }}>
                    <span style={{ color: '#10b981' }}>Promotion (1-15)</span>
                    <span style={{ color: '#f59e0b' }}>Safety (16-27)</span>
                    <span style={{ color: '#ef4444' }}>Demotion (28-50)</span>
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Session Ends In</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>2d 14h 05m</div>
                  </div>
                  <TrendingUp size={24} color="#10b981" />
                </div>
              </div>
            )}

            {/* List Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>Operative Rank</span>
                <span>Power Rating</span>
              </div>
              
              <AnimatePresence mode="popLayout">
                {others.map((user, index) => {
                  const actualRank = searchTerm ? (users.findIndex(u => u._id === user._id) + 1) : (index + 4);
                  return (
                    <LeaderboardRow 
                      key={user._id} 
                      user={user} 
                      rank={actualRank} 
                      isMe={user.username === session?.user?.username}
                      zone={getZone(actualRank)}
                    />
                  );
                })}
              </AnimatePresence>

              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                  <Search size={40} style={{ marginBottom: '1rem' }} />
                  <p>No operatives found in this sector matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Status Bar for Current User */}
      <AnimatePresence>
        {userRankData.userData && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '800px',
              zIndex: 100
            }}
          >
            <div className="glass-card" style={{ 
              padding: '1.25rem 2rem', 
              borderRadius: '24px', 
              background: 'rgba(15, 15, 20, 0.9)', 
              backdropFilter: 'blur(20px)',
              border: '2px solid var(--accent-primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Your Rank</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>#{userRankData.rank || '50+'}</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    {userRankData.userData.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{userRankData.userData.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>{activeLeague.toUpperCase()} LEAGUE</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Zap size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{userRankData.userData.xp?.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>TOTAL EXPERIENCE</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(to right, #a78bfa, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </main>
  );
}
