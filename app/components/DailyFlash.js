'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, AlertCircle, ChevronRight, Lock } from 'lucide-react';
import { getTodayFlash } from '../data/flashChallenges';
import confetti from 'canvas-confetti';

export default function DailyFlash() {
  const [challenge, setChallenge] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Generate a seed based on the current date (YYYYMMDD)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seed = parseInt(today);
    setChallenge(getTodayFlash(seed));

    // Check if already completed today
    const lastDone = localStorage.getItem('last_flash_done');
    if (lastDone === today) {
      setCompleted(true);
    }
  }, []);

  const handleOptionSelect = (option, index) => {
    if (selectedOption !== null || completed) return;
    
    setSelectedOption(index);
    const correct = option.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#06b6d4', '#ffffff']
      });
      
      // Award XP via global event (HUD listens to this)
      window.dispatchEvent(new CustomEvent('xp-update', { 
        detail: { xp: (window.currentXp || 0) + challenge.xp } 
      }));
    }

    // Mark as done
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    localStorage.setItem('last_flash_done', today);
    setTimeout(() => setCompleted(true), 2000);
  };

  if (!challenge) return null;

  return (
    <div className="daily-flash-container" style={{
      background: 'rgba(30, 30, 40, 0.4)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '100px', height: '100px',
        background: 'var(--accent-primary)',
        filter: 'blur(60px)', opacity: 0.2
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-warning)" fill="var(--accent-warning)" />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '2px' }}>DAILY FLASH</span>
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
          +{challenge.xp} XP
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.5rem', color: 'white' }}>{challenge.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.2rem', lineHeight: 1.4 }}>{challenge.question}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {challenge.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(option, idx)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: selectedOption === idx 
                      ? (option.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedOption === idx
                      ? `1px solid ${option.correct ? '#10b981' : '#ef4444'}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    color: selectedOption === idx ? 'white' : 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {option.text}
                  {selectedOption === idx && (
                    option.correct ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />
                  )}
                </motion.button>
              ))}
            </div>

            {showFeedback && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  marginTop: '1rem', fontSize: '0.75rem', 
                  color: isCorrect ? '#10b981' : '#ef4444',
                  fontWeight: 600, fontStyle: 'italic'
                }}
              >
                {challenge.options[selectedOption].feedback}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              height: '160px', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.5rem'
            }}
          >
            <div style={{ 
              width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' 
            }}>
              <Lock size={20} color="#10b981" />
            </div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>DAILY LINK STABILIZED</h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Come back in 24h for your next neural sync.</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>STREAK: 1 DAY</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
