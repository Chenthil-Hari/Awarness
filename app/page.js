'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Shield, Target, Activity, 
  ChevronRight, LayoutGrid, Search, 
  Filter, Star, TrendingUp, Award
} from 'lucide-react';
import SimulationViewer from './components/SimulationViewer';
import CampaignTracker from './components/CampaignTracker';
import NeuralPass from './components/NeuralPass/NeuralPass';
import LoadingSpinner from './components/LoadingSpinner';
import ScenarioCard from './components/ScenarioCard';
import AuroraBackground from './components/AuroraBackground';
import ScrambleText from './components/ScrambleText';
import Lottie from 'lottie-react';
import fireAnim from '@/images/fire.json';
import chartAnim from '@/images/line-chart.json';
import trophyAnim from '@/images/trophy.json';
import DailyFlash from './components/DailyFlash';
import ArchitectBriefing from './components/ArchitectBriefing';
import { calculateLevel } from '@/lib/game';
import './BentoDashboard.css';

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
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
    if (status === 'authenticated') fetchScenarios();
  }, [status]);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchesFilter = filter === 'All' || s.domain === filter;
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [scenarios, filter, search]);

  if (status === 'loading') return <div className="loader-page"><LoadingSpinner /></div>;

  const userXp = session?.user?.xp || 0;
  const level = calculateLevel(userXp);
  const xpInLevel = userXp % 100;

  return (
    <div className="bento-dashboard">
      <AuroraBackground />
      {/* --- HERO SECTION --- */}
      {/* --- HERO BANNER --- */}
      <div className="friendly-hero">
        <div className="hero-content">
          <h1 className="hero-welcome">
            Welcome back, <span className="gradient-text">{session?.user?.username}</span>
          </h1>
          <p className="hero-desc">Your neural link is stable. Ready for today's training?</p>
          
          <div className="hero-progress">
            <div className="progress-info">
              <span className="level-badge">Level {level}</span>
              <span className="xp-text">{userXp} / {((level + 1) * 100)} XP to next level</span>
            </div>
            <div className="progress-bar-outer">
              <motion.div 
                className="progress-bar-inner"
                initial={{ width: 0 }}
                animate={{ width: `${xpInLevel}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <Lottie animationData={fireAnim} loop={true} style={{ width: 150, height: 150, opacity: 0.8 }} />
        </div>
      </div>

      {/* --- 3-COLUMN ACTION GRID --- */}
      <div className="action-grid">
        <div className="action-card">
          <div className="action-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <Zap size={28} />
          </div>
          <h3>Daily Challenge</h3>
          <p>Complete today's flash scenario for bonus XP.</p>
          <DailyFlash inline={true} />
        </div>

        <div className="action-card">
          <div className="action-icon-box" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <TrendingUp size={28} />
          </div>
          <h3>Active Streak</h3>
          <p>You're on a {session?.user?.streak || 1} day streak. Don't lose your momentum!</p>
          <div className="action-stats">
            <div className="stat-pill">{session?.user?.streak || 1} Days</div>
          </div>
        </div>

        <div className="action-card">
          <div className="action-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Shield size={28} />
          </div>
          <h3>Neural Pass</h3>
          <p>Unlock premium rewards by completing missions.</p>
          <div className="action-stats">
            <div className="stat-pill">Tier {Math.floor((session?.user?.xp || 0) / 500) + 1}</div>
          </div>
        </div>
      </div>

      {/* --- CAMPAIGN TRACKER --- */}
      <section className="dashboard-section" style={{ marginTop: '2rem' }}>
        <CampaignTracker onSelectScenario={setSelectedScenario} />
      </section>

      {/* --- MISSION GRID --- */}
      <section className="dashboard-section">
        <div className="section-header">
           <div className="header-left">
             <LayoutGrid size={20} color="var(--accent-primary)" />
             <h2 className="section-title">Simulation Nodes</h2>
           </div>
           
           <div className="header-controls">
             <div className="search-box">
               <Search size={16} />
               <input 
                 type="text" 
                 placeholder="Search nodes..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <div className="filter-chips">
               {['All', 'Cybersecurity', 'Financial Literacy', 'Life Skills'].map(f => (
                 <button 
                    key={f} 
                    className={`chip ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                 >
                   {f}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {loadingScenarios ? (
          <div className="loading-grid">
            <LoadingSpinner message="Scanning neural network..." />
          </div>
        ) : (
          <div className="scenario-grid">
            {filteredScenarios.map((scenario) => (
              <ScenarioCard 
                key={scenario.id} 
                scenario={scenario} 
                onClick={() => setSelectedScenario(scenario)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Simulation Overlay */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000 }}
          >
            <SimulationViewer 
              scenario={selectedScenario} 
              onExit={() => setSelectedScenario(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ArchitectBriefing user={session?.user} />
    </div>
  );
}
