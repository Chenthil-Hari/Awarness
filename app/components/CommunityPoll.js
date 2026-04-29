'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { BarChart3, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CommunityPoll() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    if (poll?._id && session?.user?.id) {
      const claimed = localStorage.getItem(`poll_claimed_${poll._id}_${session.user.id}`);
      if (claimed) setRewardClaimed(true);
      else setRewardClaimed(false);
    }
  }, [poll, session]);

  useEffect(() => {
    fetchPoll();
  }, [session]);

  const fetchPoll = async () => {
    try {
      const res = await fetch('/api/polls/active');
      const data = await res.json();
      setPoll(data);
      
      // Handle different vote storage formats (string vs object)
      const userVote = data.votedBy?.find(v => 
        (typeof v === 'string' && v === session?.user?.id) || 
        (typeof v === 'object' && v.userId === session?.user?.id)
      );
      
      if (userVote) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Failed to fetch poll:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = () => {
    if (!poll?._id || !session?.user?.id) return;
    setRewardClaimed(true);
    localStorage.setItem(`poll_claimed_${poll._id}_${session.user.id}`, 'true');
  };

  const handleVote = async (optionId) => {
    if (!session || hasVoted || voting) return;

    setVoting(true);
    try {
      const res = await fetch('/api/polls/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll._id, optionId }),
      });
      const updatedPoll = await res.json();
      if (!updatedPoll.error) {
        setPoll(updatedPoll);
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Voting error:", error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <BarChart3 size={24} opacity={0.5} />
      </motion.div>
    </div>
  );

  if (!poll || poll.error || !poll.options) return null;

  const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
  const isPublished = poll.status === 'published';
  const userVote = poll.votedBy?.find(v => 
    (typeof v === 'object' && v.userId === session?.user?.id)
  );
  const isWinner = isPublished && userVote && poll.correctOptionIds?.includes(userVote.optionId);

  return (
    <div className="glass-card" style={{ 
      padding: '2rem', 
      borderRadius: 'var(--radius-xl)', 
      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {isPublished && !rewardClaimed && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900, boxShadow: '0 0 15px var(--accent-primary)' }}>
          RESULTS OUT
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
          <Users size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Community <span className="gradient-text">Pulse</span></h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{totalVotes} total votes</p>
        </div>
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
        {poll.question}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AnimatePresence mode="wait">
          {rewardClaimed ? (
            <motion.div 
              key="claimed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '3rem 1rem' }}
            >
              <div style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#10b981' }}>
                <CheckCircle2 size={32} />
              </div>
              <h5 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Mission Completed</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You've collected your rewards. Stand by for the next community poll!</p>
            </motion.div>
          ) : !hasVoted && !isPublished ? (
            <motion.div 
              key="voting"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {poll.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02, background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote(option.id)}
                  disabled={!session || voting}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: session ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {option.text}
                  {voting && <div className="spinner-small" />}
                </motion.button>
              ))}
              {!session && (
                <p style={{ fontSize: '0.7rem', color: '#f87171', textAlign: 'center', marginTop: '0.5rem' }}>
                  <AlertCircle size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Login required to vote
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              {poll.options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isCorrect = isPublished && poll.correctOptionIds?.includes(option.id);
                const userChoseThis = userVote?.optionId === option.id;

                return (
                  <div key={option.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <span style={{ color: isCorrect ? '#10b981' : 'var(--text-primary)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {option.text}
                        {isCorrect && <CheckCircle2 size={14} />}
                        {userChoseThis && !isCorrect && isPublished && <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>(Your Choice)</span>}
                      </span>
                      <span style={{ color: isCorrect ? '#10b981' : 'var(--accent-secondary)' }}>{percentage}%</span>
                    </div>
                    <div style={{ height: '100%', minHeight: '8px', background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden', border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : 'none' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: '8px', background: isCorrect ? '#10b981' : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {isPublished ? (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: isWinner ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '12px', border: isWinner ? '1px solid #10b981' : '1px solid var(--glass-border)' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: isWinner ? '#10b981' : 'var(--text-primary)' }}>
                      {isWinner ? '🎯 CRITICAL HIT! YOU WERE CORRECT' : '🛡️ INTEL RECEIVED'}
                    </p>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {isWinner ? `You have earned +${poll.xpAmount || 50} XP for your awareness.` : 'The correct answers are highlighted in green. Better luck next time!'}
                    </p>
                  </div>
                  <button onClick={handleClaimReward} className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                    {isWinner ? 'COLLECT REWARDS' : 'ACKNOWLEDGE INTEL'}
                  </button>
                </div>
              ) : (
                <div style={{ 
                  marginTop: '1rem', padding: '0.75rem', 
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px', color: '#10b981', fontSize: '0.8rem', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} /> Vote recorded! Awaiting official results.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
