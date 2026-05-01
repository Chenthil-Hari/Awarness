'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import TrophyIcon from '../components/TrophyIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { Medal, Star, Target, Crown, Shield, Zap, Swords, Info, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { calculateLevel } from '@/lib/game';

const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Hacker-Tier'];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [errorMsg, setErrorMsg] = useState(null);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/leaderboard?league=${activeLeague}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");
        return data;
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setUsers([]);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, [activeLeague]);

  const userRank = users.findIndex(u => u.username === session?.user?.username) + 1;
  const currentUser = users.find(u => u.username === session?.user?.username) || session?.user;
  const currentLevel = calculateLevel(currentUser?.xp || 0);

  // Zone Logic: Promotion (1-15), Safety (16-27), Demotion (28+)
  const getZone = (rank) => {
    if (rank <= 15) return 'Promotion';
    if (rank <= 27) return 'Safety';
    return 'Demotion';
  };

  const getRankIndicatorPosition = () => {
    if (userRank === 0) return '100%'; // Not in top 50
    const totalRanks = 30; // Scale based on 30 ranks as per design
    const pos = ((30 - userRank) / 30) * 100;
    return `${Math.max(0, Math.min(100, pos))}%`;
  };

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      <Navbar />

      <div style={{ marginTop: '3rem' }}>
        {/* Alert Header */}
        <AnimatePresence>
          {showAlert && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}
            >
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 900 }}>!</div>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>
                Don't worry if there's a small calculation error. Any missing points will be verified & added soon!
              </p>
              <button onClick={() => setShowAlert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', position: 'absolute', right: '1rem' }}><X size={18} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Status Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
             <div style={{ opacity: 0.3 }}><Shield size={40} /></div>
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               style={{ position: 'relative' }}
             >
               <div style={{ width: '120px', height: '140px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, opacity: 0.6 }}>{currentLevel}</span>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 900, marginTop: '0.5rem' }}>Level {currentLevel}</div>
               </div>
               {/* Visual Pedestal */}
               <div style={{ width: '160px', height: '20px', background: 'rgba(124, 58, 237, 0.4)', borderRadius: '50%', margin: '-10px auto 0', filter: 'blur(5px)' }} />
               <div style={{ width: '100px', height: '10px', background: 'linear-gradient(to right, transparent, var(--accent-primary), transparent)', margin: '10px auto 0' }} />
             </motion.div>
             <div style={{ opacity: 0.3 }}><Crown size={40} /></div>
          </div>
        </div>

        {/* Zone Logic Bar */}
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto 3rem', padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
               Leaderboard updates in <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>2 days</span>
               <Info size={14} />
            </div>
          </div>

          <div style={{ position: 'relative', height: '80px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ flex: '15', background: 'rgba(16, 185, 129, 0.1)', borderRight: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Promotion Zone</span>
              </div>
              <div style={{ flex: '12', background: 'rgba(245, 158, 11, 0.1)', borderRight: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Safety Zone</span>
              </div>
              <div style={{ flex: '3', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Demotion Zone</span>
              </div>
            </div>

            {/* Scale Numbers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <span>30</span>
              <span>Ranks</span>
              <span>27</span>
              <span>Ranks</span>
              <span>15</span>
              <span>Ranks</span>
              <span>1</span>
            </div>

            {/* Rank Indicator */}
            {userRank > 0 && (
              <motion.div 
                initial={{ left: '0%' }}
                animate={{ left: getRankIndicatorPosition() }}
                style={{ position: 'absolute', top: '-10px', transform: 'translateX(-50%)', zIndex: 10 }}
              >
                <div style={{ background: 'white', border: '2px solid var(--accent-primary)', borderRadius: '12px', padding: '0.5rem 1.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--bg-primary)', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                  Rank: {userRank}
                </div>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent-primary)', borderRadius: '50%', margin: '8px auto', boxShadow: '0 0 10px var(--accent-primary)' }} />
              </motion.div>
            )}
          </div>
        </div>

        {/* User List */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {loading ? (
            <LoadingSpinner message="Decrypting rankings..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {users.map((user, index) => {
                const rank = index + 1;
                const zone = getZone(rank);
                const isMe = user.username === session?.user?.username;

                return (
                  <motion.div
                    key={user._id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ 
                      background: isMe ? 'rgba(124, 58, 237, 0.05)' : 'white',
                      border: isMe ? '1px solid var(--accent-primary)' : '1px solid #f3f4f6',
                      borderRadius: '16px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isMe ? '0 10px 30px rgba(124, 58, 237, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: rank <= 3 ? (rank === 1 ? '#f59e0b' : rank === 2 ? '#6366f1' : '#10b981') : '#f3f4f6', color: rank <= 3 ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>
                         {rank}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#64748b' }}>
                            {user.name?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{user.name} {isMe && '(You)'}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Level {calculateLevel(user.xp || 0)}</p>
                          </div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1e293b' }}>{user.xp || 0}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginLeft: '0.4rem', textTransform: 'uppercase' }}>XP</span>
                       </div>
                       <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <ChevronRight size={14} />
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
