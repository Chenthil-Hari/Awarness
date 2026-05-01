'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle2, ChevronRight, Zap, Target, BookOpen, Star, Users } from 'lucide-react';
import Link from 'next/link';

const SKILL_NODES = [
  // --- CYBERSECURITY PATH (CYAN) ---
  {
    id: 'sec_1',
    title: 'Phishing Awareness',
    domain: 'Cybersecurity',
    xpRequired: 0,
    scenarios: ['cybersecurity-phishing', 'phishing-advanced'],
    icon: <Shield size={24} />,
    description: 'Learn to identify and neutralize sophisticated email threats.',
    position: { x: 80, y: 80 },
    color: '#22d3ee'
  },
  {
    id: 'sec_2',
    title: 'Social Engineering',
    domain: 'Cybersecurity',
    xpRequired: 500,
    scenarios: ['social-eng-1'],
    icon: <Target size={24} />,
    description: 'Protect yourself against human manipulation tactics.',
    position: { x: 320, y: 80 },
    parentId: 'sec_1',
    color: '#22d3ee'
  },
  {
    id: 'sec_3',
    title: 'Deepfake Detective',
    domain: 'Cybersecurity',
    xpRequired: 1200,
    scenarios: ['deepfake-analysis'],
    icon: <BookOpen size={24} />,
    description: 'Train your optical sensors to identify synthetic media.',
    position: { x: 560, y: 80 },
    parentId: 'sec_2',
    color: '#22d3ee'
  },
  {
    id: 'sec_4',
    title: 'Zero-Day Defense',
    domain: 'Cybersecurity',
    xpRequired: 2500,
    scenarios: ['network-breach-response'],
    icon: <Skull size={24} />,
    description: 'Elite-level mitigation of previously unknown vulnerabilities.',
    position: { x: 800, y: 80 },
    parentId: 'sec_3',
    color: '#f43f5e'
  },

  // --- FINANCE PATH (GOLD) ---
  {
    id: 'fin_1',
    title: 'Financial Foundations',
    domain: 'Finance',
    xpRequired: 200,
    scenarios: ['finance-emergency', 'budgeting-basics'],
    icon: <Zap size={24} />,
    description: 'Master the core principles of personal financial security.',
    position: { x: 80, y: 320 },
    color: '#fbbf24'
  },
  {
    id: 'fin_2',
    title: 'Investment Risk',
    domain: 'Finance',
    xpRequired: 1000,
    scenarios: ['market-volatility'],
    icon: <TrendingUp size={24} />,
    description: 'Navigate high-stakes market scenarios without losing capital.',
    position: { x: 320, y: 320 },
    parentId: 'fin_1',
    color: '#fbbf24'
  },
  {
    id: 'fin_3',
    title: 'Crypto Security',
    domain: 'Finance',
    xpRequired: 2000,
    scenarios: ['wallet-security'],
    icon: <Lock size={24} />,
    description: 'Advanced protection for decentralized assets and private keys.',
    position: { x: 560, y: 320 },
    parentId: 'fin_2',
    color: '#fbbf24'
  },

  // --- LIFE SKILLS PATH (ROSE) ---
  {
    id: 'life_1',
    title: 'Emergency Response',
    domain: 'Life Skills',
    xpRequired: 800,
    scenarios: ['fire-safety-kitchen'],
    icon: <Shield size={24} />,
    description: 'Critical skills for handling real-world physical emergencies.',
    position: { x: 320, y: 520 },
    parentId: 'fin_1',
    color: '#f43f5e'
  },
  {
    id: 'life_2',
    title: 'Crisis Negotiation',
    domain: 'Life Skills',
    xpRequired: 1800,
    scenarios: ['de-escalation-tactics'],
    icon: <Users size={24} />,
    description: 'Master the art of psychological de-escalation in high-pressure conflicts.',
    position: { x: 560, y: 520 },
    parentId: 'life_1',
    color: '#f43f5e'
  }
];

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const [selectedNode, setSelectedNode] = useState(null);

  if (status === 'loading') return <LoadingSpinner message="Decrypting Roadmap..." />;

  const userXp = session?.user?.xp || 0;

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '6rem', background: 'var(--bg-main)' }}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>OPERATIONAL <span className="gradient-text">PATHWAY</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Your visual skill tree. Complete lower-tier nodes to unlock advanced specialization paths.
            </p>
          </motion.div>
        </header>

        <div style={{ 
          position: 'relative', 
          height: '600px', 
          width: '100%', 
          maxWidth: '1000px', 
          margin: '0 auto',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--glass-border)',
          overflow: 'hidden',
          padding: '2rem'
        }}>
          {/* SVG Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {SKILL_NODES.filter(n => n.parentId).map(node => {
              const parent = SKILL_NODES.find(p => p.id === node.parentId);
              const isUnlocked = userXp >= node.xpRequired;
              
              // Create a curved Bezier path
              const startX = parent.position.x + 40;
              const startY = parent.position.y + 40;
              const endX = node.position.x + 40;
              const endY = node.position.y + 40;
              
              const midX = (startX + endX) / 2;
              const pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

              return (
                <g key={`${parent.id}-${node.id}`}>
                  <path 
                    d={pathData}
                    fill="none"
                    stroke={isUnlocked ? (node.color || 'var(--accent-primary)') : 'var(--glass-border)'}
                    strokeWidth={isUnlocked ? "3" : "2"}
                    strokeOpacity={isUnlocked ? "0.6" : "0.3"}
                    strokeDasharray={isUnlocked ? "0" : "5,5"}
                    style={{ transition: 'all 0.5s ease' }}
                    filter={isUnlocked ? "url(#glow)" : "none"}
                  />
                  {isUnlocked && (
                    <motion.path
                      d={pathData}
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: [0, 1], 
                        opacity: [0, 1, 0],
                        pathOffset: [0, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {SKILL_NODES.map((node, idx) => {
            const isUnlocked = userXp >= node.xpRequired;
            const isSelected = selectedNode?.id === node.id;

            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedNode(node)}
                style={{
                  position: 'absolute',
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: isUnlocked ? 'var(--bg-tertiary)' : 'rgba(15, 23, 42, 0.8)',
                  border: `2px solid ${isUnlocked ? (node.color || 'var(--accent-primary)') : 'var(--glass-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1,
                  boxShadow: isUnlocked ? `0 0 20px ${node.color}33` : 'none',
                  color: isUnlocked ? (node.color || 'var(--accent-primary)') : 'var(--text-muted)'
                }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              >
                {isUnlocked ? node.icon : <Lock size={20} />}
                
                {/* Node Title Label */}
                <div style={{ position: 'absolute', top: '90px', width: '120px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {node.title}
                </div>
              </motion.div>
            );
          })}

          {/* Node Detail Panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  bottom: '1rem',
                  width: '320px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-xl)',
                  borderLeft: '1px solid var(--glass-border)',
                  padding: '2rem',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: selectedNode.color || 'var(--accent-primary)', letterSpacing: '2px' }}>{selectedNode.domain}</span>
                  <button onClick={() => setSelectedNode(null)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>DISMISS</button>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>{selectedNode.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>{selectedNode.description}</p>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Requirement</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: userXp >= selectedNode.xpRequired ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    <Zap size={14} />
                    <span style={{ fontWeight: 800 }}>{selectedNode.xpRequired} XP TOTAL</span>
                    {userXp >= selectedNode.xpRequired && <CheckCircle2 size={14} />}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Path Missions</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedNode.scenarios.map(sId => (
                      <div key={sId} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{sId.replace(/-/g, ' ').toUpperCase()}</span>
                        <ChevronRight size={14} color={selectedNode.color || "var(--accent-primary)"} />
                      </div>
                    ))}
                  </div>
                </div>

                <Link 
                  href="/scenarios"
                  className={userXp >= selectedNode.xpRequired ? "btn-primary" : "btn-secondary disabled"}
                  style={{ width: '100%', textAlign: 'center', padding: '1rem', marginTop: 'auto' }}
                >
                  {userXp >= selectedNode.xpRequired ? 'START MISSIONS' : 'RESTRICTED ACCESS'}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
