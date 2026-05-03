'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, Cpu, Binary, Radio, AlertCircle, CheckCircle2, XCircle, ArrowRight, Timer, Terminal, Users, Play, Lock, Link as LinkIcon, UserPlus, X, Zap } from 'lucide-react';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { heistScenarios } from '../data/heistScenarios';
import { calculateLevel } from '@/lib/game';

const RoleCard = ({ role, icon: Icon, description, selected, disabled, onClick }) => (
  <motion.div
    whileHover={!disabled ? { scale: 1.02, y: -5 } : {}}
    onClick={!disabled ? onClick : null}
    className={`glass-card ${selected ? 'border-accent-primary' : ''}`}
    style={{
      padding: '2rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled && !selected ? 0.5 : 1,
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
    {disabled && !selected && <p style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', fontWeight: 800, marginTop: '1rem' }}>UNAVAILABLE</p>}
  </motion.div>
);

function HeistContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFriendMode = searchParams.get('mode') === 'friends';

  const [gameState, setGameState] = useState('briefing'); // briefing, lobby, role-select, playing, phase-complete, failed, victory
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  
  const myId = session?.user?.id;
  const { members, broadcast, on, isConnected } = useMultiplayer(roomCode, isFriendMode && isJoined);

  const [selectedRole, setSelectedRole] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [baseTime, setBaseTime] = useState(45);
  const [missionDifficulty, setMissionDifficulty] = useState('standard');
  const [selectedMissionId, setSelectedMissionId] = useState('default');
  const [customMissions, setCustomMissions] = useState([]);
  
  const [teamProgress, setTeamProgress] = useState({});
  const [messages, setMessages] = useState([]);
  const [answerState, setAnswerState] = useState(null);

  const chatRef = useRef(null);

  // 1. Stable Listeners
  useEffect(() => {
    if (!isConnected || !isFriendMode || !isJoined) return;

    const offStart = on('game-start', (data) => {
      setGameState('playing');
      setTimeLeft(data.timer || 45);
      setBaseTime(data.timer || 45);
      setTeamProgress({});
      setCurrentChapter(data.chapter || 0);
      setMessages([{ sender: 'System', text: 'CONNECTION ESTABLISHED. MISSION START.', id: Date.now() }]);
    });

    const offProgress = on('progress-update', (data) => {
      if (data.senderId !== myId) {
        setTeamProgress(prev => ({ ...prev, [data.role]: data.progress }));
      }
    });

    const offRole = on('role-selected', (data) => {
      if (data.senderId !== myId) {
        addMessage('System', `${data.senderName} has assumed the role of ${data.role}.`);
      }
    });

    const offShuffled = on('roles-shuffled', (data) => {
      const hostIndex = members.findIndex(m => m.user_id === data.hostId);
      const myIndex = members.findIndex(m => m.user_id === myId);
      if (myIndex !== -1 && hostIndex !== -1) {
        const roleIndex = (myIndex - hostIndex + 3) % 3;
        const assignedRole = data.assignments[roleIndex];
        setSelectedRole(assignedRole);
        addMessage('System', `Host has assigned you the role of ${assignedRole}.`);
      }
    });

    const offNext = on('next-phase', (data) => {
      setCurrentChapter(data.chapter);
      setGameState('playing');
      setTimeLeft(baseTime);
      setTeamProgress({});
      setAnswerState(null);
    });

    const offMessage = on('new-message', (data) => {
      if (data.senderId !== myId) addMessage(data.sender, data.text);
    });

    return () => {
      offStart();
      offProgress();
      offRole();
      offShuffled();
      offNext();
      offMessage();
    };
  }, [isConnected, isFriendMode, isJoined, myId, members.length]);

  // 2. Room Initialization
  useEffect(() => {
    if (isFriendMode && !roomCode && !isJoined) {
      setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [isFriendMode, roomCode, isJoined]);

  // 3. Community Missions
  useEffect(() => {
    if (isJoined) {
      fetch('/api/architect/missions')
        .then(res => res.json())
        .then(data => setCustomMissions(data.missions || []))
        .catch(err => console.error("Mission fetch fail"));
    }
  }, [isJoined]);

  const handleJoin = () => {
    if (inputCode.trim()) {
      setRoomCode(inputCode.trim().toUpperCase());
      setIsJoined(true);
      setIsHost(false);
    }
  };

  const handleCreate = () => {
    setIsJoined(true);
    setIsHost(true);
  };

  const handleKick = (userId) => {
    if (confirm("Are you sure you want to remove this operative?")) {
      broadcast('kicked', { userId });
    }
  };

  const randomizeRoles = () => {
    const roles = ['Hacker', 'Analyst', 'Decoy'];
    const shuffled = [...roles].sort(() => Math.random() - 0.5);
    setSelectedRole(shuffled[0]);
    broadcast('role-selected', { role: shuffled[0], senderName: session?.user?.name });
    broadcast('roles-shuffled', { assignments: shuffled, hostId: myId });
  };

  const startHeist = () => {
    if (isFriendMode) {
      const signal = { chapter: 0, timer: baseTime, missionId: selectedMissionId, timestamp: Date.now() };
      broadcast('game-start', signal);
      setTimeout(() => broadcast('game-start', signal), 500);
      setTimeout(() => broadcast('game-start', signal), 1000);
    }
    setGameState('playing');
    setTimeLeft(baseTime);
    setTeamProgress({});
    setMessages([{ sender: 'System', text: 'CONNECTION ESTABLISHED. MISSION START.', id: Date.now() }]);
  };

  const getScenario = () => {
    try {
      if (selectedMissionId === 'default') {
        return heistScenarios[currentChapter] || heistScenarios[0];
      }
      const custom = customMissions.find(m => m._id === selectedMissionId);
      return custom?.phases?.[currentChapter] || heistScenarios[0];
    } catch (e) {
      console.error("Scenario lookup error:", e);
      return heistScenarios[0];
    }
  };

  const scenario = getScenario();
  const currentRole = selectedRole || 'Hacker'; // Safety fallback
  const otherRoles = Object.keys(scenario?.roles || {}).filter(r => r !== currentRole);

  // 4. Combat Logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (!isFriendMode) {
          setTeamProgress(prev => {
            const newState = { ...prev };
            otherRoles.forEach(role => {
              newState[role] = Math.min(100, (prev[role] || 0) + Math.random() * 8);
            });
            return newState;
          });
        }
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('failed');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isFriendMode, otherRoles]);

  const handleAnswer = (option) => {
    if (option.correct) {
      setAnswerState('correct');
      addMessage('System', 'TASK COMPLETE. SYNCHRONIZING WITH TEAM...');
      if (isFriendMode) broadcast('progress-update', { role: selectedRole, progress: 100 });

      const totalPhases = selectedMissionId === 'default' ? heistScenarios.length : (customMissions.find(m => m._id === selectedMissionId)?.phases?.length || 1);
      
      setTimeout(() => {
        if (currentChapter < totalPhases - 1) setGameState('phase-complete');
        else {
          setGameState('victory');
          handleVictory();
        }
      }, 2000);
    } else {
      setAnswerState('wrong');
      addMessage('System', 'CRITICAL FAILURE. SECURITY ALERT TRIGGERED.');
      setTimeout(() => setGameState('failed'), 1500);
    }
  };

  const handleVictory = async () => {
    try {
      await fetch('/api/user/complete-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xpToAdd: selectedMissionId === 'default' ? 2500 : 3500, 
          badgeAwarded: selectedMissionId === 'default' ? 'heist-specialist' : 'community-conqueror',
          scenarioId: selectedMissionId === 'default' ? 'heist-operation-success' : `custom-${selectedMissionId}`,
          category: 'Security',
          isSuccess: true
        })
      });
      update();
    } catch (e) {}
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, id: Date.now() }]);
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    addMessage('YOU', text);
    broadcast('new-message', { sender: session?.user?.name || 'Operative', text });
  };

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
            <div style={{ marginTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--accent-primary)', borderRadius: '8px', color: 'white' }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>OPERATION: <span className="gradient-text">THE HEIST</span></h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'briefing' && (
          <motion.div key="briefing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--accent-primary)' }}>
                <Terminal size={32} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>CLASSIFIED BRIEFING</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
                Welcome, operative. We are targeting the central data vault of the "Void" syndicate. 
                Success depends on everyone. If one role fails, the security team will descend on us instantly.
              </p>
              <button onClick={() => setGameState(isFriendMode ? 'lobby' : 'role-select')} className="btn-primary" style={{ width: '100%', padding: '1.5rem' }}>
                INITIALIZE MISSION
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ height: '100px', marginBottom: '2rem' }}>
              <TextPressure text="CREW LOBBY" textColor="var(--accent-secondary)" minFontSize={60} />
            </div>
            
            <BorderGlow glowColor="190 80 50" borderRadius={32} animated={true}>
              <div style={{ padding: '3rem' }}>
                {!isJoined ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <input type="text" placeholder="ENTER MISSION CODE" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ width: '100%', padding: '1.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', textAlign: 'center', fontWeight: 900, marginBottom: '1rem' }} />
                      <button onClick={handleJoin} className="btn-primary" style={{ width: '100%', background: 'var(--accent-secondary)' }}>JOIN CREW</button>
                      <div style={{ margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>— OR —</div>
                      <button onClick={handleCreate} className="btn-secondary" style={{ width: '100%', color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}>CREATE NEW OPERATION</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--accent-secondary)', fontSize: '2rem', fontWeight: 900, letterSpacing: '8px', color: 'var(--accent-secondary)', flex: 1 }}>
                        {roomCode}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(roomCode); alert("Code Copied!"); }} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                        <LinkIcon size={24} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                      {members.map(m => (
                        <div key={m.user_id} style={{ textAlign: 'center', position: 'relative' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-tertiary)', border: `2px solid ${m.user_id === myId ? 'var(--accent-secondary)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={32} color={m.user_id === myId ? 'var(--accent-secondary)' : 'white'} />
                          </div>
                          <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', fontWeight: 800 }}>{m.name.split(' ')[0].toUpperCase()}</p>
                          {isHost && m.user_id !== myId && (
                            <button onClick={() => handleKick(m.user_id)} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--accent-danger)', borderRadius: '50%', width: '20px', height: '20px', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 3 - members.length) }).map((_, i) => (
                        <div key={i} style={{ width: '64px', height: '64px', borderRadius: '16px', border: '2px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                          <UserPlus size={32} />
                        </div>
                      ))}
                    </div>

                    {isHost ? (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={randomizeRoles} className="btn-secondary" style={{ flex: 1, padding: '1rem', borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>RANDOMIZE ROLES</button>
                        <button disabled={members.length < 2} onClick={() => setGameState('role-select')} className="btn-primary" style={{ flex: 2, background: 'var(--accent-secondary)', padding: '1rem', fontSize: '1.1rem', opacity: (members.length < 2) ? 0.5 : 1 }}>
                          {members.length < 2 ? 'WAITING FOR CREW...' : 'ASSIGN ROLES'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                        Waiting for host to begin mission...
                      </div>
                    )}
                  </>
                )}
              </div>
            </BorderGlow>
          </motion.div>
        )}

        {gameState === 'role-select' && (
          <motion.div key="role-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', fontWeight: 900 }}>CHOOSE YOUR SPECIALIZATION</h2>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <RoleCard role="Hacker" icon={Cpu} description="Digital infiltration. Bypasses firewalls and security nodes." selected={selectedRole === 'Hacker'} onClick={() => { setSelectedRole('Hacker'); if (isFriendMode) broadcast('role-selected', { role: 'Hacker', senderName: session?.user?.name }); }} />
              <RoleCard role="Analyst" icon={Binary} description="Pattern recognition. Decrypts security codes and rotation patterns." selected={selectedRole === 'Analyst'} onClick={() => { setSelectedRole('Analyst'); if (isFriendMode) broadcast('role-selected', { role: 'Analyst', senderName: session?.user?.name }); }} />
              <RoleCard role="Decoy" icon={Radio} description="Social engineering. Creates diversions and jams enemy comms." selected={selectedRole === 'Decoy'} onClick={() => { setSelectedRole('Decoy'); if (isFriendMode) broadcast('role-selected', { role: 'Decoy', senderName: session?.user?.name }); }} />
            </div>
            {selectedRole && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '4rem', textAlign: 'center' }}>
                <button onClick={startHeist} className="btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.3rem' }}>COMMENCE OPERATION</button>
              </motion.div>
            )}
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span style={{ fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '2px' }}>{scenario?.title?.toUpperCase() || 'MISSION ACTIVE'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 10 ? 'var(--accent-danger)' : 'white', fontWeight: 900 }}>
                    <Timer size={20} /> {timeLeft}s
                  </div>
                </div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{currentRole}: {scenario?.roles?.[currentRole]?.task || 'Synchronizing...'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6, fontSize: '1.1rem' }}>{scenario?.roles?.[currentRole]?.questions?.[0]?.text || 'Wait for mission data to stabilize...'}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {scenario?.roles?.[currentRole]?.questions?.[0]?.options?.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(opt)} className="btn-secondary" style={{ padding: '1.5rem', textAlign: 'left', background: answerState === 'correct' && opt.correct ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-tertiary)', borderColor: answerState === 'correct' && opt.correct ? 'var(--accent-success)' : 'var(--glass-border)' }}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> <Users size={18} /> CREW SYNCHRONIZATION</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {otherRoles.map(role => (
                    <div key={role}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                        <span>{role.toUpperCase()}</span>
                        <span>{Math.floor(teamProgress[role] || 0)}%</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div animate={{ width: `${teamProgress[role] || 0}%` }} style={{ height: '100%', background: 'var(--accent-primary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--accent-primary)' }}>SECURE COMMS</h4>
              <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {messages.map(m => (
                  <div key={m.id} style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 900, color: m.sender === 'System' ? 'var(--accent-warning)' : 'var(--accent-secondary)' }}>[{m.sender}]</span> {m.text}
                  </div>
                ))}
              </div>
              <input type="text" placeholder="SEND MESSAGE..." onKeyDown={(e) => { if (e.key === 'Enter') { sendChatMessage(e.target.value); e.target.value = ''; } }} style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '0.8rem' }} />
            </div>
          </motion.div>
        )}

        {gameState === 'phase-complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', paddingTop: '6rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-success)', margin: '0 auto 2rem' }}>
              <CheckCircle2 size={40} color="var(--accent-success)" />
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>PHASE {currentChapter + 1} CLEAR</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>The team has successfully synchronized. Moving to next objective...</p>
            <button onClick={() => { setCurrentChapter(prev => prev + 1); setGameState('playing'); setTimeLeft(baseTime); setTeamProgress({}); setAnswerState(null); }} className="btn-primary" style={{ padding: '1.2rem 3.5rem', fontSize: '1.1rem' }}>
              PROCEED TO PHASE {currentChapter + 2} <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {gameState === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', paddingTop: '6rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-danger)', margin: '0 auto 2rem' }}>
              <XCircle size={40} color="var(--accent-danger)" />
            </div>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>HEIST FAILED</h2>
            <button onClick={() => window.location.reload()} className="btn-secondary" style={{ width: '100%', padding: '1.2rem' }}>RETRY MISSION</button>
          </motion.div>
        )}

        {gameState === 'victory' && (
          <motion.div key="victory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-success)', margin: '0 auto 2rem' }}>
              <Lock size={50} color="var(--accent-success)" />
            </div>
            <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1rem' }}>VAULT BREACHED</h2>
            <BorderGlow animated={true} glowColor="140 80 50">
              <div style={{ padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '1rem' }}>+2,500 XP</div>
                <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ width: '100%' }}>RETURN TO SAFEhouse</button>
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
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white' }}>INITIALIZING MISSION...</div>}>
      <HeistContent />
    </Suspense>
  );
}
