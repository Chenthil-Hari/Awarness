'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import ScenarioCard from './components/ScenarioCard';
import SimulationViewer from './components/SimulationViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lightbulb, TrendingUp, Users, Skull, ShoppingBag, Eye, Zap, Target, Activity, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import BorderGlow from './components/BorderGlow/BorderGlow';
import { calculateLevel } from '@/lib/game';
import CommunityPoll from './components/CommunityPoll';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import CampaignTracker from './components/CampaignTracker';
import HallOfFame from './components/HallOfFame';
import PromotionModal from './components/PromotionModal';
import DeploymentMap from './components/DeploymentMap/DeploymentMap';
import NeuralPass from './components/NeuralPass/NeuralPass';
import { useTheme } from './context/ThemeContext';

export default function Home() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [userXp, setUserXp] = useState(0);
  const [ghostUser, setGhostUser] = useState(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const checkGhost = async () => {
      const cookies = document.cookie.split('; ');
      const ghostId = cookies.find(c => c.startsWith('impersonate_user_id='))?.split('=')[1];
      
      if (ghostId && session?.user?.role === 'admin') {
        try {
          const res = await fetch(`/api/admin/users/${ghostId}`);
          if (res.ok) {
            const data = await res.json();
            setGhostUser(data);
            setUserXp(data.xp || 0);
          }
        } catch (error) {
          console.error('Failed to fetch ghost user data');
        }
      } else if (session?.user?.xp !== undefined) {
        setUserXp(session.user.xp);
        setGhostUser(null);
      }
    };

    const fetchScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios');
        const data = await res.json();
        setScenarios(data);
      } catch (err) {
        console.error("Failed to load scenarios");
      } finally {
        setLoadingScenarios(false);
      }
    };

    if (status === 'authenticated') {
      checkGhost();
      fetchScenarios();
    }

    const handleXpUpdate = (e) => {
      const { xp } = e.detail;
      setUserXp(xp);
    };

    window.addEventListener('xp-update', handleXpUpdate);
    return () => {
      window.removeEventListener('xp-update', handleXpUpdate);
    };
  }, [session, status, router]);

  const handleScenarioComplete = () => {
    setSelectedScenario(null);
  };

  const level = calculateLevel(userXp);

  if (status === 'unauthenticated') {
    return (
      <main style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <LandingPage />
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background-color 0.5s ease' }}>
      <Navbar score={userXp} level={level} />
      <PromotionModal user={session?.user} />

      {/* Dynamic Background Pattern */}
      <div style={{ 
        position: 'fixed', inset: 0, 
        background: isDark 
          ? 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, transparent 100%)' 
          : 'radial-gradient(circle at 50% -20%, #e2e8f0 0%, transparent 100%)',
        opacity: 0.4, pointerEvents: 'none', zIndex: 0 
      }} />

      <div style={{ position: 'relative', zIndex: 1, paddingBottom: '8rem' }}>
        <div className="container">
          {/* Enhanced Tactical Hero Section */}
          <header style={{ textAlign: 'center', padding: '6rem 0 4rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
                padding: '0.6rem 1.2rem', background: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-full)', marginBottom: '2rem',
                border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)'
              }}>
                <Activity size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--text-muted)' }}>OPERATIVE STATUS: ONLINE</span>
              </div>

              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, 
                letterSpacing: '-3px', lineHeight: 0.9, marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}>
                Welcome back,<br />
                <span className="gradient-text">{ghostUser ? ghostUser.username : (session?.user?.username || 'Learner')}</span>
              </h1>
              
              <p style={{ 
                fontSize: '1.2rem', color: 'var(--text-secondary)', 
                maxWidth: '600px', margin: '0 auto 3rem', fontWeight: 500,
                lineHeight: 1.5
              }}>
                The simulation grid is calibrated. Continue your progression through the neural hierarchy.
              </p>
            </motion.div>

              {/* Stats Row */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem', 
                width: '100%'
              }}>
                {[
                  { label: 'COMPLETED', val: session?.user?.completedMissions?.length || 0, icon: <Shield size={24} /> },
                  { label: 'XP RATING', val: userXp?.toLocaleString(), icon: <Zap size={24} /> },
                  { label: 'NEURAL LVL', val: level, icon: <Target size={24} /> }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="glass-card"
                    style={{ 
                      padding: '2.5rem 1.5rem', 
                      borderRadius: '32px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      textAlign: 'center',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--glass-border)',
                      boxShadow: 'var(--shadow-md)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ color: 'var(--accent-primary)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{stat.val}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>{stat.label}</div>
                    
                    {/* Subtle decorative element */}
                    <div style={{ 
                      position: 'absolute', top: '-10%', right: '-10%', 
                      width: '100px', height: '100px', 
                      background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)', 
                      opacity: 0.05, filter: 'blur(20px)' 
                    }} />
                  </motion.div>
                ))}
              </div>
          </header>

          <CampaignTracker onSelectScenario={setSelectedScenario} />

          {/* 3D Tactical Deployment Section */}
          <section style={{ marginTop: '4rem' }}>
             <DeploymentMap onSelectScenario={setSelectedScenario} />
          </section>

          <NeuralPass />

          {/* Social & Shop Hub */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2.5rem', 
            marginTop: '6rem' 
          }}>
            <CommunityPoll />
            
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <BorderGlow glowColor="140 80 50" borderRadius={32}>
                <div style={{ 
                  padding: '3rem', height: '100%', display: 'flex', 
                  flexDirection: 'column', justifyContent: 'center', 
                  alignItems: 'center', textAlign: 'center',
                  background: 'var(--bg-tertiary)', borderRadius: '32px'
                }}>
                  <div style={{ 
                    width: '80px', height: '80px', background: 'var(--bg-primary)', 
                    borderRadius: '24px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', marginBottom: '2rem',
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--glass-border)'
                  }}>
                    <ShoppingBag size={36} color="var(--accent-primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>Neural Shop</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '300px' }}>
                    Convert your accumulated XP into premium equipment and sector assets.
                  </p>
                </div>
              </BorderGlow>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: '3rem', borderRadius: '32px', marginTop: '6rem',
              background: isDark 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)',
              border: '1px solid var(--glass-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '2rem'
            }}
          >
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Daily Awareness Challenge</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.5 }}>
                Complete the synchronized "Neural Defense" protocol today to receive a temporary 2x XP multiplier.
              </p>
            </div>
            <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem', fontWeight: 800 }}>INITIALIZE MISSION</button>
          </motion.div>

          <section style={{ marginTop: '6rem' }}>
            <HallOfFame />
          </section>
        </div>
      </div>

      {/* Simulation Overlay */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
          >
            <SimulationViewer 
              scenario={selectedScenario} 
              onExit={handleScenarioComplete} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
