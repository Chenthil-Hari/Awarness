'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Users, Skull, Trophy, Timer, AlertTriangle, ShieldCheck, ArrowRight, Zap, Heart, Loader2, Link as LinkIcon, UserPlus, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';
import { survivalScenarios } from '../data/survivalScenarios';

export default function SurvivalMode() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const isFriendMode = searchParams.get('mode') === 'friends';

  const [gameState, setGameState] = useState('lobby'); // lobby, playing, eliminating, won, eliminated
  const [roomCode, setRoomCode] = useState('');
  const [friends, setFriends] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState(100);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [eliminationText, setEliminationText] = useState('');
  const [isWinning, setIsWinning] = useState(false);

  // Initialize Room
  useEffect(() => {
    if (isFriendMode && !roomCode) {
      setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [isFriendMode, roomCode]);

  // Simulate Friends Joining
  useEffect(() => {
    if (isFriendMode && isJoined && friends.length < 3) {
      const timer = setTimeout(() => {
        const mockFriends = ['Alex_Cyber', 'Sarah_Dev', 'Matrix_99'];
        setFriends(prev => [...prev, mockFriends[prev.length]]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFriendMode, isJoined, friends]);

  const startGame = () => {
    setGameState('playing');
    setRound(0);
    setPlayers(100);
    setTimeLeft(15);
    setSelectedOption(null);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  // Sound effects simulation (visual)
  const [heartbeatActive, setHeartbeatActive] = useState(false);

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
      // Final round - eliminate everyone else
      eliminatedCount = players - 1;
    }

    let currentPlayers = players;
    const targetPlayers = players - eliminatedCount - (isCorrect ? 0 : 1);

    // Dramatic countdown of players
    const interval = setInterval(() => {
      setPlayers(prev => {
        if (prev <= targetPlayers) {
          clearInterval(interval);
          
          // After elimination animation, check if user survived
          setTimeout(() => {
            if (isCorrect) {
              if (round < survivalScenarios.length - 1) {
                setRound(prevRound => prevRound + 1);
                setGameState('playing');
                setTimeLeft(15);
                setSelectedOption(null);
              } else {
                setGameState('won');
                handleVictory();
              }
            } else {
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
    // Add logic to update user profile with Legendary Badge
    try {
      await fetch('/api/user/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId: 'survival-champion', xp: 5000 })
      });
      // Update session to show new badge
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
              <span>{players} Players {isFriendMode ? `(${friends.length + 1} Friends)` : ''} Remaining</span>
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
                            style={{ width: '100%', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }} 
                          />
                        </div>
                        <button onClick={() => setIsJoined(true)} className="btn-primary" style={{ padding: '1rem 2rem' }}>JOIN</button>
                      </div>
                      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                      </div>
                      <button onClick={() => setIsJoined(true)} className="btn-secondary" style={{ width: '100%', padding: '1rem' }}>CREATE PRIVATE ROOM</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{isFriendMode ? 'Room Ready' : 'Ready to risk it all?'}</h3>
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
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900 }}>YOU</div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>HOST</span>
                          </div>
                          {friends.map(f => (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={f} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                <Users size={20} />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f}</span>
                            </motion.div>
                          ))}
                          {Array.from({ length: 3 - friends.length }).map((_, i) => (
                            <div key={i} style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                              <UserPlus size={20} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Joining global lobby... (100/100 slots filled)</p>
                    )}
                    
                    <button 
                      disabled={isFriendMode && friends.length === 0}
                      onClick={startGame} 
                      className="btn-primary" 
                      style={{ background: 'var(--accent-danger)', padding: '1.5rem 3rem', fontSize: '1.2rem', opacity: (isFriendMode && friends.length === 0) ? 0.5 : 1 }}
                    >
                      {isFriendMode && friends.length === 0 ? 'WAITING FOR CREW...' : 'ENTER THE ARENA'}
                    </button>
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

                <button onClick={() => window.location.href='/dashboard'} className="btn-primary" style={{ width: '100%' }}>
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
