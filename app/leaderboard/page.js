'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Zap, Crown, Medal, Shield, 
  Sparkles, ChevronRight, Binary, Award, Crosshair,
  Target, Activity, TrendingUp, ZapOff, Fingerprint
} from 'lucide-react';
import { calculateLevel } from '@/lib/game';
import BentoWrapper from '../components/BentoWrapper';
import AuroraBackground from '../components/AuroraBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import ScrambleText from '../components/ScrambleText';
import './SpireLeaderboard.css';

const LEAGUES = [
  { id: 'Bronze', name: 'BRONZE', color: '#cd7f32', accent: '#ff9d42' },
  { id: 'Silver', name: 'SILVER', color: '#c0c0c0', accent: '#e2e8f0' },
  { id: 'Gold', name: 'GOLD', color: '#ffd700', accent: '#fde047' },
  { id: 'Hacker-Tier', name: 'CYBER', color: '#8b5cf6', accent: '#c084fc' }
];

const SpireNode = ({ user, rank, isMe, leagueColor }) => {
  const isTop3 = rank <= 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: rank % 2 === 0 ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className={`spire-node-wrapper ${isMe ? 'is-me' : ''} ${rank % 2 === 0 ? 'even' : 'odd'}`}
    >
      <div className="node-connector" style={{ background: isTop3 ? leagueColor : 'var(--accent-primary)' }} />
      
      <div className={`spire-node-card ${isTop3 ? 'top-tier' : ''}`} style={{ borderColor: isTop3 ? leagueColor : 'rgba(255,255,255,0.05)' }}>
        <div className="node-rank-box">
          <span className="rank-label">RANK</span>
          <span className="rank-val">{rank}</span>
        </div>

        <div className="node-main-content">
          <div className="node-header">
            <div className="node-avatar-container">
              <div className="avatar-frame" style={{ borderColor: isTop3 ? leagueColor : 'var(--accent-primary)' }}>
                {user.name?.charAt(0)}
              </div>
              {isTop3 && <Crown size={16} className="tier-icon" style={{ color: leagueColor }} />}
            </div>
            <div className="node-identity">
              <h3 className="user-name">{user.name}</h3>
              <div className="level-badge">LVL {calculateLevel(user.xp || 0)}</div>
            </div>
          </div>

          <div className="node-stats-grid">
             <div className="stat-box">
               <span className="label">NEURAL DATA</span>
               <div className="val-group">
                 <Zap size={14} className="icon" />
                 <span className="val">{user.xp?.toLocaleString()}</span>
               </div>
             </div>
             <div className="stat-box">
               <span className="label">LEAGUE</span>
               <span className="val-text" style={{ color: leagueColor }}>{user.league?.toUpperCase() || 'UNRANKED'}</span>
             </div>
          </div>

          <div className="node-xp-bar">
            <div className="bar-outer">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${(user.xp % 100)}%` }}
                className="bar-inner"
                style={{ background: isTop3 ? leagueColor : 'var(--accent-primary)', boxShadow: `0 0 10px ${isTop3 ? leagueColor : 'var(--accent-primary)'}` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative Scanned Background */}
        <div className="node-id-bg">{user.username?.slice(0, 4)}</div>
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

  return (
    <BentoWrapper>
      <AuroraBackground />
      <div className="spire-leaderboard">
        <header className="spire-header">
          <div className="spire-title-group">
            <div className="eyebrow">
              <Fingerprint size={16} />
              <ScrambleText text="NEURAL HIERARCHY VERIFICATION" delay={500} />
            </div>
            <h1 className="main-title">THE <span style={{ color: currentLeague.accent }}>{currentLeague.name}</span> SPIRE</h1>
          </div>

          <div className="spire-controls">
            <div className="spire-search">
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Locate Operative..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="spire-tabs">
              {LEAGUES.map(league => (
                <button
                  key={league.id}
                  className={`spire-tab ${activeLeague === league.id ? 'active' : ''}`}
                  onClick={() => setActiveLeague(league.id)}
                >
                  {league.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="spire-loading">
            <LoadingSpinner message="CONNECTING TO SPIRE CORE..." />
          </div>
        ) : (
          <div className="spire-container">
            <div className="spire-core-line" />
            
            <div className="spire-nodes">
              {filteredUsers.map((user, i) => (
                <SpireNode 
                  key={user._id} 
                  user={user} 
                  rank={i + 1} 
                  isMe={user.username === session?.user?.username} 
                  leagueColor={currentLeague.color} 
                />
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="spire-empty">
                   <ZapOff size={48} />
                   <h3>SIGNAL LOST</h3>
                   <p>No operatives detected in this sector.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BentoWrapper>
  );
}
