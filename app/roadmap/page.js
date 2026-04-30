'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle2, ChevronRight, Zap, Target, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';

const SKILL_NODES = [
  {
    id: 'sec_1',
    title: 'Phishing Awareness',
    domain: 'Cybersecurity',
    xpRequired: 0,
    scenarios: ['cybersecurity-phishing', 'phishing-advanced'],
    icon: <Shield size={24} />,
    description: 'Learn to identify and neutralize sophisticated email threats.',
    position: { x: 50, y: 50 }
  },
  {
    id: 'fin_1',
    title: 'Financial Foundations',
    domain: 'Finance',
    xpRequired: 200,
    scenarios: ['finance-emergency', 'budgeting-basics'],
    icon: <Zap size={24} />,
    description: 'Master the core principles of personal financial security.',
    position: { x: 50, y: 250 }
  },
  {
    id: 'sec_2',
    title: 'Social Engineering',
    domain: 'Cybersecurity',
    xpRequired: 500,
    scenarios: ['social-eng-1'],
    icon: <Target size={24} />,
    description: 'Protect yourself against human manipulation tactics.',
    position: { x: 300, y: 50 },
    parentId: 'sec_1'
  },
  {
    id: 'life_1',
    title: 'Emergency Response',
    domain: 'Life Skills',
    xpRequired: 800,
    scenarios: ['fire-safety-kitchen'],
    icon: <Shield size={24} />,
    description: 'Critical skills for handling real-world physical emergencies.',
    position: { x: 300, y: 250 },
    parentId: 'fin_1'
  },
  {
    id: 'sec_3',
    title: 'Encryption Expert',
    domain: 'Cybersecurity',
    xpRequired: 1500,
    scenarios: ['encryption-basics'],
    icon: <Star size={24} />,
    description: 'Advanced data protection and cryptographic protocols.',
    position: { x: 550, y: 50 },
    parentId: 'sec_2'
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
            {SKILL_NODES.filter(n => n.parentId).map(node => {
              const parent = SKILL_NODES.find(p => p.id === node.parentId);
              const isUnlocked = userXp >= node.xpRequired;
              return (
                <line 
                  key={`${parent.id}-${node.id}`}
                  x1={`${parent.position.x + 40}`} 
                  y1={`${parent.position.y + 40}`} 
                  x2={`${node.position.x + 40}`} 
                  y2={`${node.position.y + 40}`} 
                  stroke={isUnlocked ? 'var(--accent-primary)' : 'var(--glass-border)'}
                  strokeWidth="2"
                  strokeDasharray={isUnlocked ? "0" : "5,5"}
                  style={{ transition: 'all 0.5s ease' }}
                />
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
                  border: `2px solid ${isUnlocked ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1,
                  boxShadow: isUnlocked ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none',
                  color: isUnlocked ? 'var(--accent-primary)' : 'var(--text-muted)'
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
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '2px' }}>{selectedNode.domain}</span>
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
                        <span>{sId}</span>
                        <ChevronRight size={14} color="var(--accent-primary)" />
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
