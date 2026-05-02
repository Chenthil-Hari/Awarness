'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Search, Filter, ChevronRight, 
  Zap, Crown, Medal, Shield, Sparkles, Target, Activity
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';

const LEAGUES = [
  { id: 'Bronze', name: 'BRONZE', color: '#cd7f32', accent: '#ff9d42' },
  { id: 'Silver', name: 'SILVER', color: '#c0c0c0', accent: '#e2e8f0' },
  { id: 'Gold', name: 'GOLD', color: '#ffd700', accent: '#fde047' },
  { id: 'Hacker-Tier', name: 'CYBER', color: '#8b5cf6', accent: '#c084fc' }
];

// --- Sub-components ---

const PodiumCard = ({ user, rank, isMe, leagueColor }) => {
  const isFirst = rank === 1;
  const delay = rank === 1 ? 0.2 : (rank === 2 ? 0.1 : 0.3);
  const glowColor = isFirst ? '#f59e0b' : (rank === 2 ? '#818cf8' : '#10b981');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, type: 'spring' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: isFirst ? '220px' : '180px',
        position: 'relative',
        zIndex: isFirst ? 10 : 1
      }}
    >
      {/* Rank Indicator */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        background: glowColor,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 900,
        boxShadow: `0 0 20px ${glowColor}66`,
        zIndex: 20
      }}>
        {isFirst ? 'CHAMPION' : `RANK ${rank}`}
      </div>

      {/* Profile Ring */}
      <div style={{
        width: isFirst ? '120px' : '90px',
        height: isFirst ? '120px' : '90px',
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        background: 'rgba(255,255,255,0.03)',
        border: `3px solid ${glowColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isFirst ? '3rem' : '2.2rem',
        fontWeight: 900,
        color: glowColor,
        marginBottom: '1.5rem',
        boxShadow: `0 0 40px ${glowColor}22`,
        animation: 'morph 8s ease-in-out infinite',
        position: 'relative'
      }}>
        {user.name?.charAt(0) || 'O'}
        {isFirst && <Crown size={30} style={{ position: 'absolute', top: '-25px', color: '#f59e0b', filter: 'drop-shadow(0 0 10px #f59e0b)' }} />}
      </div>

      {/* Info Card */}
      <div style={{
        width: '100%',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '1.5rem 1rem',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          fontWeight: 900, 
          fontSize: isFirst ? '1.1rem' : '0.9rem', 
          color: isMe ? 'var(--accent-primary)' : 'white', 
          marginBottom: '0.4rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {user.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Level {calculateLevel(user.xp || 0)}
        </div>
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '12px',
          fontWeight: 900,
          color: glowColor,
          fontSize: isFirst ? '1.2rem' : '1rem'
        }}>
          {user.xp?.toLocaleString()}
          <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.6 }}>XP</span>
        </div>
      </div>
    </motion.div>
  );
};

const UserRow = ({ user, rank, isMe, leagueColor }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        background: isMe ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
        borderRadius: '20px',
        border: isMe ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
        marginBottom: '0.75rem',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ width: '40px', fontWeight: 900, fontSize: '1.1rem', color: rank <= 10 ? 'white' : 'rgba(255,255,255,0.2)' }}>
          #{rank}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '14px', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.2rem'
          }}>
            {user.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Level {calculateLevel(user.xp || 0)}</div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Zap size={14} color={leagueColor} />
          {user.xp?.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase' }}>Neural Rating</div>
      </div>
    </motion.div>
  );
};

// --- Main Page ---

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [searchTerm, setSearchTerm] = useState('');

  const currentLeague = useMemo(() => LEAGUES.find(l => l.id === activeLeague), [activeLeague]);

  useEffect(() => {
    const fetchUsers = async () => {
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
    fetchUsers();
  }, [activeLeague]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  const top3 = useMemo(() => filteredUsers.slice(0, 3), [filteredUsers]);
  const rest = useMemo(() => filteredUsers.slice(3), [filteredUsers]);

  const myRankData = useMemo(() => {
    const rank = users.findIndex(u => u.username === session?.user?.username) + 1;
    const data = users.find(u => u.username === session?.user?.username);
    return { rank, data };
  }, [users, session]);

  return (
    <main style={{ minHeight: '100vh', background: '#05070a', color: 'white', paddingBottom: '10rem' }}>
      <Navbar />
      
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: `${currentLeague.color}11`, filter: 'blur(100px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'rgba(139, 92, 246, 0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '3rem' }}>
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
              padding: '0.5rem 1.25rem', background: 'rgba(255,255,255,0.03)', 
              borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '1.5rem', color: currentLeague.accent, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px'
            }}>
              <Activity size={16} /> GLOBAL PROTOCOL
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1rem' }}>
              THE <span style={{ color: currentLeague.color }}>{currentLeague.name}</span> LIST
            </h1>
          </motion.div>
        </div>

        {/* Tactical Control Bar */}
        <div style={{ 
          maxWidth: '900px', margin: '0 auto 5rem', 
          display: 'flex', flexDirection: 'column', gap: '1.5rem' 
        }}>
          {/* League Switcher */}
          <div style={{ 
            display: 'flex', padding: '0.4rem', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)'
          }}>
            {LEAGUES.map(league => (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league.id)}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '16px',
                  background: activeLeague === league.id ? currentLeague.color : 'transparent',
                  color: activeLeague === league.id ? 'black' : 'rgba(255,255,255,0.4)',
                  fontWeight: 900, fontSize: '0.8rem', transition: 'all 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {activeLeague === league.id && <Sparkles size={14} />}
                {league.name}
              </button>
            ))}
          </div>

          {/* Search & Stats Key */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Locate operative by handle..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '1rem 1rem 1rem 3.5rem',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', color: 'white', fontWeight: 500
                }}
              />
            </div>
            <div style={{ 
              padding: '0 1.5rem', background: 'rgba(255,255,255,0.03)', 
              borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 800
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> PROMOTION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> SAFETY
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> DEMOTION
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner message="Accessing global datastream..." />
          </div>
        ) : (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Podium */}
            {!searchTerm && top3.length > 0 && (
              <div style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
                gap: '2rem', marginBottom: '8rem', flexWrap: 'wrap' 
              }}>
                {top3[1] && <PodiumCard user={top3[1]} rank={2} isMe={top3[1].username === session?.user?.username} leagueColor={currentLeague.color} />}
                {top3[0] && <PodiumCard user={top3[0]} rank={1} isMe={top3[0].username === session?.user?.username} leagueColor={currentLeague.color} />}
                {top3[2] && <PodiumCard user={top3[2]} rank={3} isMe={top3[2].username === session?.user?.username} leagueColor={currentLeague.color} />}
              </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="popLayout">
                {rest.map((user, i) => (
                  <UserRow 
                    key={user._id} 
                    user={user} 
                    rank={i + 4} 
                    isMe={user.username === session?.user?.username} 
                    leagueColor={currentLeague.color} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Floating Personal Intel */}
      <AnimatePresence>
        {myRankData.data && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              width: 'calc(100% - 3rem)', maxWidth: '900px', zIndex: 100
            }}
          >
            <div style={{ 
              background: 'rgba(10, 12, 16, 0.9)', backdropFilter: 'blur(20px)',
              border: `2px solid ${currentLeague.color}`, borderRadius: '24px',
              padding: '1.25rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${currentLeague.color}22`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>YOUR SECTOR</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>#{myRankData.rank}</div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ 
                    width: '44px', height: '44px', borderRadius: '12px', background: currentLeague.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900
                  }}>
                    {myRankData.data.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{myRankData.data.name}</div>
                    <div style={{ fontSize: '0.7rem', color: currentLeague.accent, fontWeight: 900 }}>{activeLeague.toUpperCase()} DEPLOYMENT</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
                  <TrendingUp size={18} color={currentLeague.accent} />
                  <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{myRankData.data.xp?.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>AGGREGATED SCORE</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes morph {
          0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
          100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
      `}</style>
    </main>
  );
}
