'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import ScenarioCard from './components/ScenarioCard';
import SimulationViewer from './components/SimulationViewer';
import { motion } from 'framer-motion';
import { Shield, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { calculateLevel } from '../lib/game';
import CommunityPoll from './components/CommunityPoll';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [userXp, setUserXp] = useState(0);

  const [ghostUser, setGhostUser] = useState(null);

  // Initialize XP and handle Ghost Mode
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
  }, [session, status, router]);

  const handleScenarioComplete = () => {
    setSelectedScenario(null);
  };

  const level = calculateLevel(userXp);

  // Show landing page if not authenticated
  if (status === 'unauthenticated') {
    return (
      <main>
        <Navbar />
        <LandingPage />
      </main>
    );
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Authenticated Dashboard View
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar score={userXp} level={level} />

      <div className="container" style={{ padding: '0 1rem' }}>
        {/* Hero Section */}
        <header style={{ textAlign: 'center', padding: '3rem 0 4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
              Welcome back, <span className="gradient-text">{ghostUser ? ghostUser.username : (session.user.username || 'Learner')}</span>
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem', padding: '0 1rem' }}>
              Pick up where you left off and continue mastering real-world challenges.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: <Shield size={18} />, label: 'Cyber Security', count: 12 },
              { icon: <TrendingUp size={18} />, label: 'Finance', count: 8 },
              { icon: <Users size={18} />, label: 'Life Skills', count: 15 },
              { icon: <Lightbulb size={18} />, label: 'Mental Health', count: 6 },
            ].map((stat, i) => (
              <div key={i} className="glass" style={{ 
                padding: '0.6rem 1.2rem', 
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                border: '1px solid var(--glass-border)'
              }}>
                <span style={{ color: 'var(--accent-primary)' }}>{stat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{stat.label}</span>
                <span className="hide-mobile" style={{ fontSize: '0.75rem', opacity: 0.5 }}>{stat.count}</span>
              </div>
            ))}
          </motion.div>
        </header>

        {/* Main Dashboard Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 800px), 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Scenarios */}
          <section style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', fontWeight: 800 }}>Active Scenarios</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tailored to your current level.</p>
              </div>
              <button style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>View All</button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', 
              gap: '1.5rem' 
            }}>
              {scenarios.map((scenario) => (
                <ScenarioCard 
                  key={scenario.id} 
                  scenario={scenario} 
                  onSelect={(s) => setSelectedScenario(s)} 
                />
              ))}
            </div>
          </section>

          {/* Right Column: Community & Stats */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <CommunityPoll />
          </aside>
        </div>

        {/* Daily Challenge Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card flex-mobile-column" 
          style={{ 
            marginTop: '4rem', 
            padding: '2rem', 
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          <div style={{ textAlign: 'inherit' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Daily Awareness Challenge</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '0.9rem' }}>
              Complete today's "Fire Safety Protocol" scenario to earn a 2x XP bonus.
            </p>
          </div>
          <button className="btn-primary" style={{ padding: '0.8rem 1.8rem', width: 'auto' }}>Accept</button>
        </motion.div>
      </div>

      {/* Simulation Overlay */}
      {selectedScenario && (
        <SimulationViewer 
          scenario={selectedScenario} 
          onExit={handleScenarioComplete} 
        />
      )}
    </main>
  );
}
