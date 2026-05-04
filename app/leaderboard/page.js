'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Search, Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { calculateLevel } from '@/lib/game';
import LoadingSpinner from '../components/LoadingSpinner';
import './leaderboard.css';

const LEAGUES = [
  { id: 'Bronze',      label: 'LEAGUE' },
  { id: 'Silver',      label: 'SILVER' },
  { id: 'Gold',        label: 'GLOBAL' },
  { id: 'Hacker-Tier', label: 'REGION' },
];

/* ── helpers ── */
function initials(name = '') {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '??';
}

function PodiumPerson({ user, rank, xp }) {
  const cls = `pod-${rank}`;
  const heights = { 1: 90, 2: 68, 3: 54 };
  const avatarColors = {
    1: { bg: '#e09a10', border: '#ffd700' },
    2: { bg: '#6a8aaa', border: '#c0d0e0' },
    3: { bg: '#9a7a5a', border: '#d0a878' },
  };

  if (!user) return null;
  const ac = avatarColors[rank];

  return (
    <div className={`pod-wrap pod-${rank}-wrap`} style={{ paddingBottom: 0 }}>
      {rank === 1 && (
        <svg className="pod-crown" viewBox="0 0 22 16" fill="none">
          <path d="M1 14L4 5L8 10L11 2L14 10L18 5L21 14H1Z" fill="#f5c842" stroke="#c8960a" strokeWidth="1"/>
          <rect x="1" y="13" width="20" height="2.5" rx="1" fill="#c8960a"/>
        </svg>
      )}
      <div
        className={`pod-avatar pod-${rank}-avatar`}
        style={{
          background: ac.bg,
          borderColor: ac.border,
          width: rank === 1 ? 58 : 52,
          height: rank === 1 ? 58 : 52,
          fontSize: rank === 1 ? 17 : 15,
          borderWidth: 3,
        }}
      >
        {initials(user.name)}
      </div>
      <div className="pod-name" style={rank === 1 ? { color: '#ffd700', fontSize: 14 } : {}}>
        {user.name?.split(' ')[0]}
      </div>
      <div
        className={`pod-block pod-${rank}-block pod-${rank}-wrap`}
        style={{ height: heights[rank] }}
      >
        {rank}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeLeague, setActiveLeague] = useState('Bronze');
  const [searchTerm, setSearchTerm] = useState('');

  const handleChallenge = (user) => {
    router.push(`/duels?opponentId=${user._id}&opponentName=${encodeURIComponent(user.name)}`);
  };

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/leaderboard?league=${activeLeague}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [activeLeague]);

  const filtered = useMemo(
    () => users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm],
  );

  const [top1, top2, top3, ...rest] = filtered;

  return (
    <div className="lb-page">
      <div className="lb-wrap">

        {/* ── TOP BAR ── */}
        <div className="lb-top-bar">
          <div className="lb-logo">
            <svg viewBox="0 0 22 22" fill="none" width="22" height="22">
              <path d="M11 2L13.5 8H20L14.5 12L16.5 18.5L11 14.5L5.5 18.5L7.5 12L2 8H8.5Z" fill="#f5c842" stroke="#c8960a" strokeWidth="1"/>
            </svg>
            LEADERBOARD
          </div>

          <div className="lb-tabs">
            {LEAGUES.map(l => (
              <button
                key={l.id}
                className={`lb-tab ${activeLeague === l.id ? 'active' : ''}`}
                onClick={() => setActiveLeague(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="lb-season">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4h10v6a5 5 0 01-10 0V4z" fill="#f5c842" opacity=".3" stroke="#f5c842" strokeWidth="1.5"/>
              <path d="M1 4h2M15 4h2" stroke="#f5c842" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {filtered.length}
          </div>
        </div>

        {/* ── SEARCH ── */}
        <div className="lb-search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Find operative..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ── SKY / PODIUM ── */}
        {!loading && filtered.length >= 1 && (
          <div className="lb-sky">
            <svg className="lb-sky-clouds" viewBox="0 0 680 40" preserveAspectRatio="none">
              <ellipse cx="80"  cy="25" rx="60" ry="15" fill="white"/>
              <ellipse cx="120" cy="20" rx="45" ry="12" fill="white"/>
              <ellipse cx="300" cy="28" rx="70" ry="14" fill="white"/>
              <ellipse cx="340" cy="22" rx="50" ry="12" fill="white"/>
              <ellipse cx="560" cy="25" rx="65" ry="15" fill="white"/>
              <ellipse cx="600" cy="18" rx="48" ry="12" fill="white"/>
            </svg>

            <div className="lb-podium-area">
              <PodiumPerson user={top2} rank={2} />
              <PodiumPerson user={top1} rank={1} />
              <PodiumPerson user={top3} rank={3} />
            </div>
          </div>
        )}

        {/* ── ROW LIST ── */}
        <div className="lb-body">
          {loading ? (
            <div className="lb-loader"><LoadingSpinner message="Retrieving data..." /></div>
          ) : filtered.length === 0 ? (
            <div className="lb-empty">No operatives found.</div>
          ) : (
            <>
              {/* header row */}
              <div className="lb-list-head">
                <span>#</span>
                <span>Operative</span>
                <span style={{ textAlign: 'center' }}>Level</span>
                <span style={{ textAlign: 'right' }}>XP</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </div>

              {filtered.map((user, i) => {
                const rank = i + 1;
                const isMe = user.username === session?.user?.username;
                const lvl  = calculateLevel(user.xp || 0);

                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    className={`lb-row ${isMe ? 'me' : ''}`}
                  >
                    {/* rank */}
                    <span className="lb-rank">{rank}</span>

                    {/* name */}
                    <div className={`lb-name ${isMe ? 'is-me-name' : ''}`}>
                      <div className="lb-avatar-mini">{initials(user.name)}</div>
                      <span>{user.name}</span>
                      {isMe && <span className="you-badge">YOU</span>}
                    </div>

                    {/* level */}
                    <span className="lb-stat stat-lvl">LV {lvl}</span>

                    {/* xp */}
                    <span className="lb-stat stat-xp">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <polygon points="7,1 9,5.5 14,6 10.5,9.5 11.5,14 7,11.5 2.5,14 3.5,9.5 0,6 5,5.5" fill="#5dca8a"/>
                      </svg>
                      {(user.xp || 0).toLocaleString()}
                    </span>

                    {/* action */}
                    <div className="lb-action">
                      {!isMe && (
                        <button
                          className="challenge-btn"
                          onClick={() => handleChallenge(user)}
                        >
                          <Swords size={12} /> DUEL
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
