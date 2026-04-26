'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, Plus, Trash2, Save, Play, Lock, 
  ChevronRight, ChevronDown, Layers, Target, 
  AlertTriangle, CheckCircle2, Terminal, Shield,
  Settings, Info, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';

export default function ArchitectPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('editor'); // my-missions, editor
  const [missionData, setMissionData] = useState({
    title: '',
    description: '',
    mode: 'heist', // heist, survival
    difficulty: 'standard',
    phases: [
      {
        title: 'Phase 1',
        description: '',
        questions: [
          { text: '', options: [{ text: '', correct: true }, { text: '', correct: false }, { text: '', correct: false }] }
        ]
      }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const isHackerTier = (session?.user?.xp || 0) >= 3000;

  if (status === 'loading') return null;

  if (!session) {
    return (
      <main className="container" style={{ textAlign: 'center', marginTop: '10rem' }}>
        <Navbar />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Operative credentials required.</p>
      </main>
    );
  }

  if (!isHackerTier) {
    return (
      <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ position: 'relative', marginBottom: '3rem' }}>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              style={{ position: 'absolute', inset: -20, border: '2px dashed var(--accent-danger)', borderRadius: '50%', opacity: 0.3 }}
            />
            <div style={{ width: '100px', height: '100px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-danger)' }}>
              <Lock size={48} color="var(--accent-danger)" />
            </div>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>MISSION ARCHITECT: <span style={{ color: 'var(--accent-danger)' }}>LOCKED</span></h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
            The Mission Architect is reserved for elite <span style={{ color: 'var(--accent-warning)', fontWeight: 800 }}>Hacker-Tier</span> operatives. 
            Continue neutralizing threats to reach <span style={{ fontWeight: 900 }}>3,000 XP</span> and unlock the power to design the network.
          </p>
          <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem 3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>Current Progress</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{session.user.xp} / 3000 XP</p>
            </div>
            <div style={{ width: '150px', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(session.user.xp / 3000) * 100}%` }}
                style={{ height: '100%', background: 'var(--accent-danger)' }}
              />
            </div>
          </div>
          <button onClick={() => window.location.href='/heist'} className="btn-primary" style={{ marginTop: '3rem', padding: '1rem 3rem' }}>Neutralize Threats</button>
        </div>
      </main>
    );
  }

  const addPhase = () => {
    setMissionData(prev => ({
      ...prev,
      phases: [...prev.phases, { 
        title: `Phase ${prev.phases.length + 1}`, 
        description: '', 
        questions: [{ text: '', options: [{ text: '', correct: true }, { text: '', correct: false }, { text: '', correct: false }] }] 
      }]
    }));
  };

  const removePhase = (idx) => {
    if (missionData.phases.length <= 1) return;
    setMissionData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== idx)
    }));
  };

  const handlePhaseChange = (idx, field, value) => {
    const newPhases = [...missionData.phases];
    newPhases[idx][field] = value;
    setMissionData({ ...missionData, phases: newPhases });
  };

  const handleQuestionChange = (phaseIdx, qIdx, value) => {
    const newPhases = [...missionData.phases];
    newPhases[phaseIdx].questions[qIdx].text = value;
    setMissionData({ ...missionData, phases: newPhases });
  };

  const handleOptionChange = (phaseIdx, qIdx, optIdx, value) => {
    const newPhases = [...missionData.phases];
    newPhases[phaseIdx].questions[qIdx].options[optIdx].text = value;
    setMissionData({ ...missionData, phases: newPhases });
  };

  const saveMission = async () => {
    if (!missionData.title || !missionData.description) {
      alert("Please provide a title and description for your mission.");
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch('/api/architect/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(missionData)
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container" style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navbar />

      <div style={{ marginTop: '3rem', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Hammer size={20} color="var(--accent-warning)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-warning)', letterSpacing: '2px' }}>ARCHITECT STUDIO</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0 }}>MISSION <span className="gradient-text">DESIGNER</span></h1>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => setActiveTab('editor')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: activeTab === 'editor' ? 'var(--accent-primary)' : 'transparent', border: 'none', color: activeTab === 'editor' ? 'white' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            EDITOR
          </button>
          <button 
            onClick={() => setActiveTab('my-missions')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: activeTab === 'my-missions' ? 'var(--accent-primary)' : 'transparent', border: 'none', color: activeTab === 'my-missions' ? 'white' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            MY MISSIONS
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          {/* Main Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Mission Basic Info */}
            <BorderGlow animated={true} glowColor="124 58 237">
              <div style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <Info size={24} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>MISSION CORE IDENTITY</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Codename</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Operation Nightfall" 
                      value={missionData.title}
                      onChange={(e) => setMissionData({ ...missionData, title: e.target.value })}
                      style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Briefing Description</label>
                    <textarea 
                      rows={4} 
                      placeholder="Detailed mission brief for operatives..." 
                      value={missionData.description}
                      onChange={(e) => setMissionData({ ...missionData, description: e.target.value })}
                      style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontSize: '1rem', lineHeight: 1.6, resize: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Operational Mode</label>
                      <select 
                        value={missionData.mode}
                        onChange={(e) => setMissionData({ ...missionData, mode: e.target.value })}
                        style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontWeight: 700 }}
                      >
                        <option value="heist">Co-op Heist</option>
                        <option value="survival">Solo Survival</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Difficulty Rating</label>
                      <select 
                        value={missionData.difficulty}
                        onChange={(e) => setMissionData({ ...missionData, difficulty: e.target.value })}
                        style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', fontWeight: 700 }}
                      >
                        <option value="standard">Standard</option>
                        <option value="hard">Hardcore</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </BorderGlow>

            {/* Phases Architecture */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Layers size={22} color="var(--accent-secondary)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>MISSION ARCHITECTURE</h3>
                </div>
                <button 
                  onClick={addPhase}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(8, 145, 178, 0.1)', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Plus size={16} /> ADD PHASE
                </button>
              </div>

              {missionData.phases.map((phase, pIdx) => (
                <div key={pIdx} className="glass-card" style={{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: '32px', height: '32px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900 }}>{pIdx + 1}</span>
                      <input 
                        type="text" 
                        value={phase.title}
                        onChange={(e) => handlePhaseChange(pIdx, 'title', e.target.value)}
                        style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', fontWeight: 800, color: 'white', borderBottom: '1px solid transparent', padding: '2px 0' }}
                        onFocus={(e) => e.target.style.borderBottom = '1px solid var(--accent-secondary)'}
                        onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                      />
                    </div>
                    <button onClick={() => removePhase(pIdx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '0.5rem' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phase Objective</label>
                    <input 
                      type="text" 
                      placeholder="Goal for this phase..." 
                      value={phase.description}
                      onChange={(e) => handlePhaseChange(pIdx, 'description', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-secondary)' }}
                    />
                  </div>

                  {phase.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Security Challenge (Question)</label>
                      <input 
                        type="text" 
                        placeholder="Operatives will need to solve this..." 
                        value={q.text}
                        onChange={(e) => handleQuestionChange(pIdx, qIdx, e.target.value)}
                        style={{ width: '100%', padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', marginBottom: '1.5rem' }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx}>
                            <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: oIdx === 0 ? 'var(--accent-success)' : 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                              {oIdx === 0 ? 'Correct Answer' : `Decoy ${oIdx}`}
                            </label>
                            <input 
                              type="text" 
                              value={opt.text}
                              onChange={(e) => handleOptionChange(pIdx, qIdx, oIdx, e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-secondary)', border: `1px solid ${oIdx === 0 ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-border)'}`, borderRadius: '8px', color: 'white', fontSize: '0.9rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--glass-border)' }}>
                <Zap size={24} color="var(--accent-warning)" />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>READY TO DEPLOY?</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Ensure your mission is challenging but fair. Complex architecture yields higher community ratings.
              </p>
              
              <button 
                onClick={saveMission}
                disabled={isSaving}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                {isSaving ? <LoadingSpinner size={16} /> : <Save size={18} />}
                {isSaving ? 'UPLOADING...' : 'SAVE & PUBLISH'}
              </button>

              {saveStatus === 'success' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--accent-success)', fontSize: '0.8rem', fontWeight: 800, marginTop: '1rem' }}>
                  <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> PAYLOAD DEPLOYED SUCCESSFULLY
                </motion.p>
              )}
              {saveStatus === 'error' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', fontWeight: 800, marginTop: '1rem' }}>
                  <AlertTriangle size={14} style={{ marginRight: '4px' }} /> UPLOAD INTERRUPTED
                </motion.p>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={14} color="var(--accent-primary)" /> ARCHITECT TIPS
              </h5>
              <ul style={{ padding: 0, listArray: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ minWidth: '4px', height: '4px', background: 'var(--accent-primary)', borderRadius: '50%', marginTop: '6px' }} />
                  Keep questions focused on real-world cybersecurity concepts.
                </li>
                <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ minWidth: '4px', height: '4px', background: 'var(--accent-primary)', borderRadius: '50%', marginTop: '6px' }} />
                  Use Phase Titles to build a cinematic narrative.
                </li>
                <li style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                  <div style={{ minWidth: '4px', height: '4px', background: 'var(--accent-primary)', borderRadius: '50%', marginTop: '6px' }} />
                  Legendary missions require at least 5 phases.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <Layers size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>No custom missions found.</h3>
          <p style={{ color: 'var(--text-muted)' }}>Missions you deploy will appear here for management.</p>
          <button onClick={() => setActiveTab('editor')} className="btn-secondary" style={{ marginTop: '2rem' }}>Start New Project</button>
        </div>
      )}
    </main>
  );
}

function LoadingSpinner({ size = 24 }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      style={{ width: size, height: size, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%' }}
    />
  );
}
