'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import Globe from './Globe';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, ChevronRight, Search, 
  Filter, Crosshair, Terminal, Globe as GlobeIcon 
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import './DeploymentMap.css';

export default function DeploymentMap({ onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios');
        const data = await res.json();
        setScenarios(data);
      } catch (err) {
        console.error("Failed to load scenarios for map");
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchesFilter = filter === 'All' || s.domain === filter;
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [scenarios, filter, search]);

  if (loading) return <div className="map-loader"><LoadingSpinner message="SYNCING WITH TACTICAL SATELLITE NETWORK..." /></div>;

  return (
    <div className="deployment-terminal">
      {/* --- TOP BAR --- */}
      <header className="terminal-header">
        <div className="terminal-brand">
          <Terminal size={18} className="pulse" />
          <div className="brand-text">
             <span className="brand-title">TACTICAL DEPLOYMENT TERMINAL</span>
             <span className="brand-subtitle">V2.0.4 // SECTOR: GLOBAL</span>
          </div>
        </div>
        
        <div className="terminal-controls">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="SEARCH NODE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            {['All', 'Cybersecurity', 'Financial Literacy', 'Life Skills'].map(f => (
              <button 
                key={f} 
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'All' ? 'ALL SECTORS' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="terminal-body">
        {/* --- LEFT: 3D RADAR --- */}
        <div className="terminal-radar-pane">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
            <Suspense fallback={null}>
              <Globe 
                scenarios={filteredScenarios} 
                onSelect={setSelectedPoint} 
                selectedId={selectedPoint?.id} 
              />
              <Environment preset="city" />
              <ContactShadows opacity={0.4} scale={10} blur={2.4} far={4.5} />
            </Suspense>
            <OrbitControls 
              enablePan={false} 
              minDistance={4} 
              maxDistance={8} 
              autoRotate={!selectedPoint}
              autoRotateSpeed={0.5}
            />
          </Canvas>
          <div className="radar-overlay">
            <div className="radar-grid" />
            <div className="radar-scanline" />
            <div className="radar-status">
              <GlobeIcon size={12} />
              <span>RADAR SCAN ACTIVE // {filteredScenarios.length} NODES DETECTED</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT: MISSION LIST --- */}
        <div className="terminal-list-pane">
           <div className="list-header">
             <Crosshair size={14} />
             <span>ACTIVE MISSION NODES</span>
           </div>
           <div className="mission-list-scroll">
             {filteredScenarios.map((scenario) => (
               <div 
                 key={scenario.id} 
                 className={`mission-item ${selectedPoint?.id === scenario.id ? 'selected' : ''}`}
                 onClick={() => setSelectedPoint(scenario)}
               >
                 <div className="item-indicator" />
                 <div className="item-main">
                    <span className="item-title">{scenario.title}</span>
                    <div className="item-meta">
                      <span className={`difficulty ${scenario.difficulty.toLowerCase()}`}>{scenario.difficulty}</span>
                      <span className="divider">•</span>
                      <span className="domain">{scenario.domain}</span>
                    </div>
                 </div>
                 <ChevronRight size={16} className="item-arrow" />
               </div>
             ))}
             {filteredScenarios.length === 0 && (
               <div className="no-results">
                 <AlertTriangle size={32} />
                 <span>NO ACTIVE BREACHES DETECTED IN THIS SECTOR</span>
               </div>
             )}
           </div>

           {/* Quick Action Panel */}
           <AnimatePresence>
             {selectedPoint && (
               <motion.div 
                 className="quick-action-panel"
                 initial={{ y: 50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: 50, opacity: 0 }}
               >
                 <div className="panel-info">
                   <h4 className="panel-title">{selectedPoint.title}</h4>
                   <p className="panel-desc">{selectedPoint.description.substring(0, 80)}...</p>
                 </div>
                 <button className="deploy-btn" onClick={() => onSelectScenario(selectedPoint)}>
                   DEPLOY <ChevronRight size={14} />
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="terminal-footer">
        <div className="footer-stat">
          <span className="label">SYSTEM:</span>
          <span className="val success">ONLINE</span>
        </div>
        <div className="footer-stat">
          <span className="label">ENCRYPTION:</span>
          <span className="val">AES-256-GCM</span>
        </div>
        <div className="footer-stat">
          <span className="label">UPLINK:</span>
          <span className="val">842.1 MBPS</span>
        </div>
        <div className="footer-coords">
          28.572° N | 77.211° E | ALT 1.5M KM
        </div>
      </footer>
    </div>
  );
}
