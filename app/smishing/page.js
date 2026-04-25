'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import SmishingMessage from '../components/SmishingMessage';
import IncomingCall from '../components/IncomingCall';
import PhoneScore from '../components/PhoneScore';
import smishingScenarios from '../data/smishingScenarios';
import Lottie from 'lottie-react';
import onlineEuroAnimation from '../../images/online-euro.json';
import Image from 'next/image';

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function SmishingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'sim' | 'loading' | 'result'
  const [result, setResult] = useState(null);
  const [time, setTime] = useState(getTime());
  const [battery] = useState(Math.floor(Math.random() * 30) + 60); // 60-90%

  useEffect(() => {
    const t = setInterval(() => setTime(getTime()), 30000);
    return () => clearInterval(t);
  }, []);

  if (status === 'loading') {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const currentScenario = smishingScenarios[currentIndex];
  const progress = ((currentIndex) / smishingScenarios.length) * 100;

  const handleAction = (action) => {
    const newAnswers = [...answers, { scenarioId: currentScenario.id, action }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < smishingScenarios.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setPhase('loading');
    try {
      const res = await fetch('/api/smishing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('result');
    } catch (err) {
      console.error('Submit error:', err);
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
    setPhase('intro');
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Navbar />

      {/* Page Header */}
      <div className="container" style={{ padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0 3rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image src="/images/phone.svg" alt="Phone Drill" width={80} height={80} style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              <span className="gradient-text">Smishing Simulator</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              A realistic phone experience. Identify scam messages, calls, and notifications before they get you.
            </p>
          </motion.div>
        </div>

        {/* Main Layout: Phone + Info Panel */}
        <div style={{
          display: 'flex',
          gap: '3rem',
          justifyContent: 'center',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>

          {/* ===================== PHONE SHELL ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              width: '100%',
              maxWidth: '320px',
              height: '640px',
              borderRadius: '44px',
              background: 'linear-gradient(160deg, #1a1a2e 0%, #0d0d1a 100%)',
              boxShadow: `
                0 50px 100px rgba(0,0,0,0.6),
                0 0 0 1.5px rgba(255,255,255,0.12),
                inset 0 0 0 1px rgba(255,255,255,0.05),
                0 0 60px rgba(139,92,246,0.1)
              `,
              position: 'relative',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {/* Side buttons */}
            <div style={{ position: 'absolute', right: '-3px', top: '100px', width: '3px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '0 2px 2px 0' }} />
            <div style={{ position: 'absolute', left: '-3px', top: '90px', width: '3px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: '-3px', top: '130px', width: '3px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px 0 0 2px' }} />

            {/* Screen Bezel */}
            <div style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '36px',
              overflow: 'hidden',
              background: '#080c18',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Status Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px 6px',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#f8fafc',
                flexShrink: 0,
              }}>
                <span>{time}</span>
                {/* Notch */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '24px',
                  background: '#080c18',
                  borderRadius: '0 0 16px 16px',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a2e' }} />
                  <div style={{ width: '40px', height: '8px', borderRadius: '4px', background: '#1a1a2e' }} />
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span>📶</span>
                  <span>🛜</span>
                  <span>{battery}%</span>
                </div>
              </div>

              {/* Screen Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <AnimatePresence mode="wait">

                  {/* INTRO SCREEN */}
                  {phase === 'intro' && (
                    <motion.div
                      key="intro"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem 1rem',
                        textAlign: 'center',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ width: '90px', height: '90px', margin: '0 auto' }}>
                        <Lottie animationData={onlineEuroAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
                      </div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>Phone Drill</p>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5 }}>
                        You will receive {smishingScenarios.length} messages, calls, and notifications. Decide the right action for each.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPhase('sim')}
                        style={{
                          padding: '0.65rem 1.5rem',
                          borderRadius: '2rem',
                          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: '0.5rem',
                          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                        }}
                      >
                        Start Drill →
                      </motion.button>
                    </motion.div>
                  )}

                  {/* SIMULATION SCREEN */}
                  {phase === 'sim' && currentScenario && (
                    <motion.div
                      key={`sim-${currentIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                      {/* Progress Bar */}
                      <div style={{ padding: '0.5rem 0.75rem 0', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>
                            {currentIndex + 1} / {smishingScenarios.length}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: '#8b5cf6', fontWeight: 700 }}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                          <motion.div
                            style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', borderRadius: '2px' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      </div>

                      {/* Scenario Content */}
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentIndex}
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ width: '100%' }}
                          >
                            {currentScenario.type === 'call' ? (
                              <IncomingCall scenario={currentScenario} onAction={handleAction} />
                            ) : (
                              <SmishingMessage scenario={currentScenario} onAction={handleAction} />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* LOADING SCREEN */}
                  {phase === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ fontSize: '2rem' }}
                      >
                        🔍
                      </motion.div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Analyzing results...</p>
                    </motion.div>
                  )}

                  {/* RESULT SCREEN */}
                  {phase === 'result' && result && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ flex: 1, overflowY: 'auto' }}
                    >
                      <PhoneScore result={result} onRetry={handleRetry} />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Home Bar */}
              <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
              </div>
            </div>
          </motion.div>

          {/* ===================== INFO PANEL ===================== */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ maxWidth: '380px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>🎯 How to Play</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { emoji: '💬', text: 'Receive realistic SMS messages, app notifications, and phone calls' },
                  { emoji: '🤔', text: 'Decide whether each one is safe or a scam' },
                  { emoji: '🚫', text: 'Block or Ignore suspicious ones. Accept or Reply to legitimate ones' },
                  { emoji: '🏆', text: 'Your Digital Hygiene Score reveals at the end with XP rewards' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.emoji}</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>🏅 Score Tiers</h3>
              {[
                { label: 'Unhackable', range: '91–100', color: '#10b981', xp: '500 XP + Badge', emoji: '🛡️' },
                { label: 'Secure', range: '71–90', color: '#06b6d4', xp: '300 XP', emoji: '🔐' },
                { label: 'Cautious', range: '41–70', color: '#f59e0b', xp: '150 XP', emoji: '⚠️' },
                { label: 'Vulnerable', range: '0–40', color: '#ef4444', xp: '50 XP', emoji: '🚨' },
              ].map((tier) => (
                <div key={tier.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{tier.emoji}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: tier.color }}>{tier.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{tier.range}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{tier.xp}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
