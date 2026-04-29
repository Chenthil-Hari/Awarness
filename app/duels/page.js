'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Swords, Timer, Zap, Trophy, XCircle, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { survivalScenarios } from '../data/survivalScenarios';

function DuelContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const opponentId = searchParams.get('opponentId');
  const opponentName = searchParams.get('opponentName') || 'Opponent';
  const urlRoom = searchParams.get('room');
  
  const myId = session?.user?.id;
  
  // 1. Stable Room Derivation
  const [roomCode, setRoomCode] = useState(urlRoom || '');
  useEffect(() => {
    if (!urlRoom && myId && opponentId) {
      const code = [myId, opponentId].sort().join('-').substring(0, 10).toUpperCase();
      setRoomCode(code);
    }
  }, [myId, opponentId, urlRoom]);

  // 2. Multiplayer Connection
  const { members, broadcast, on, isConnected } = useMultiplayer(roomCode, !!myId);

  // 3. Game State
  const [gameState, setGameState] = useState('waiting'); // waiting, countdown, playing, result
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [result, setResult] = useState(null);

  const duelQuestions = survivalScenarios.slice(0, 3);

  // 4. Invitation (Challenger only)
  useEffect(() => {
    if (opponentId && roomCode && myId && !urlRoom) {
      console.log("Duel: Sending invite to", opponentId);
      fetch('/api/duels/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponentId, roomCode })
      }).catch(e => console.error("Invite fail:", e));
    }
  }, [opponentId, roomCode, myId, urlRoom]);

  // 5. Handshake & Events
  useEffect(() => {
    if (!isConnected || !opponentId) return;

    console.log("Duel: Arena Active. Waiting for signals...");

    const offReady = on('player-ready', (data) => {
      console.log("Duel: Opponent Ready Signal Received", data.senderId);
      if (data.senderId === opponentId) {
        setOpponentReady(true);
        // Response handshake: If I'm already ready, tell them again to be sure
        if (isReady) broadcast('player-ready', { status: 'ready' });
      }
    });

    const offProgress = on('duel-progress', (data) => {
      if (data.senderId === opponentId) setOpponentProgress(data.progress);
    });

    const offFinished = on('duel-finished', (data) => {
      if (data.senderId === opponentId && gameState === 'playing') finishDuel('loss');
    });

    const offSync = on('request-sync', () => {
      console.log("Duel: Sync Requested");
      if (isReady) broadcast('player-ready', { status: 'ready' });
    });

    // Auto-ping on connect
    broadcast('request-sync', {});

    return () => {
      offReady();
      offProgress();
      offFinished();
      offSync();
    };
  }, [isConnected, opponentId, isReady, gameState, myId]);

  // 6. Game Start Logic
  useEffect(() => {
    if (isReady && opponentReady && gameState === 'waiting') {
      console.log("Duel: Both players locked. Starting...");
      setGameState('countdown');
      setTimeout(() => setGameState('playing'), 3000);
    }
  }, [isReady, opponentReady, gameState]);

  // 7. Combat Mechanics
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      finishDuel('loss');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleReady = () => {
    console.log("Duel: User clicked READY");
    setIsReady(true);
    broadcast('player-ready', { status: 'ready' });
  };

  const handleAnswer = (option) => {
    if (option.correct) {
      const newProgress = ((currentQuestion + 1) / duelQuestions.length) * 100;
      setMyProgress(newProgress);
      broadcast('duel-progress', { progress: newProgress });

      if (currentQuestion < duelQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        finishDuel('win');
      }
    } else {
      setTimeLeft(prev => Math.max(0, prev - 5));
    }
  };

  const finishDuel = async (finalResult) => {
    if (gameState !== 'playing') return;
    setGameState('result');
    setResult(finalResult);
    broadcast('duel-finished', {});

    if (finalResult === 'win') {
      try {
        await fetch('/api/user/complete-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            xpToAdd: 500, 
            badgeAwarded: 'duel-victor',
            scenarioId: `duel-win-${roomCode}`,
            category: 'Tactical',
            isSuccess: true
          })
        });
        update();
      } catch (e) {
        console.error("Victory save fail:", e);
      }
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar />

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Swords size={32} className="gradient-text" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>SPEED-BREACH <span className="gradient-text">DUEL</span></h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: '600px', margin: '4rem auto' }}>
            <BorderGlow animated={true} glowColor="220 80 50" borderRadius={24}>
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white', fontWeight: 900 }}>Challenging {opponentName}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: isReady ? 'var(--accent-success)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--glass-border)' }}>
                      <Shield size={24} color={isReady ? 'white' : 'var(--text-muted)'} />
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'white', fontWeight: 700 }}>YOU</p>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, alignSelf: 'center', color: 'white' }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: opponentReady ? 'var(--accent-success)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--glass-border)' }}>
                      <Zap size={24} color={opponentReady ? 'white' : 'var(--text-muted)'} />
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'white', fontWeight: 700 }}>{opponentName}</p>
                  </div>
                </div>
                {!isReady ? (
                  <button onClick={handleReady} className="btn-primary" style={{ width: '100%', background: 'var(--accent-danger)' }}>READY TO BREACH</button>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontStyle: 'italic' }}>Waiting for opponent...</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ width: '20px', height: '20px', border: '2px solid var(--accent-danger)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    </div>
                  </div>
                )}
              </div>
            </BorderGlow>
          </motion.div>
        )}

        {gameState === 'countdown' && (
          <motion.div key="countdown" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', paddingTop: '10rem' }}>
            <motion.h2 
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: 3, duration: 1 }}
              style={{ fontSize: '8rem', fontWeight: 900, color: 'var(--accent-danger)' }}
            >
              BREACH!
            </motion.h2>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1000px', margin: '2rem auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
                  <span>YOU</span>
                  <span>{Math.floor(myProgress)}%</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${myProgress}%` }} style={{ height: '100%', background: 'var(--accent-primary)' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: timeLeft < 10 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>{timeLeft}s</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
                  <span>{Math.floor(opponentProgress)}%</span>
                  <span>{opponentName}</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${opponentProgress}%` }} style={{ height: '100%', background: 'var(--accent-danger)' }} />
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{duelQuestions[currentQuestion].title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>{duelQuestions[currentQuestion].description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {duelQuestions[currentQuestion].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt)} className="btn-secondary" style={{ padding: '1.5rem', textAlign: 'left', background: 'var(--bg-tertiary)' }}>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
            <BorderGlow animated={true} glowColor={result === 'win' ? "34, 197, 94" : "239, 68, 68"} borderRadius={32}>
              <div style={{ padding: '4rem' }}>
                {result === 'win' ? (
                  <>
                    <Trophy size={80} color="var(--accent-warning)" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>VICTORY</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>You breached the target faster than {opponentName}!</p>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '3rem' }}>+500 XP EARNED</div>
                  </>
                ) : (
                  <>
                    <XCircle size={80} color="var(--accent-danger)" style={{ marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>DEFEAT</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>{opponentName} bypassed your defenses first.</p>
                  </>
                )}
                <button onClick={() => router.push('/')} className="btn-primary" style={{ width: '100%' }}>RETURN TO DASHBOARD</button>
              </div>
            </BorderGlow>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function DuelPage() {
  return (
    <Suspense fallback={<div>Loading Arena...</div>}>
      <DuelContent />
    </Suspense>
  );
}
