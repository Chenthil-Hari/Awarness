'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import LoadingSpinner from './components/LoadingSpinner';
import ScenarioCard from './components/ScenarioCard';
import SimulationViewer from './components/SimulationViewer';
import ThreatMapCanvas from './components/ThreatMapCanvas';
import TransmissionModal from './components/TransmissionModal';
import './vault-shield.css';

const tickerItems = [
  "ALERT: Phishing campaign detected — 3,200 targets identified across APAC",
  "WARN: Brute-force attack on /admin — 47k attempts in 6 min — IP blocked",
  "INFO: CVE-2024-8811 — Remote code execution — CVSS 9.8 — Patch available",
  "ALERT: Credential stuffing wave — 1.2M login attempts — 99% blocked",
  "WARN: DarkReaper ransomware group — new payload variant observed",
  "INFO: Smishing campaign targeting financial sector employees — 14 countries",
  "ALERT: Supply chain compromise detected in npm package 'auth-helper@2.1.0'",
];
const doubledTicker = [...tickerItems, ...tickerItems];

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeTransmission, setActiveTransmission] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  // Counters
  const [liveCount, setLiveCount] = useState(1284701);
  const [attackCount, setAttackCount] = useState(2847);
  const [threatCount, setThreatCount] = useState(143);

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

  useEffect(() => {
    const tickIv = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 600);
    const flickerIv = setInterval(() => {
      setAttackCount(2800 + Math.floor(Math.random() * 200));
      setThreatCount(130 + Math.floor(Math.random() * 30));
    }, 2000);
    return () => {
      clearInterval(tickIv);
      clearInterval(flickIv);
    };
  }, []);

  if (status === 'loading') return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#03040a' }}><LoadingSpinner /></div>;

  return (
    <div className="vault-shield-theme">
      {/* HERO SECTION — THREAT MAP */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="grid-overlay"></div>
        <div className="scanline"></div>
        <ThreatMapCanvas />
        <div className="vignette"></div>

        <div className="top-bar">
          <div className="brand">⬡ VAULTSHIELD</div>
          <div className="top-stats">
            <div className="stat">
              <div className="stat-val">{attackCount.toLocaleString()}</div>
              <div className="stat-label">Attacks / hr</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: 'var(--amber)', textShadow: '0 0 10px var(--amber-glow)' }}>{threatCount}</div>
              <div className="stat-label">Active Threats</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: 'var(--green)', textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>99.2%</div>
              <div className="stat-label">Blocked</div>
            </div>
          </div>
          <div className="live-badge">
            <div className="live-dot"></div>
            Live Feed
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">Cyber Threat Intelligence Platform</div>
          <h1 className="hero-title">The Threats Are <span>Real.</span><br/>Your Training Should Be Too.</h1>
          <p className="hero-sub">Welcome back, {session?.user?.username || 'Operative'}. Immersive, scenario-based security training that mirrors the tactics of today's most sophisticated attackers. Learn to detect. React. Neutralize.</p>
          <div className="hero-ctas">
            <button className="btn-primary-vs" onClick={() => {
              if (scenarios.length > 0) setActiveTransmission(scenarios[0]);
            }}>▶ Begin Training</button>
            <button className="btn-secondary-vs">View Threat Map</button>
          </div>
        </div>

        <div className="attack-counter-wrap">
          <div className="attack-counter-val">{liveCount.toLocaleString()}</div>
          <div className="attack-counter-label">Attacks intercepted today</div>
        </div>

        <div className="ticker">
          <div className="ticker-label">⚠ Threat Feed</div>
          <div className="ticker-track">
            {doubledTicker.map((t, i) => (
              <span key={i} style={{ paddingRight: '60px' }}>● {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SCENARIO CARDS */}
      <section className="scenarios-section" id="scenarios">
        <div className="section-header">
          <div className="section-eyebrow">// Active Training Modules</div>
          <div className="section-title">Select Your Mission</div>
        </div>
        
        {loadingScenarios ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner message="Decrypting nodes..." />
          </div>
        ) : (
          <div className="scenarios-grid">
            {scenarios.map(s => (
              <ScenarioCard key={s.id} scenario={s} onClick={() => setActiveTransmission(s)} />
            ))}
          </div>
        )}
      </section>

      {/* MODALS */}
      <TransmissionModal 
        scenario={activeTransmission}
        isOpen={!!activeTransmission}
        onClose={() => setActiveTransmission(null)}
        onAccept={(s) => {
          setActiveTransmission(null);
          setSelectedScenario(s);
        }}
      />

      <AnimatePresence>
        {selectedScenario && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#03040a' }}>
            <SimulationViewer 
              scenario={selectedScenario} 
              onExit={() => setSelectedScenario(null)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
