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

  useEffect(() => {
    fetchPoll();
  }, [session]);

  const fetchPoll = async () => {
    try {
      const res = await fetch('/api/polls/active');
      const data = await res.json();
      setPoll(data);
      if (session?.user?.id && data.votedBy?.includes(session.user.id)) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error("Failed to fetch poll:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="glass-card" style={{ 
      padding: '2rem', 
      borderRadius: 'var(--radius-xl)', 
      background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      height: '100%'
    }}>
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
          {!hasVoted ? (
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
                  <AlertCircle size(10) style={{ verticalAlign: 'middle', marginRight: '4px' }} />
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
                return (
                  <div key={option.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)', opacity: 0.8 }}>{option.text}</span>
                      <span style={{ color: 'var(--accent-secondary)' }}>{percentage}%</span>
                    </div>
                    <div style={{ height: '100%', minHeight: '8px', background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: '8px', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                      />
                    </div>
                  </div>
                );
              })}
              <div style={{ 
                marginTop: '1rem', padding: '0.75rem', 
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px', color: '#10b981', fontSize: '0.8rem', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} /> Vote recorded! Check back tomorrow.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
