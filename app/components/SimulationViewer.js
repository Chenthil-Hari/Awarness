'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, X, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSimulation } from '../hooks/useSimulation';

export default function SimulationViewer({ scenario, onExit }) {
  const { data: session } = useSession();
  const {
    currentStep,
    score,
    isComplete,
    lastFeedback,
    makeDecision,
    reset
  } = useSimulation(scenario);

  useEffect(() => {
    if (isComplete && !currentStep.failed) {
      // Award XP and Badge
      const badge = scenario.id === 'phishing-1' ? 'Phishing Detective' : 
                    scenario.id === 'finance-1' ? 'Budget Master' : null;
      
      fetch('/api/user/complete-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpToAdd: score, badgeAwarded: badge }),
      }).catch(err => console.error("Failed to save progress:", err));
    }
  }, [isComplete, currentStep.failed, score, scenario.id]);

  return (
    <div className="flex-center" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(5, 7, 10, 0.98)',
      zIndex: 1000,
      padding: '0.5rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '95vh',
          borderRadius: 'var(--radius-xl)',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scenario.domain} Simulation</h4>
            <h3 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scenario.title}</h3>
          </div>
          <button onClick={onExit} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.text}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{ fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '2rem', color: 'var(--text-primary)' }}>
                {currentStep.text}
              </p>

              {!isComplete ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentStep.options.map((option, idx) => (
                    <button
                      key={idx}
                      className="btn-secondary"
                      style={{
                        textAlign: 'left',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: '1px',
                        width: '100%'
                      }}
                      onClick={() => makeDecision(option)}
                    >
                      <span style={{ fontSize: '0.9rem', paddingRight: '0.5rem' }}>{option.text}</span>
                      <ChevronRight size={16} style={{ opacity: 0.5, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: currentStep.failed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${currentStep.failed ? 'var(--accent-danger)' : 'var(--accent-success)'}`,
                  textAlign: 'center'
                }}>
                  {currentStep.failed ? (
                    <AlertTriangle size={40} color="var(--accent-danger)" style={{ marginBottom: '1rem' }} />
                  ) : (
                    <CheckCircle2 size={40} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
                  )}
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                    {currentStep.failed ? 'Failed' : 'Success!'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{currentStep.text}</p>
                  
                  <div className="flex-mobile-column" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <RotateCcw size={16} /> Try Again
                    </button>
                    <button className="btn-primary" onClick={onExit} style={{ fontSize: '0.9rem' }}>
                      Complete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {lastFeedback && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'absolute',
                bottom: '4.5rem',
                left: '1rem',
                right: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(139, 92, 246, 0.95)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 10
              }}
            >
              <AlertTriangle size={18} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 500 }}>{lastFeedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <span className="hide-mobile" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>PROGRESS</span>
            <div style={{ width: '100%', maxWidth: '150px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ width: isComplete ? '100%' : '40%' }}
                style={{ height: '100%', background: 'var(--accent-primary)' }} 
              />
            </div>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '0.9rem', marginLeft: '1rem' }}>
            +{score} XP
          </div>
        </div>
      </motion.div>
    </div>
  );
}
