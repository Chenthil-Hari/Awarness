'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Trophy, Shield, Sword } from 'lucide-react';
import './IntelTicker.css';

const TICKER_EVENTS = [
  { type: 'mission', icon: <Shield size={12} />, text: 'Operative {name} completed "Phishing Defense" (+50 XP)' },
  { type: 'level', icon: <Zap size={12} />, text: '{name} reached Level {level} — Neural Enhancement unlocked' },
  { type: 'streak', icon: <Activity size={12} />, text: '{name} is on a {streak}-day streak — Unstoppable!' },
  { type: 'heist', icon: <Trophy size={12} />, text: '{name} breached "The Vault" — Operation success' },
  { type: 'duel', icon: <Sword size={12} />, text: '{name} won a duel against {opponent} (+200 XP)' },
  { type: 'league', icon: <Trophy size={12} />, text: '{name} promoted to {league} League — New tier unlocked' },
];

const NAMES = ['Sentinel_X', 'CyberWraith', 'DataPhantom', 'NetRunner', 'Voidwalker', 'ShadowOps', 'NeuralKnight', 'ByteHunter', 'ZeroDay', 'CryptoMask'];
const LEAGUES = ['Silver', 'Gold', 'Cyber', 'Hacker-Tier'];

function generateEvent() {
  const template = TICKER_EVENTS[Math.floor(Math.random() * TICKER_EVENTS.length)];
  let text = template.text
    .replace('{name}', NAMES[Math.floor(Math.random() * NAMES.length)])
    .replace('{opponent}', NAMES[Math.floor(Math.random() * NAMES.length)])
    .replace('{level}', Math.floor(Math.random() * 20) + 5)
    .replace('{streak}', Math.floor(Math.random() * 30) + 3)
    .replace('{league}', LEAGUES[Math.floor(Math.random() * LEAGUES.length)]);
  
  return {
    id: Date.now() + Math.random(),
    type: template.type,
    icon: template.icon,
    text,
  };
}

export default function IntelTicker() {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Generate initial events
    const initial = Array.from({ length: 10 }, () => generateEvent());
    setEvents(initial);
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= events.length) {
          // Add more events
          setEvents(old => [...old, ...Array.from({ length: 5 }, () => generateEvent())]);
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const current = events[currentIndex % events.length];
  if (!current) return null;

  return (
    <div className="intel-ticker">
      <div className="ticker-label">
        <div className="ticker-dot" />
        LIVE
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="ticker-event"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <span className="ticker-icon">{current.icon}</span>
          <span className="ticker-text">{current.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
