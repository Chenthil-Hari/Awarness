'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import ScenarioCard from './components/ScenarioCard';
import SimulationViewer from './components/SimulationViewer';
import { motion } from 'framer-motion';
import { Shield, Lightbulb, TrendingUp, Users, Skull, ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';
import BorderGlow from './components/BorderGlow/BorderGlow';
import { calculateLevel } from '@/lib/game';
import CommunityPoll from './components/CommunityPoll';
import LandingPage from './components/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import CampaignTracker from './components/CampaignTracker';
import HallOfFame from './components/HallOfFame';
import PromotionModal from './components/PromotionModal';
// import ThreeBackground from './components/ThreeBackground';

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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050101' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Authenticated Dashboard View
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem', position: 'relative' }}>
      {/* <ThreeBackground mode="arena" speed={0.5} intensity={0.5} /> */}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar score={userXp} level={level} />
        <PromotionModal user={session?.user} />

        <div className="container" style={{ padding: '0 1rem' }}>
          {/* Hero Section */}
          <header style={{ textAlign: 'center', padding: '3rem 0 4rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
                Welcome back, <span className="gradient-text">{ghostUser ? ghostUser.username : (session?.user?.username || 'Learner')}</span>
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
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)'
              }}>
                <span style={{ color: 'var(--accent-primary)' }}>{stat.icon}</span>
                {stat.label}
              </div>
            ))}
          </motion.div>
          </header>

          <CampaignTracker onSelectScenario={setSelectedScenario} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
              <Skull size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>Threat <span className="gradient-text">Simulations</span></h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Deploy into controlled environments and neutralize risks.</p>
            </div>
          </div>

          {loadingScenarios ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner message="Decrypting scenarios..." />
            </div>
          ) : (
            <div className="grid-container" style={{ marginBottom: '4rem' }}>
              {scenarios.map((scenario) => (
                <ScenarioCard 
                  key={scenario._id} 
                  scenario={scenario} 
                  onClick={() => setSelectedScenario(scenario)} 
                />
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            <CommunityPoll />
            
            <Link href="/shop" style={{ textDecoration: 'none' }}>
              <BorderGlow glowColor="140 80 50">
                <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <ShoppingBag size={30} color="var(--accent-primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem' }}>Neural Shop</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exchange your hard-earned XP for premium upgrades and assets.</p>
                </div>
              </BorderGlow>
            </Link>
          </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card"
          style={{
            padding: '2.5rem',
            borderRadius: '24px',
            marginBottom: '4rem',
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
              Complete today\'s "Fire Safety Protocol" scenario to earn a 2x XP bonus.
            </p>
          </div>
          <button className="btn-primary" style={{ padding: '0.8rem 1.8rem', width: 'auto' }}>Accept</button>
        </motion.div>

        <HallOfFame />
      </div>

      {/* Simulation Overlay */}
      {selectedScenario && (
        <SimulationViewer 
          scenario={selectedScenario} 
          onExit={handleScenarioComplete} 
        />
      )}
      </div>
    </main>
  );
}
