'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldCheck, AlertCircle, Zap, Search, Brain, Trophy } from 'lucide-react';
import Link from 'next/link';

const LEVELS = [
  {
    id: 1,
    title: 'Facial Anomalies',
    description: 'Look for skin texture inconsistencies and symmetrical errors.',
    image: '/images/deepfake_1.png',
    correctAnswer: 'left',
    clue: 'AI often struggles with complex ear geometry and jewelry symmetry.',
    xpReward: 250
  },
  {
    id: 2,
    title: 'Lighting & Physics',
    description: 'Identify unnatural light reflections in the eyes.',
    image: '/images/deepfake_1.png', // Placeholder for now
    correctAnswer: 'right',
    clue: 'Dynamic eye reflections are difficult for generative models to simulate perfectly.',
    xpReward: 350
  }
];

export default function DeepfakeDetectivePage() {
  const { data: session, status } = useSession();
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const level = LEVELS[currentLevelIdx];

  const handleChoice = (choice) => {
    setSelected(choice);
    const correct = choice === level.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(prev => prev + level.xpReward);
      // In a real app, you would call an API to award XP here
    }
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowResult(false);
    } else {
      alert(`Simulation Complete! Total XP Earned: ${score}`);
    }
  };

  if (status === 'loading') return <LoadingSpinner message="Calibrating Optical Sensors..." />;

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '3rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Eye size={24} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '3px' }}>AI LITERACY LAB</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>DEEPFAKE <span className="gradient-text">DETECTIVE</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Level {level.id}: {level.title}. Analyze the biological signatures to identify the authentic human.
            </p>
          </motion.div>
        </header>

        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Comparison View */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            position: 'relative'
          }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => !showResult && handleChoice('left')}
              style={{
                cursor: showResult ? 'default' : 'pointer',
                borderRadius: '24px',
                overflow: 'hidden',
                border: selected === 'left' ? `4px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'}` : '2px solid var(--glass-border)',
                position: 'relative'
              }}
            >
              <img src={level.image} alt="Target A" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 900, fontSize: '0.8rem' }}>TARGET ALPHA</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => !showResult && handleChoice('right')}
              style={{
                cursor: showResult ? 'default' : 'pointer',
                borderRadius: '24px',
                overflow: 'hidden',
                border: selected === 'right' ? `4px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'}` : '2px solid var(--glass-border)',
                position: 'relative'
              }}
            >
              <img src={level.image} alt="Target B" style={{ width: '100%', height: 'auto', display: 'block', transform: 'scaleX(-1)' }} />
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 900, fontSize: '0.8rem' }}>TARGET BETA</div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '2rem',
                  padding: '2rem',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '24px',
                  border: `1px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {isCorrect ? (
                    <ShieldCheck size={32} color="var(--accent-success)" />
                  ) : (
                    <AlertCircle size={32} color="var(--accent-danger)" />
                  )}
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{isCorrect ? 'NEUTRALIZED' : 'DECEPTION DETECTED'}</h2>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
                  {isCorrect ? `Correct. ${level.clue}` : `Incorrect. You fell for the synthetic generation. ${level.clue}`}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} color="var(--accent-warning)" />
                    <span style={{ fontWeight: 900 }}>+{isCorrect ? level.xpReward : 0} XP earned</span>
                  </div>
                  <button onClick={nextLevel} className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                    {currentLevelIdx < LEVELS.length - 1 ? 'NEXT ANALYTIC' : 'COMPLETE EVALUATION'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips Panel */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Brain size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>ANATOMY</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Check ears and teeth. AI often creates "ghost" jewelry or mismatched tooth counts.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Search size={18} color="var(--accent-secondary)" />
                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>BACKGROUND</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Look for "melted" objects in the background or floating hair strands.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Trophy size={18} color="var(--accent-warning)" />
                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>REWARDS</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Earn up to 1,000 XP by completing the full analytic battery.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
