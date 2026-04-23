'use client';

import { useState } from 'react';
import Navbar from './components/Navbar';
import ScenarioCard from './components/ScenarioCard';
import SimulationViewer from './components/SimulationViewer';
import { scenarios } from './data/scenarios';
import { motion } from 'framer-motion';
import { Shield, Lightbulb, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [totalScore, setTotalScore] = useState(1250);
  const [level, setLevel] = useState(3);

  const handleScenarioComplete = () => {
    // In a real app, we'd update the global score here
    setSelectedScenario(null);
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '5rem' }}>
      <Navbar score={totalScore} level={level} />

      <div className="container">
        {/* Hero Section */}
        <header style={{ textAlign: 'center', padding: '4rem 0 6rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
              Master Real-World <span className="gradient-text">Challenges</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Step into realistic simulations designed to build your awareness and decision-making skills in safety, finance, and digital security.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem',
              flexWrap: 'wrap'
            }}
          >
            {[
              { icon: <Shield size={20} />, label: 'Cyber Security', count: 12 },
              { icon: <TrendingUp size={20} />, label: 'Financial Literacy', count: 8 },
              { icon: <Users size={20} />, label: 'Life Skills', count: 15 },
              { icon: <Lightbulb size={20} />, label: 'Mental Health', count: 6 },
            ].map((stat, i) => (
              <div key={i} className="glass" style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid var(--glass-border)'
              }}>
                <span style={{ color: 'var(--accent-primary)' }}>{stat.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{stat.label}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{stat.count}</span>
              </div>
            ))}
          </motion.div>
        </header>

        {/* Dashboard Sections */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Active Scenarios</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Scenarios tailored to your current level.</p>
            </div>
            <button style={{ color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>View All Scenarios</button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '2rem' 
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

        {/* Daily Challenge Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card" 
          style={{ 
            marginTop: '5rem', 
            padding: '2.5rem', 
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Daily Awareness Challenge</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
              Complete today's "Fire Safety Protocol" scenario to earn a 2x XP bonus and unlock the "Safety First" badge.
            </p>
          </div>
          <button className="btn-primary" style={{ padding: '1rem 2rem' }}>Accept Challenge</button>
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
