'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, Cpu, Binary, Map, Radio, AlertCircle, CheckCircle2, XCircle, ArrowRight, Timer, Terminal, Users, Play, Lock, Link as LinkIcon, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { heistScenarios } from '../data/heistScenarios';
import { calculateLevel } from '@/lib/game';

const RoleCard = ({ role, icon: Icon, description, selected, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    onClick={onClick}
    className={`glass-card ${selected ? 'border-accent-primary' : ''}`}
    style={{
      padding: '2rem',
      cursor: 'pointer',
      border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
      background: selected ? 'rgba(124, 58, 237, 0.1)' : 'var(--glass-bg)',
      flex: 1,
      minWidth: '280px',
      transition: 'all 0.3s ease'
    }}
  >
    <div style={{ 
      width: '60px', 
      height: '60px', 
      borderRadius: '16px', 
      background: selected ? 'var(--accent-primary)' : 'var(--bg-tertiary)', 
      color: selected ? 'white' : 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    }}>
      <Icon size={32} />
    </div>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>{role}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{description}</p>
  </motion.div>
);

function HeistContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isFriendMode = searchParams.get('mode') === 'friends';

  const [gameState, setGameState] = useState('briefing'); // briefing, lobby, role-select, playing, phase-complete, failed, victory
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const { members, broadcast, on } = useMultiplayer(roomCode, isFriendMode && isJoined);

  const [selectedRole, setSelectedRole] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [teamProgress, setTeamProgress] = useState({ role1: 0, role2: 0 });
  const [messages, setMessages] = useState([]);
  const [answerState, setAnswerState] = useState(null); // null, correct, wrong

  const chatRef = useRef(null);

  // Multiplayer Event Listeners
  on('game-start', () => {
    setGameState('playing');
    setTimeLeft(30);
    setTeamProgress({ role1: 0, role2: 0 });
    setMessages([{ sender: 'System', text: 'CONNECTION ESTABLISHED. MISSION START.', id: Date.now() }]);
  });

  on('progress-update', (data) => {
    if (data.senderId !== (searchParams.get('userId') || 'me')) {
      setTeamProgress(prev => ({
        ...prev,
        [data.role]: data.progress
      }));
    }
  });

  on('new-message', (data) => {
    addMessage(data.sender, data.text);
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
    } else {
      alert("Please enter a mission code.");
    }
  };

  const handleCreate = () => {
    setIsJoined(true);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Game Logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // In multiplayer, progress is real. Only simulate if solo.
        if (!isFriendMode) {
          setTeamProgress(prev => ({
            role1: Math.min(100, prev.role1 + Math.random() * 5),
            role2: Math.min(100, prev.role2 + Math.random() * 5)
          }));
        }
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('failed');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isFriendMode]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, id: Date.now() }]);
  };

  const startHeist = () => {
    if (isFriendMode) {
      broadcast('game-start', { chapter: 0 });
    }
    setGameState('playing');
    setTimeLeft(30);
    setTeamProgress({ role1: 0, role2: 0 });
    setMessages([{ sender: 'System', text: 'CONNECTION ESTABLISHED. MISSION START.', id: Date.now() }]);
  };

  const handleAnswer = (option) => {
    if (option.correct) {
      setAnswerState('correct');
      addMessage('System', 'TASK COMPLETE. SYNCHRONIZING WITH TEAM...');
      
      // Broadcast progress in multiplayer
      if (isFriendMode) {
        broadcast('progress-update', { role: selectedRole, progress: 100 });
      }

      // Wait for "Team" to finish
      setTimeout(() => {
        if (currentChapter < heistScenarios.length - 1) {
          setGameState('phase-complete');
        } else {
          setGameState('victory');
        }
      }, 2000);
    } else {
      setAnswerState('wrong');
      addMessage('System', 'CRITICAL FAILURE. SECURITY ALERT TRIGGERED.');
      setTimeout(() => setGameState('failed'), 1500);
    }
  };

  const nextPhase = () => {
    setCurrentChapter(prev => prev + 1);
    setGameState('playing');
    setTimeLeft(30);
    setTeamProgress({ role1: 0, role2: 0 });
    setAnswerState(null);
  };

  const scenario = heistScenarios[currentChapter];
  const otherRoles = selectedRole ? Object.keys(scenario.roles).filter(r => r !== selectedRole) : [];

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar />

      <div style={{ marginTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--accent-primary)', borderRadius: '8px', color: 'white' }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>OPERATION: <span className="gradient-text">THE HEIST</span></h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>A Cooperative Security Breach Simulation</p>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'briefing' && (
          <motion.div 
            key="briefing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <div className="glass-card" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--accent-primary)' }}>
                <Terminal size={32} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>CLASSIFIED BRIEFING</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
                Welcome, operative. We are targeting the central data vault of the "Void" syndicate. 
                This is a multi-stage operation that requires perfect coordination between three specialists: 
                The **Hacker**, the **Analyst**, and the **Decoy**. 
                <br /><br />
                Success depends on everyone. If one role fails, the security team will descend on us instantly.
              </p>
              <button 
                onClick={() => setGameState(isFriendMode ? 'lobby' : 'role-select')} 
                className="btn-primary" 
                style={{ width: '100%', padding: '1.5rem' }}
              >
                {isFriendMode ? 'INITIALIZE SECURE LOBBY' : 'INITIALIZE ROLE SELECTION'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'lobby' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}
          >
            <div style={{ height: '100px', marginBottom: '2rem' }}>
              <TextPressure text="CREW LOBBY" textColor="var(--accent-secondary)" minFontSize={80} />
            </div>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
              Assemble your team. Every specialist must be synchronized for the heist to succeed.
            </p>

            <BorderGlow
              glowColor="190 80 50"
              backgroundColor="var(--bg-secondary)"
              borderRadius={32}
              animated={true}
            >
              <div style={{ padding: '3rem' }}>
                {!isJoined ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 800 }}>Secure Mission Code</h3>
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
                        <button onClick={handleJoin} className="btn-primary" style={{ padding: '1rem 2rem', background: 'var(--accent-secondary)' }}>JOIN</button>
                      </div>
                      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                      </div>
                      <button onClick={handleCreate} className="btn-secondary" style={{ width: '100%', padding: '1rem', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>GENERATE MISSION LINK</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Crew Synchronization</h3>
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px dashed var(--accent-secondary)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '4px', color: 'var(--accent-secondary)' }}>
                          {roomCode}
                        </div>
                        <button onClick={copyRoomCode} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                          <LinkIcon size={20} />
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent-secondary)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, position: 'relative' }}>
                            HOST
                            <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-tertiary)', border: '1px solid var(--accent-secondary)', borderRadius: '50%', width: '24px', height: '24px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-secondary)', fontWeight: 900 }}>
                              L{calculateLevel(session?.user?.xp || 0)}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>YOU</span>
                        </div>
                        {members.filter(m => m.name !== (session?.user?.name || 'HOST')).map(member => (
                          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={member.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative' }}>
                              <Users size={24} />
                              <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '24px', height: '24px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 900 }}>
                                L{calculateLevel(member.xp || 0)}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.name}</span>
                          </motion.div>
                        ))}
                        {Array.from({ length: Math.max(0, 2 - (members.length - 1)) }).map((_, i) => (
                          <div key={i} style={{ width: '60px', height: '60px', borderRadius: '16px', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <UserPlus size={24} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      disabled={members.length < 2}
                      onClick={() => setGameState('role-select')} 
                      className="btn-primary" 
                      style={{ background: 'var(--accent-secondary)', padding: '1.5rem 3rem', fontSize: '1.2rem', opacity: (members.length < 2) ? 0.5 : 1 }}
                    >
                      {members.length < 2 ? 'WAITING FOR SPECIALISTS...' : 'ASSIGN ROLES'}
                    </button>
                  </>
                )}
              </div>
            </BorderGlow>
          </motion.div>
        )}

        {gameState === 'role-select' && (
          <motion.div 
            key="role-select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem', fontWeight: 800 }}>Choose Your Role</h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <RoleCard 
                role="Hacker" 
                icon={Cpu} 
                description="Digital infiltration specialist. Bypasses firewalls and biometric locks."
                selected={selectedRole === 'Hacker'}
                onClick={() => setSelectedRole('Hacker')}
              />
              <RoleCard 
                role="Analyst" 
                icon={Binary} 
                description="Pattern recognition expert. Identifies guard rotations and decrypts codes."
                selected={selectedRole === 'Analyst'}
                onClick={() => setSelectedRole('Analyst')}
              />
              <RoleCard 
                role="Decoy" 
                icon={Radio} 
                description="Social engineering and chaos specialist. Creates distractions and jams comms."
                selected={selectedRole === 'Decoy'}
                onClick={() => setSelectedRole('Decoy')}
              />
            </div>
            {selectedRole && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button onClick={startHeist} className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
                  BEGIN OPERATION: PHASE 1
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}
          >
            {/* Main Action Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {scenario.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 10 ? 'var(--accent-danger)' : 'var(--text-primary)', fontWeight: 800 }}>
                    <Timer size={18} />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{selectedRole} Task: {scenario.roles[selectedRole].task}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                  {scenario.roles[selectedRole].questions[0].text}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {scenario.roles[selectedRole].questions[0].options.map((option, i) => (
                    <button
                      key={i}
                      disabled={answerState !== null}
                      onClick={() => handleAnswer(option)}
                      style={{
                        padding: '1.25rem',
                        textAlign: 'left',
                        background: answerState === 'correct' && option.correct ? 'rgba(16, 185, 129, 0.1)' : (answerState === 'wrong' && !option.correct ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-tertiary)'),
                        border: '1px solid var(--glass-border)',
                        borderColor: answerState === 'correct' && option.correct ? 'var(--accent-success)' : (answerState === 'wrong' && !option.correct ? 'var(--accent-danger)' : 'var(--glass-border)'),
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {option.text}
                      {answerState === 'correct' && option.correct && <CheckCircle2 size={20} color="var(--accent-success)" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Progress */}
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} /> TEAM STATUS
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {otherRoles.map((role, idx) => (
                    <div key={role}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        <span>{isFriendMode ? (members[idx + 1]?.name || role) : role}</span>
                        <span>{Math.floor(idx === 0 ? teamProgress.role1 : teamProgress.role2)}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${idx === 0 ? teamProgress.role1 : teamProgress.role2}%` }}
                          style={{ height: '100%', background: 'var(--accent-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Comms */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', height: '600px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--accent-primary)', letterSpacing: '1px' }}>SECURE COMMS</h4>
              <div 
                ref={chatRef}
                style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}
              >
                {messages.map(msg => (
                  <div key={msg.id} style={{ fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 800, color: msg.sender === 'System' ? 'var(--accent-warning)' : 'var(--accent-primary)', marginRight: '0.5rem' }}>
                      [{msg.sender}]
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{msg.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                ENCRYPTED CONNECTION : ACTIVE
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'phase-complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', paddingTop: '6rem' }}
          >
            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-success)', margin: '0 auto 2rem' }}>
              <CheckCircle2 size={40} color="var(--accent-success)" />
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>PHASE {currentChapter + 1} CLEAR</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>The team has successfully synchronized. Moving to next objective...</p>
            <button onClick={nextPhase} className="btn-primary" style={{ padding: '1.2rem 3.5rem', fontSize: '1.1rem' }}>
              PROCEED TO PHASE {currentChapter + 2} <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {gameState === 'failed' && (
          <motion.div 
            key="failed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', paddingTop: '6rem', maxWidth: '600px', margin: '0 auto' }}
          >
            <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-danger)', margin: '0 auto 2rem' }}>
              <XCircle size={40} color="var(--accent-danger)" />
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>HEIST FAILED</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
              Security teams have swarmed the building. The connection has been severed.
            </p>
            <button onClick={() => window.location.reload()} className="btn-secondary" style={{ width: '100%', padding: '1.2rem' }}>
              RETRY MISSION
            </button>
          </motion.div>
        )}

        {gameState === 'victory' && (
          <motion.div 
            key="victory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: '4rem', maxWidth: '800px', margin: '0 auto' }}
          >
            <div style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-success)', margin: '0 auto 2rem' }}>
              <Lock size={50} color="var(--accent-success)" />
            </div>
            <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1rem' }}>VAULT BREACHED</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', marginBottom: '4rem' }}>
              Mission Accomplished. You and your team have vanished without a trace.
            </p>
            
            <BorderGlow animated={true} glowColor="140 80 50">
              <div style={{ padding: '3rem' }}>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Mission Rewards</h3>
                <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginBottom: '3rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>+2,500</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>EXPERIENCE</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-success)' }}>$0</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>CASUALTIES</div>
                  </div>
                </div>
                <button onClick={() => window.location.href='/dashboard'} className="btn-primary" style={{ width: '100%' }}>
                  RETURN TO SAFEhouse
                </button>
              </div>
            </BorderGlow>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function HeistPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--accent-primary)', fontWeight: 800 }}>INITIALIZING MISSION...</div>}>
      <HeistContent />
    </Suspense>
  );
}
