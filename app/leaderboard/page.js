'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Search, Zap, Trophy, ChevronRight, User } from 'lucide-react';
import { calculateLevel } from '@/lib/game';
import BentoWrapper from '../components/BentoWrapper';
import AuroraBackground from '../components/AuroraBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import './SimpleLeaderboard.css';

const LEAGUES = [
  { id: 'Bronze', name: 'Bronze', color: '#cd7f32' },
  { id: 'Silver', name: 'Silver', color: '#c0c0c0' },
  { id: 'Gold', name: 'Gold', color: '#ffd700' },
  { id: 'Hacker-Tier', name: 'Cyber', color: '#8b5cf6' }
];

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="simple-lb-container">
        <header className="lb-header-simple">
          <div className="title-group">
            <h1 className="lb-title-main">Rankings</h1>
            <p className="lb-subtitle">The top performing operatives in the {activeLeague} protocol.</p>
          </div>

          <div className="lb-actions-simple">
            <div className="lb-search-simple">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Find operative..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="lb-league-nav">
              {LEAGUES.map(l => (
                <button 
                  key={l.id} 
                  className={`league-item ${activeLeague === l.id ? 'active' : ''}`}
                  onClick={() => setActiveLeague(l.id)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="lb-loader-simple">
            <LoadingSpinner message="Retrieving data..." />
          </div>
        ) : (
          <div className="lb-list-simple">
            <div className="lb-list-head">
              <span>#</span>
              <span>Operative</span>
              <span>Level</span>
              <span>Neural Data</span>
            </div>
            
            {filteredUsers.map((user, i) => {
              const rank = i + 1;
              const isMe = user.username === session?.user?.username;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={user._id} 
                  className={`lb-row-simple ${isMe ? 'is-me' : ''}`}
                >
                  <div className="rank-col">
                    {rank === 1 && <Trophy size={16} color="#ffd700" />}
                    {rank === 2 && <Trophy size={16} color="#c0c0c0" />}
                    {rank === 3 && <Trophy size={16} color="#cd7f32" />}
                    {rank > 3 && <span>{rank}</span>}
                  </div>

                  <div className="name-col">
                    <div className="avatar-mini">{user.name?.charAt(0)}</div>
                    <span className="user-name">{user.name}</span>
                    {isMe && <span className="you-label">YOU</span>}
                  </div>

                  <div className="level-col">
                    LVL {calculateLevel(user.xp || 0)}
                  </div>

                  <div className="xp-col">
                    <Zap size={14} />
                    <span>{user.xp?.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BentoWrapper>
  );
}
