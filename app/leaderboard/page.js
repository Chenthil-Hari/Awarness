'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Search, Filter, ChevronRight, 
  Zap, Crown, Medal, Shield, Sparkles, Target, Activity,
  Users, Award, BarChart3, Binary
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';

const LEAGUES = [
  { id: 'Bronze', name: 'BRONZE', color: '#cd7f32', accent: '#ff9d42' },
  { id: 'Silver', name: 'SILVER', color: '#c0c0c0', accent: '#e2e8f0' },
  { id: 'Gold', name: 'GOLD', color: '#ffd700', accent: '#fde047' },
  { id: 'Hacker-Tier', name: 'CYBER', color: '#8b5cf6', accent: '#c084fc' }
];

// --- Vertical Podium Item ---
const VerticalChampion = ({ user, rank, leagueColor }) => {
  const isFirst = rank === 1;
  const glowColor = isFirst ? '#f59e0b' : (rank === 2 ? '#818cf8' : '#10b981');

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.6 }}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(15px)',
        border: `1px solid ${isFirst ? glowColor : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '32px',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: '1rem',
        boxShadow: isFirst ? `0 0 40px ${glowColor}11` : 'none',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Background Icon */}
      <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.05, pointerEvents: 'none' }}>
        {isFirst ? <Crown size={120} /> : (rank === 2 ? <Medal size={100} /> : <Award size={100} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', position: 'relative', zIndex: 2 }}>
        {/* Rank Badge */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: glowColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: `0 0 20px ${glowColor}44`
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.8 }}>RANK</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{rank}</span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            width: '70px', height: '70px', borderRadius: '22px', 
            background: 'rgba(255,255,255,0.03)', border: `2px solid ${glowColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 900, color: glowColor,
            boxShadow: `0 0 20px ${glowColor}22`
          }}>
            {user.name?.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem' }}>
              {user.name} {isFirst && <Sparkles size={16} color={glowColor} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              <span style={{ color: glowColor }}>LEVEL {calculateLevel(user.xp || 0)}</span>
              <span>•</span>
              <span>{user.league || 'BRONZE'} SECTOR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
            <Zap size={20} color={glowColor} />
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{user.xp?.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Neural Experience
          </div>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
          <ChevronRight size={20} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Standard List Row ---
const VerticalUserRow = ({ user, rank, isMe, leagueColor }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        background: isMe ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.01)',
        borderRadius: '24px',
        border: isMe ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
        marginBottom: '0.5rem',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ width: '30px', fontWeight: 900, fontSize: '1rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          {rank}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            width: '44px', height: '44px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.1rem'
          }}>
            {user.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>LVL {calculateLevel(user.xp || 0)}</div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Zap size={14} color={leagueColor} />
          {user.xp?.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
};

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
      
      <div className="container" style={{ paddingTop: '4rem' }}>
        {/* Modern Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: currentLeague.accent }}>
              <Binary size={20} />
              <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '3px' }}>NEURAL HIERARCHY</span>
            </div>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-3px', lineHeight: 0.9, margin: 0 }}>
              {currentLeague.name}<br /><span style={{ opacity: 0.3 }}>PROTOCOL</span>
            </h1>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '350px' }}>
             {/* Dynamic Search */}
             <div style={{ position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
               <input 
                 type="text" 
                 placeholder="Search sector archives..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{
                   width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem',
                   background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                   borderRadius: '24px', color: 'white', fontWeight: 600, fontSize: '0.9rem', outline: 'none',
                   transition: 'all 0.3s ease'
                 }}
               />
             </div>

             {/* Animated League Switcher */}
             <div style={{ 
               display: 'flex', padding: '0.5rem', 
               background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
               border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)'
             }}>
               {LEAGUES.map(league => (
                 <button
                   key={league.id}
                   onClick={() => setActiveLeague(league.id)}
                   style={{
                     flex: 1, padding: '0.8rem', borderRadius: '20px',
                     background: activeLeague === league.id ? 'white' : 'transparent',
                     color: activeLeague === league.id ? 'black' : 'rgba(255,255,255,0.4)',
                     fontWeight: 900, fontSize: '0.7rem', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                     letterSpacing: '1px'
                   }}
                 >
                   {league.name}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner message="Reconstructing leaderboard nodes..." />
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* All-Vertical List starting with Champions */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {!searchTerm && top3.map((user, i) => (
                <VerticalChampion 
                  key={user._id} 
                  user={user} 
                  rank={i + 1} 
                  leagueColor={currentLeague.color} 
                />
              ))}

              <div style={{ 
                margin: '3rem 0 1.5rem', 
                padding: '0 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                color: 'rgba(255,255,255,0.2)',
                fontSize: '0.75rem',
                fontWeight: 900,
                letterSpacing: '2px'
              }}>
                <span>SECTOR RANKING</span>
                <span>NEURAL RATING</span>
              </div>

              {rest.map((user, i) => (
                <VerticalUserRow 
                  key={user._id} 
                  user={user} 
                  rank={i + 4} 
                  isMe={user.username === session?.user?.username} 
                  leagueColor={currentLeague.color} 
                />
              ))}

              {filteredUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '6rem', opacity: 0.3 }}>
                  <Search size={60} style={{ marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Sector data is empty or inaccessible.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent User Intel Bar */}
      <AnimatePresence>
        {myRankData.data && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
              width: 'calc(100% - 3rem)', maxWidth: '1000px', zIndex: 100
            }}
          >
            <div style={{ 
              background: 'rgba(10, 12, 16, 0.95)', backdropFilter: 'blur(30px)',
              border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '32px',
              padding: '1.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 40px ${currentLeague.color}11`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>SECTOR RANK</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>#{myRankData.rank}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '14px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900, fontSize: '1.2rem'
                  }}>
                    {myRankData.data.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{myRankData.data.name}</div>
                    <div style={{ fontSize: '0.75rem', color: currentLeague.accent, fontWeight: 900 }}>{activeLeague.toUpperCase()} PROTOCOL</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <Zap size={22} color={currentLeague.accent} />
                  <span style={{ fontSize: '2rem', fontWeight: 900 }}>{myRankData.data.xp?.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '1px' }}>ACCUMULATED NEURAL DATA</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
