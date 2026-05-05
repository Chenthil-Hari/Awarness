'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

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
      clearInterval(flickerIv);
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
          <div className="auth-links">
            {status === 'unauthenticated' ? (
              <>
                <Link href="/auth/login" className="auth-link-vs">Login</Link>
                <Link href="/auth/signup" className="auth-btn-vs">Sign Up</Link>
              </>
            ) : (
              <Link href="/profile" className="auth-link-vs">Profile</Link>
            )}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-eyebrow">Cyber Threat Intelligence Platform</div>
          <h1 className="hero-title">The Threats Are <span>Real.</span><br/>Your Training Should Be Too.</h1>
          <p className="hero-sub">Welcome back, {session?.user?.username || 'Operative'}. Immersive, scenario-based security training that mirrors the tactics of today's most sophisticated attackers. Learn to detect. React. Neutralize.</p>
          <div className="hero-ctas">
            {status === 'authenticated' ? (
              <>
                <button className="btn-primary-vs" onClick={() => {
                  if (scenarios.length > 0) setActiveTransmission(scenarios[0]);
                }}>▶ Begin Training</button>
                <button className="btn-secondary-vs">View Threat Map</button>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <button className="btn-primary-vs">Join the Resistance</button>
                </Link>
                <Link href="/auth/login">
                  <button className="btn-secondary-vs">Secure Login</button>
                </Link>
              </>
            )}
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
      
      {/* NEURAL MODES */}
      <section className="modes-section">
        <div className="section-header">
          <div className="section-eyebrow">// Integrated Combat Systems</div>
          <div className="section-title">Tactical Operations</div>
        </div>
        
        <div className="modes-grid">
          <Link href="/duels" className="mode-card arena">
            <div className="mode-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line><line x1="3" y1="19" x2="5" y2="21"></line><line x1="3" y1="21" x2="3" y2="19"></line></svg>
            </div>
            <div className="mode-content">
              <div className="mode-badge">MULTIPLAYER ARENA</div>
              <h3 className="mode-name">Speed-Breach Duel</h3>
              <p className="mode-desc">Face off against other operatives in real-time phishing duels. Wager XP and prove your tactical superiority.</p>
              <div className="mode-action">ENTER ARENA <span className="arrow">→</span></div>
            </div>
            <div className="mode-bg-effect"></div>
          </Link>

          <Link href="/heist" className="mode-card heist">
            <div className="mode-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="mode-content">
              <div className="mode-badge">CO-OP OPERATION</div>
              <h3 className="mode-name">The Heist</h3>
              <p className="mode-desc">Coordinate with your crew to breach high-security data vaults. Every role is critical. Synchronize or fail.</p>
              <div className="mode-action">START HEIST <span className="arrow">→</span></div>
            </div>
            <div className="mode-bg-effect"></div>
          </Link>
        </div>
      </section>

      {/* SCENARIO CARDS */}
      <section className="scenarios-section" id="scenarios">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-eyebrow">// Active Training Modules</div>
            <div className="section-title">Select Your Mission</div>
          </div>
          <div className="view-toggle-vs">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Grid
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Tactical List
            </button>
          </div>
        </div>
        
        {loadingScenarios ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <LoadingSpinner message="Decrypting nodes..." />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="scenarios-grid">
            {scenarios.map(s => (
              <ScenarioCard key={s.id} scenario={s} onClick={() => setActiveTransmission(s)} />
            ))}
          </div>
        ) : (
          <div className="scenarios-table-wrap">
            <table className="scenarios-table">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>MISSION NAME</th>
                  <th>DOMAIN</th>
                  <th>DIFFICULTY</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} onClick={() => setActiveTransmission(s)}>
                    <td className="sc-id">#{s.id.split('-').pop().toUpperCase()}</td>
                    <td className="sc-title">
                      <div className="sc-title-cell">
                        <span className="sc-bullet"></span>
                        {s.title}
                      </div>
                    </td>
                    <td className="sc-domain">{s.domain}</td>
                    <td className="sc-diff">
                      <span className={`diff-tag ${s.difficulty.toLowerCase()}`}>
                        {s.difficulty}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="sc-deploy-btn">DEPLOY</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
