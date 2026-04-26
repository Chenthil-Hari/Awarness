'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Users, Skull, Trophy, Timer, AlertTriangle, ShieldCheck, ArrowRight, Zap, Heart, Loader2, Link as LinkIcon, UserPlus, Check, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { survivalScenarios } from '../data/survivalScenarios';
import { calculateLevel } from '@/lib/game';

function SurvivalContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const isFriendMode = searchParams.get('mode') === 'friends';

  const [gameState, setGameState] = useState('lobby'); // lobby, playing, eliminating, won, eliminated
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  
  const { members, broadcast, on } = useMultiplayer(roomCode, isFriendMode && isJoined);

  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState(100);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [baseTime, setBaseTime] = useState(15);
  const [eliminationText, setEliminationText] = useState('');
  const [isWinning, setIsWinning] = useState(false);
  const [friendEliminations, setFriendEliminations] = useState([]);

  // Sound effects simulation (visual)
  const [heartbeatActive, setHeartbeatActive] = useState(false);

  // Multiplayer Event Listeners
  on('game-start', (data) => {
    startGame(data.timer || 15);
  });

  on('player-eliminated', (data) => {
    setFriendEliminations(prev => [...prev, data.sender]);
  });

  on('settings-updated', (data) => {
    setBaseTime(data.timer);
  });

  // Initialize Room
  useEffect(() => {
    if (isFriendMode && !roomCode && !isJoined) {
      setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [isFriendMode, roomCode, isJoined]);

  const handleJoin = () => {
    if (inputCode.trim()) {
      setRoomCode(inputCode.trim().toUpperCase());
      setIsJoined(true);
      setIsHost(false);
    } else {
      alert("Please enter a room code.");
    }
  };

  const handleCreate = () => {
    setIsJoined(true);
    setIsHost(true);
  };

  const handleKick = (userId) => {
    if (confirm("Are you sure you want to remove this player?")) {
      broadcast('kicked', { userId });
    }
  };

  const updateSettings = (newTimer) => {
    setBaseTime(newTimer);
    broadcast('settings-updated', { timer: newTimer });
  };

  const startGame = (timerOverride) => {
    const finalTimer = timerOverride || baseTime;
    if (isFriendMode && gameState === 'lobby' && isHost && !timerOverride) {
      broadcast('game-start', { startedAt: Date.now(), timer: finalTimer });
    }
    setGameState('playing');
    setRound(0);
    setPlayers(100);
    setTimeLeft(finalTimer);
    setSelectedOption(null);
    setFriendEliminations([]);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      if (timeLeft < 5) setHeartbeatActive(true);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleOptionSelect(null); // Auto-fail if time runs out
    }
  }, [gameState, timeLeft]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setGameState('eliminating');
    setHeartbeatActive(false);

    const scenario = survivalScenarios[round];
    const isCorrect = option?.correct || false;

    // Simulate elimination of other players
    let eliminatedCount = Math.floor(players * scenario.eliminationRate);
    if (round === survivalScenarios.length - 1 && isCorrect) {
      eliminatedCount = players - 1;
    }

    const targetPlayers = Math.max(1, players - eliminatedCount - (isCorrect ? 0 : 1));

    // Dramatic countdown of players
    const interval = setInterval(() => {
      setPlayers(prev => {
        if (prev <= targetPlayers) {
          clearInterval(interval);
          
          setTimeout(() => {
            if (isCorrect) {
              if (round < survivalScenarios.length - 1) {
                setRound(prevRound => prevRound + 1);
                setGameState('playing');
                setTimeLeft(baseTime);
                setSelectedOption(null);
              } else {
                setGameState('won');
                handleVictory();
              }
            } else {
              if (isFriendMode) {
                broadcast('player-eliminated', { round });
              }
              setEliminationText(option?.eliminationMessage || "Time ran out. You were disconnected. ELIMINATED.");
              setGameState('eliminated');
            }
          }, 1500);
          
          return targetPlayers;
        }
        return prev - 1;
      });
    }, 50);
  };

  const handleVictory = async () => {
    setIsWinning(true);
    try {
      // Correct XP saving
      await fetch('/api/user/complete-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xpToAdd: 5000, 
          badgeAwarded: 'survival-champion',
          scenarioId: 'gauntlet-victory',
          category: 'Survival',
          isSuccess: true
        })
      });
      update();
    } catch (e) {
      console.error("Failed to save victory");
    } finally {
      setIsWinning(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            padding: '0.75rem', 
            background: 'var(--accent-danger)', 
            borderRadius: '12px', 
            color: 'white',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
          }}>
            <Skull size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>Survival Mode: <span style={{ color: 'var(--accent-danger)' }}>The Gauntlet</span></h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Users size={16} />
              <span>{players} Players {isFriendMode ? `(${members.length} Friends)` : ''} Remaining</span>
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <motion.div 
            animate={heartbeatActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: timeLeft < 5 ? 'var(--accent-danger)' : 'var(--bg-secondary)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              color: timeLeft < 5 ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <Timer size={18} />
            <span>{timeLeft}s</span>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}
          >
            <div style={{ height: '100px', marginBottom: '2rem' }}>
              <TextPressure text={isFriendMode ? "FRIEND LOBBY" : "SURVIVAL"} textColor="var(--accent-danger)" minFontSize={80} />
            </div>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
              {isFriendMode 
                ? "Compete against your crew. Only one of you can be the ultimate survivor." 
                : "100 enter. One mistake means instant elimination. Outlast the world."}
            </p>

            <BorderGlow
              glowColor="0 80 50"
              backgroundColor="var(--bg-secondary)"
              borderRadius={32}
              animated={true}
            >
              <div style={{ padding: '3rem' }}>
                {isFriendMode && !isJoined ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 800 }}>Create or Join Room</h3>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input 
                            type="text" 
                            placeholder="Enter Code" 
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
                          />
                        </div>
                        <button onClick={handleJoin} className="btn-primary" style={{ padding: '1rem 2rem' }}>JOIN</button>
                      </div>
                      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                      </div>
                      <button onClick={handleCreate} className="btn-secondary" style={{ width: '100%', padding: '1rem' }}>CREATE PRIVATE ROOM</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{isFriendMode ? 'Room Ready' : 'Ready to risk it all?'}</h3>
                    
                    {isFriendMode && isHost && (
                      <div style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--accent-danger)', textAlign: 'left' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--accent-danger)' }}>HOST SETTINGS</h4>
                        <div>
                          <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem', fontWeight: 800 }}>ROUND TIMER (SECONDS)</label>
                          <input 
                            type="number" 
                            value={baseTime} 
                            onChange={(e) => updateSettings(parseInt(e.target.value) || 15)}
                            style={{ width: '100px', padding: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }}
                          />
                        </div>
                      </div>
                    )}

                    {isFriendMode ? (
                      <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                          <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px dashed var(--accent-danger)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '4px' }}>
                            {roomCode}
                          </div>
                          <button onClick={copyRoomCode} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                            <LinkIcon size={20} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, position: 'relative' }}>
                              YOU
                              <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-tertiary)', border: '1px solid var(--accent-danger)', borderRadius: '50%', width: '24px', height: '24px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-danger)', fontWeight: 900 }}>
                                L{calculateLevel(session?.user?.xp || 0)}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>HOST</span>
                          </div>
                          {members.filter(m => m.user_id !== (session?.user?.email || session?.user?.id)).map(f => (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={f.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative' }}>
                                <Users size={20} />
                                <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '24px', height: '24px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 900 }}>
                                  L{calculateLevel(f.xp || 0)}
                                </div>
                                {isHost && (
                                  <button 
                                    onClick={() => handleKick(f.user_id)}
                                    style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--accent-danger)', borderRadius: '50%', width: '18px', height: '18px', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                  >
                                    <X size={10} />
                                  </button>
                                )}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.name}</span>
                            </motion.div>
                          ))}
                          {Array.from({ length: Math.max(0, 3 - (members.length - 1)) }).map((_, i) => (
                            <div key={i} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <UserPlus size={20} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Joining global lobby... (100/100 slots filled)</p>
                    )}
                    
                    {(!isFriendMode || isHost) ? (
                      <button 
                        disabled={isFriendMode && members.length === 1}
                        onClick={() => startGame()} 
                        className="btn-primary" 
                        style={{ background: 'var(--accent-danger)', padding: '1.5rem 3rem', fontSize: '1.2rem', opacity: (isFriendMode && members.length === 1) ? 0.5 : 1 }}
                      >
                        {isFriendMode && members.length === 1 ? 'WAITING FOR CREW...' : 'ENTER THE ARENA'}
                      </button>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                        Waiting for Host to start the gauntlet...
                      </div>
                    )}
                  </>
                )}
              </div>
            </BorderGlow>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ maxWidth: '900px', margin: '0 auto' }}
          >
            {/* Friends Elimination Feed */}
            {isFriendMode && friendEliminations.length > 0 && (
              <div style={{ position: 'fixed', right: '2rem', top: '6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100 }}>
                {friendEliminations.map((name, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    style={{ background: 'rgba(220, 38, 38, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-danger)', color: 'white', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    💀 {name} ELIMINATED
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <span style={{ 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                color: 'var(--accent-danger)', 
                background: 'rgba(220, 38, 38, 0.1)', 
                padding: '4px 12px', 
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase'
              }}>
                ROUND {round + 1} OF {survivalScenarios.length}
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginTop: '1rem' }}>{survivalScenarios[round].title}</h2>
            </div>

            <BorderGlow
              glowColor="0 0 50"
              backgroundColor="var(--bg-secondary)"
              borderRadius={24}
            >
              <div style={{ padding: '2.5rem' }}>
                <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '3rem', color: 'var(--text-primary)' }}>
                  {survivalScenarios[round].description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {survivalScenarios[round].options.map((option, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 10, background: 'rgba(255,255,255,0.05)' }}
                      onClick={() => handleOptionSelect(option)}
                      style={{ 
                        padding: '1.5rem', 
                        textAlign: 'left', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.1rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      {option.text}
                      <ArrowRight size={20} opacity={0.5} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </BorderGlow>
          </motion.div>
        )}

        {gameState === 'eliminating' && (
          <motion.div 
            key="eliminating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: '8rem' }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ 
                  position: 'absolute', 
                  inset: -20, 
                  background: 'rgba(220, 38, 38, 0.1)', 
                  borderRadius: '50%', 
                  filter: 'blur(20px)' 
                }} 
              />
              <Skull size={80} color="var(--accent-danger)" />
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '2rem' }}>ELIMINATING...</h2>
            <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
              Players Remaining: <span style={{ color: 'var(--accent-danger)', fontWeight: 900 }}>{players}</span>
            </p>
          </motion.div>
        )}

        {gameState === 'eliminated' && (
          <motion.div 
            key="eliminated"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', paddingTop: '6rem', maxWidth: '600px', margin: '0 auto' }}
          >
            <div style={{ height: '100px', marginBottom: '2rem' }}>
              <TextPressure text="ELIMINATED" textColor="var(--accent-danger)" minFontSize={80} />
            </div>
            <div className="glass-card" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--accent-danger)' }}>
              <AlertTriangle size={48} color="var(--accent-danger)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Game Over</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                {eliminationText}
              </p>
              <button onClick={() => setGameState('lobby')} className="btn-secondary" style={{ width: '100%' }}>
                Return to Lobby
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div 
            key="won"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: '4rem', maxWidth: '800px', margin: '0 auto' }}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy size={100} color="var(--accent-warning)" />
            </motion.div>
            <h2 style={{ fontSize: '4rem', fontWeight: 900, marginTop: '2rem' }}>VICTORY!</h2>
            <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
              You are the <span className="gradient-text">Sole Survivor</span> of 100 participants.
            </p>

            <BorderGlow
              glowColor="40 80 50"
              backgroundColor="var(--bg-secondary)"
              borderRadius={32}
              animated={true}
            >
              <div style={{ padding: '3rem' }}>
                <Zap size={48} color="var(--accent-warning)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Legendary Reward</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The high-council has recognized your awareness.</p>
                
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-warning)', margin: '0 auto 0.5rem' }}>
                      <Trophy size={32} color="var(--accent-warning)" />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>SURVIVOR BADGE</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-primary)', margin: '0 auto 0.5rem' }}>
                      <Zap size={32} color="var(--accent-primary)" />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>+5,000 XP</span>
                  </div>
                </div>

                <button onClick={() => window.location.href='/'} className="btn-primary" style={{ width: '100%' }}>
                  CLAIM REWARDS & EXIT
                </button>
              </div>
            </BorderGlow>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heartbeat Pulse Overlay for low time */}
      <AnimatePresence>
        {heartbeatActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'var(--accent-danger)', 
              pointerEvents: 'none', 
              zIndex: 999 
            }} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SurvivalMode() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent-danger)', fontWeight: 800 }}>JOINING LOBBY...</div>}>
      <SurvivalContent />
    </Suspense>
  );
}
