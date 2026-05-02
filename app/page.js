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
import Lottie from 'lottie-react';
import fireAnim from '@/images/fire.json';
import chartAnim from '@/images/line-chart.json';
import trophyAnim from '@/images/trophy.json';
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
      <div className="bento-grid-header">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.01 }}
          className="bento-card hero-card"
        >
          <div className="hero-content">
            <span className="hero-eyebrow">COMMAND CENTER</span>
            <h1 className="hero-welcome">Welcome back, <span className="gradient-text">{session?.user?.username}</span></h1>
            <p className="hero-desc">Your neural link is stable. Continue your training through the hierarchy.</p>
            
            <div className="hero-progress">
              <div className="progress-info">
                <span className="level-badge">LVL {level}</span>
                <span className="xp-text">{userXp} / {((level + 1) * 100)} XP</span>
              </div>
              <div className="progress-bar-outer">
                <motion.div 
                  className="progress-bar-inner"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInLevel}%` }}
                />
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <Shield size={120} className="floating-icon" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card stats-card"
        >
          <div className="stat-item">
             <div className="stat-icon-box success">
               <Lottie animationData={fireAnim} loop={true} style={{ width: 40, height: 40 }} />
             </div>
             <div className="stat-info">
               <span className="stat-label">DAILY STREAK</span>
               <span className="stat-val">{session?.user?.streak || 1} DAYS</span>
             </div>
          </div>
          <div className="stat-item">
             <div className="stat-icon-box warning">
               <Lottie animationData={chartAnim} loop={true} style={{ width: 40, height: 40 }} />
             </div>
             <div className="stat-info">
               <span className="stat-label">RANK</span>
               <span className="stat-val">{session?.user?.league || 'BRONZE'}</span>
             </div>
          </div>
          <div className="stat-item">
             <div className="stat-icon-box primary">
               <Lottie animationData={trophyAnim} loop={true} style={{ width: 40, height: 40 }} />
             </div>
             <div className="stat-info">
               <span className="stat-label">COMPLETED</span>
               <span className="stat-val">{session?.user?.completedMissions?.length || 0} NODES</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* --- CAMPAIGN TRACKER --- */}
      <section className="dashboard-section">
        <CampaignTracker onSelectScenario={setSelectedScenario} />
      </section>

      {/* --- NEURAL PASS --- */}
      <section id="neural-pass" className="dashboard-section">
        <NeuralPass />
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
    </div>
  );
}
