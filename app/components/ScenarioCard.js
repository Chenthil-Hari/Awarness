'use client';

import { ShieldAlert, Wallet, Heart, Zap, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import BorderGlow from './BorderGlow/BorderGlow';
import '../vault-shield.css';

const iconMap = {
  ShieldAlert: <ShieldAlert size={24} />,
  Wallet: <Wallet size={24} />,
  Heart: <Heart size={24} />,
  Zap: <Zap size={24} />
};

export default function ScenarioCard({ scenario, onClick }) {
  const dots = Array.from({length:5}, (_,d) => (
    <div key={d} className={`diff-dot ${d < (scenario.difficulty === 'Beginner' ? 1 : scenario.difficulty === 'Intermediate' ? 3 : 5) ? 'on' : ''}`}></div>
  ));

  return (
    <div className="scenario-card-vs" onClick={onClick}>
      <div className="card-threat">{scenario.domain || 'Threat Intelligence'}</div>
      <div className="card-title">{scenario.title}</div>
      <div className="card-desc">{scenario.description}</div>
      
      <div className="card-meta">
        <div>
          <div style={{ fontSize: '.48rem', letterSpacing: '.15em', marginBottom: '5px', color: 'rgba(200,216,232,.3)', textTransform: 'uppercase' }}>Difficulty</div>
          <div className="card-difficulty">{dots}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.48rem', letterSpacing: '.15em', marginBottom: '5px', color: 'rgba(200,216,232,.3)', textTransform: 'uppercase' }}>Duration</div>
          <div style={{ color: 'var(--amber)', fontSize: '.62rem' }}>{scenario.duration || '12 MIN'}</div>
        </div>
        <button className="launch-btn">
          <div className="launch-icon">▶</div>
          Launch
        </button>
      </div>
    </div>
  );
}
