'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Zap, Crown, Medal, Shield, 
  Sparkles, ChevronRight, Binary, Award, Crosshair
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';
import BentoWrapper from '../components/BentoWrapper';
import AuroraBackground from '../components/AuroraBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import './Leaderboard.css';

const LEAGUES = [
  { id: 'Bronze', name: 'BRONZE', color: '#cd7f32', accent: '#ff9d42' },
  { id: 'Silver', name: 'SILVER', color: '#c0c0c0', accent: '#e2e8f0' },
  { id: 'Gold', name: 'GOLD', color: '#ffd700', accent: '#fde047' },
  { id: 'Hacker-Tier', name: 'CYBER', color: '#8b5cf6', accent: '#c084fc' }
];

// --- 3D Podium Component ---
const Podium = ({ top3 }) => {
  return (
    <div className="podium-container">
      {/* 2nd Place */}
      {top3[1] && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="podium-item second"
        >
          <div className="podium-avatar silver">
            <span className="avatar-letter">{top3[1].name?.charAt(0)}</span>
          </div>
          <div className="podium-info">
            <Medal size={20} className="rank-icon silver" />
            <span className="user-name">{top3[1].name}</span>
            <span className="user-xp">{top3[1].xp?.toLocaleString()} XP</span>
          </div>
          <div className="podium-base silver-base">
            <span className="rank-num">2</span>
          </div>
        </motion.div>
      )}

      {/* 1st Place */}
      {top3[0] && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="podium-item first"
        >
          <div className="podium-avatar gold">
             <Crown size={32} className="crown-icon" />
             <span className="avatar-letter">{top3[0].name?.charAt(0)}</span>
          </div>
          <div className="podium-info">
            <Sparkles size={20} className="rank-icon gold" />
            <span className="user-name">{top3[0].name}</span>
            <span className="user-xp">{top3[0].xp?.toLocaleString()} XP</span>
          </div>
          <div className="podium-base gold-base">
            <span className="rank-num">1</span>
          </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {top3[2] && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="podium-item third"
        >
          <div className="podium-avatar bronze">
            <span className="avatar-letter">{top3[2].name?.charAt(0)}</span>
          </div>
          <div className="podium-info">
            <Medal size={20} className="rank-icon bronze" />
            <span className="user-name">{top3[2].name}</span>
            <span className="user-xp">{top3[2].xp?.toLocaleString()} XP</span>
          </div>
          <div className="podium-base bronze-base">
            <span className="rank-num">3</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- Tactical User Row ---
const TacticalUserRow = ({ user, rank, isMe, leagueColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.03)' }}
      className={`tactical-row ${isMe ? 'is-me' : ''}`}
    >
      <div className="row-rank">#{rank}</div>
      <div className="row-avatar">
        {user.name?.charAt(0)}
      </div>
      <div className="row-info">
        <div className="user-name-group">
          <span className="name">{user.name}</span>
          {isMe && <span className="me-badge">YOU</span>}
        </div>
        <div className="user-level-bar">
           <div className="level-label">LVL {calculateLevel(user.xp || 0)}</div>
           <div className="progress-mini"><div className="fill" style={{ width: `${(user.xp % 100)}%` }} /></div>
        </div>
      </div>
      <div className="row-stats">
        <Zap size={14} color={leagueColor} />
        <span className="xp-val">{user.xp?.toLocaleString()}</span>
      </div>
      <ChevronRight size={16} className="row-arrow" />
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

  return (
    <BentoWrapper>
      <AuroraBackground />
      <div className="leaderboard-container">
        <header className="leaderboard-header">
          <div className="header-title-group">
            <div className="eyebrow">
               <Crosshair size={14} />
               <span>OPERATIVE RANKINGS</span>
            </div>
            <h1 className="title">{currentLeague.name} <span className="dim">DIVISION</span></h1>
          </div>

          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search operative archives..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="league-switcher">
              {LEAGUES.map(league => (
                <button
                  key={league.id}
                  className={`league-btn ${activeLeague === league.id ? 'active' : ''}`}
                  onClick={() => setActiveLeague(league.id)}
                >
                  {league.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="leaderboard-loading">
            <LoadingSpinner message="SYNCING WITH HIERARCHY SERVERS..." />
          </div>
        ) : (
          <div className="leaderboard-content">
            {!searchTerm && top3.length > 0 && <Podium top3={top3} />}

            <div className="ranking-list">
              <div className="list-columns">
                <span>RANK</span>
                <span>OPERATIVE</span>
                <span>NEURAL DATA</span>
              </div>
              {rest.map((user, i) => (
                <TacticalUserRow 
                  key={user._id} 
                  user={user} 
                  rank={i + 4} 
                  isMe={user.username === session?.user?.username} 
                  leagueColor={currentLeague.color} 
                />
              ))}
              {searchTerm && top3.map((user, i) => (
                <TacticalUserRow 
                  key={user._id} 
                  user={user} 
                  rank={i + 1} 
                  isMe={user.username === session?.user?.username} 
                  leagueColor={currentLeague.color} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </BentoWrapper>
  );
}
