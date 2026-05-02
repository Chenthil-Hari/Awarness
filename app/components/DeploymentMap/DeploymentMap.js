'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import Globe from './Globe';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import './DeploymentMap.css';

export default function DeploymentMap({ onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);

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

  if (loading) return <div className="map-loader"><LoadingSpinner message="SYNCING WITH TACTICAL SATELLITE NETWORK..." /></div>;

  return (
    <div className="deployment-map-container">
      <div className="map-ui-overlay">
        <div className="map-header">
          <Activity size={20} className="pulse" />
          <div className="map-title-group">
            <h2 className="map-title">TACTICAL DEPLOYMENT GRID</h2>
            <span className="map-subtitle">SCANNING FOR ACTIVE NEURAL BREACHES...</span>
          </div>
        </div>

        {/* Selected Mission Info Box */}
        <AnimatePresence>
          {selectedPoint && (
            <motion.div 
              className="mission-info-panel"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
            >
              <div className="panel-header">
                <Shield size={16} />
                <span>MISSION BRIEFING</span>
              </div>
              <h3 className="panel-title">{selectedPoint.title}</h3>
              <p className="panel-desc">{selectedPoint.description}</p>
              <div className="panel-stats">
                <div className="p-stat">
                  <span className="p-label">DIFFICULTY</span>
                  <span className={`p-val ${selectedPoint.difficulty.toLowerCase()}`}>{selectedPoint.difficulty}</span>
                </div>
                <div className="p-stat">
                  <span className="p-label">DOMAIN</span>
                  <span className="p-val">{selectedPoint.domain}</span>
                </div>
              </div>
              <button className="deploy-btn" onClick={() => onSelectScenario(selectedPoint)}>
                INITIATE DEPLOYMENT <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="map-footer">
          <div className="status-indicator">
            <div className="status-dot online" />
            <span>ENCRYPTED LINK STABLE</span>
          </div>
          <div className="coordinates-display">
            LAT: 28.57° N | LON: 77.21° E
          </div>
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        <Suspense fallback={null}>
          <Globe scenarios={scenarios} onSelect={setSelectedPoint} />
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

      <div className="map-vignette" />
    </div>
  );
}
