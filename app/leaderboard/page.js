'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Zap, Crown, Medal, Shield, 
  Sparkles, ChevronRight, Binary, Award, Crosshair,
  Target, Activity, TrendingUp
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';
import BentoWrapper from '../components/BentoWrapper';
import AuroraBackground from '../components/AuroraBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import ScrambleText from '../components/ScrambleText';
import './Leaderboard.css';

const LEAGUES = [
  { id: 'Bronze', name: 'BRONZE', color: '#cd7f32', accent: '#ff9d42' },
  { id: 'Silver', name: 'SILVER', color: '#c0c0c0', accent: '#e2e8f0' },
  { id: 'Gold', name: 'GOLD', color: '#ffd700', accent: '#fde047' },
  { id: 'Hacker-Tier', name: 'CYBER', color: '#8b5cf6', accent: '#c084fc' }
];

const RankNode = ({ user, rank, isMe, leagueColor }) => {
  const isTop3 = rank <= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01, x: 5 }}
      className={`rank-node ${isMe ? 'is-me' : ''} ${isTop3 ? 'is-top' : ''}`}
    >
      <div className="node-rank-bg">{rank < 10 ? `0${rank}` : rank}</div>
      
      <div className="node-main">
        <div className="node-rank-badge">
           {rank === 1 && <Crown size={24} className="gold-text" />}
           {rank === 2 && <Medal size={24} className="silver-text" />}
           {rank === 3 && <Medal size={24} className="bronze-text" />}
           {rank > 3 && <span className="rank-text">{rank}</span>}
        </div>

        <div className="node-avatar">
          {user.name?.charAt(0)}
          {isMe && <div className="me-indicator" />}
        </div>

        <div className="node-info">
          <div className="node-name-row">
            <span className="node-name">{user.name}</span>
            <span className="node-level">LVL {calculateLevel(user.xp || 0)}</span>
          </div>
          <div className="node-progress-container">
             <div className="node-progress-bar">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${(user.xp % 100)}%` }}
                 className="node-progress-fill"
                 style={{ background: isTop3 ? leagueColor : 'var(--accent-primary)' }}
               />
             </div>
          </div>
        </div>

        <div className="node-stats">
          <div className="stat">
            <Zap size={14} className="stat-icon" />
            <span className="stat-val">{user.xp?.toLocaleString()}</span>
            <span className="stat-label">NEURAL DATA</span>
          </div>
        </div>

        <div className="node-action">
          <ChevronRight size={20} />
        </div>
      </div>
      
      {/* Scanline Effect on Hover */}
      <div className="node-scanner" />
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

  return (
    <BentoWrapper>
      <AuroraBackground />
      <div className="leaderboard-grid-view">
        <header className="lb-grid-header">
          <div className="lb-title-box">
            <div className="lb-eyebrow">
              <Binary size={14} />
              <ScrambleText text="NEURAL HIERARCHY ARCHIVES" delay={300} />
            </div>
            <h1 className="lb-title">{currentLeague.name} <span>PROTOCOL</span></h1>
          </div>

          <div className="lb-controls">
            <div className="lb-search">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search operative ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lb-leagues">
              {LEAGUES.map(league => (
                <button
                  key={league.id}
                  className={`lb-league-tab ${activeLeague === league.id ? 'active' : ''}`}
                  onClick={() => setActiveLeague(league.id)}
                >
                  {league.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="lb-loading">
            <LoadingSpinner message="ACCESSING SECTOR DATA..." />
          </div>
        ) : (
          <div className="lb-nodes-container">
            {filteredUsers.map((user, i) => (
              <RankNode 
                key={user._id} 
                user={user} 
                rank={i + 1} 
                isMe={user.username === session?.user?.username} 
                leagueColor={currentLeague.color} 
              />
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="lb-empty">
                <Crosshair size={48} />
                <p>No operatives found in this sector.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </BentoWrapper>
  );
}
