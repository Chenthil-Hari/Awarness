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
      background: 'rgba(5, 7, 10, 0.95)',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card" 
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{scenario.domain} Simulation</h4>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{scenario.title}</h3>
          </div>
          <button onClick={onExit} style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.text}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2.5rem', color: 'var(--text-primary)' }}>
                {currentStep.text}
              </p>

              {!isComplete ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentStep.options.map((option, idx) => (
                    <button
                      key={idx}
                      className="btn-secondary"
                      style={{
                        textAlign: 'left',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderWidth: '1px'
                      }}
                      onClick={() => makeDecision(option)}
                    >
                      <span style={{ fontSize: '1rem' }}>{option.text}</span>
                      <ChevronRight size={18} style={{ opacity: 0.5 }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  background: currentStep.failed ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${currentStep.failed ? 'var(--accent-danger)' : 'var(--accent-success)'}`,
                  textAlign: 'center'
                }}>
                  {currentStep.failed ? (
                    <AlertTriangle size={48} color="var(--accent-danger)" style={{ marginBottom: '1rem' }} />
                  ) : (
                    <CheckCircle2 size={48} color="var(--accent-success)" style={{ marginBottom: '1rem' }} />
                  )}
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                    {currentStep.failed ? 'Challenge Failed' : 'Challenge Success!'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{currentStep.text}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RotateCcw size={18} /> Try Again
                    </button>
                    <button className="btn-primary" onClick={onExit}>
                      Complete Scenario
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
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '2rem',
                right: '2rem',
                padding: '1rem 1.5rem',
                background: 'rgba(139, 92, 246, 0.9)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <AlertTriangle size={20} />
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{lastFeedback}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SIMULATION PROGRESS</span>
            <div style={{ width: '150px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ width: isComplete ? '100%' : '40%' }}
                style={{ height: '100%', background: 'var(--accent-primary)' }} 
              />
            </div>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
            +{score} XP
          </div>
        </div>
      </motion.div>
    </div>
  );
}
