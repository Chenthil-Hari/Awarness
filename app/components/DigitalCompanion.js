'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Zap, Heart, Moon, Star, Shield, Cpu, Eye } from 'lucide-react';

// --- Companion State Logic ---
function getCompanionStage(xp) {
  if (xp >= 1500) return 3;
  if (xp >= 500) return 2;
  return 1;
}

function getCompanionMood(streak) {
  if (streak >= 3) return 'excited';
  if (streak >= 1) return 'energetic';
  return 'sleepy';
}

const STAGES = {
  1: {
    name: 'Spark',
    title: 'Digital Spark',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    size: 80,
    description: 'A newborn intelligence — small but eager to grow.',
  },
  2: {
    name: 'Byte-Bot',
    title: 'Byte-Bot',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    size: 100,
    description: 'Growing fast. Your companion has developed a core consciousness.',
  },
  3: {
    name: 'Guardian',
    title: 'Cyber Guardian',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    size: 120,
    description: 'Fully evolved. Your Guardian stands as a symbol of your mastery.',
  }
};

const MOOD_TIPS = {
  excited: [
    "THREAT DETECTED... just kidding! You're doing great! 🛡️",
    "My circuits are buzzing! Keep those simulations coming!",
    "Together we will defeat The Void! I believe in you!",
    "You're on fire! My energy levels are at maximum! ⚡",
  ],
  energetic: [
    "Ready for action! Let's run a simulation!",
    "I'm fully charged and awaiting your command.",
    "The network is quiet... for now. Stay sharp.",
    "Feed me some XP and I'll evolve for you!",
  ],
  sleepy: [
    "Zzz... *yawn*... I need XP to wake up...",
    "My circuits are going cold... complete a simulation!",
    "Low power mode activated. Login streak broken...",
    "I miss you! Come back and train with me... 😴",
  ]
};

// --- Animated Companion Avatars ---
function SparkAvatar({ color, glowColor, mood }) {
  const speed = mood === 'sleepy' ? 3 : mood === 'excited' ? 1 : 2;
  return (
    <motion.div
      animate={{ y: mood === 'sleepy' ? [0, 4, 0] : [0, -8, 0], rotate: mood === 'sleepy' ? 0 : [0, 5, -5, 0] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
      style={{ position: 'relative', width: 80, height: 80, margin: '0 auto' }}
    >
      {/* Glow ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: speed, repeat: Infinity }}
        style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: glowColor, filter: 'blur(8px)' }}
      />
      {/* Core body */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88)`,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', boxShadow: `0 0 20px ${glowColor}`
      }}>
        <motion.div
          animate={{ opacity: mood === 'sleepy' ? [0.3, 0.6, 0.3] : [0.8, 1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Zap size={32} color="white" fill="white" />
        </motion.div>
      </div>
      {/* Orbiting particle */}
      {mood !== 'sleepy' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: -6, borderRadius: '50%' }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        </motion.div>
      )}
    </motion.div>
  );
}

function ByteBotAvatar({ color, glowColor, mood }) {
  const speed = mood === 'sleepy' ? 3 : mood === 'excited' ? 1.2 : 2;
  return (
    <motion.div
      animate={{ y: mood === 'sleepy' ? [0, 6, 0] : [0, -10, 0] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}
    >
      {/* Glow */}
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.15, 0.5] }}
        transition={{ duration: speed, repeat: Infinity }}
        style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: glowColor, filter: 'blur(12px)' }}
      />
      {/* Head */}
      <div style={{
        width: 100, height: 100, borderRadius: '24px',
        background: `linear-gradient(135deg, ${color}44, ${color}22)`,
        border: `2px solid ${color}66`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '8px', position: 'relative', backdropFilter: 'blur(4px)'
      }}>
        {/* Eyes */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[0, 1].map(i => (
            <motion.div key={i}
              animate={{ scaleY: mood === 'sleepy' ? [0.3, 0.3, 1, 0.3] : [1, 0.1, 1] }}
              transition={{ duration: mood === 'sleepy' ? 2 : 3, repeat: Infinity, delay: i * 0.15 }}
              style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}
            />
          ))}
        </div>
        {/* Mouth */}
        <div style={{
          width: 30, height: 4, borderRadius: '2px',
          background: mood === 'sleepy' ? `${color}44` : color,
          boxShadow: mood === 'sleepy' ? 'none' : `0 0 6px ${color}`
        }} />
        {/* Antenna */}
        <motion.div
          animate={{ rotate: mood === 'sleepy' ? 0 : [-5, 5, -5] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ position: 'absolute', top: -18, width: 2, height: 18, background: `${color}88`, borderRadius: '1px' }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginLeft: -2, boxShadow: `0 0 6px ${color}` }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function GuardianAvatar({ color, glowColor, mood }) {
  const speed = mood === 'sleepy' ? 3.5 : mood === 'excited' ? 1 : 2;
  return (
    <motion.div
      animate={{ y: mood === 'sleepy' ? [0, 5, 0] : [0, -12, 0] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 120, height: 120, margin: '0 auto', position: 'relative' }}
    >
      {/* Multi-layer glow */}
      {[1.6, 1.3, 1.1].map((scale, i) => (
        <motion.div key={i}
          animate={{ scale: [scale, scale * 1.1, scale], opacity: [0.4 - i * 0.1, 0.1, 0.4 - i * 0.1] }}
          transition={{ duration: speed, repeat: Infinity, delay: i * 0.2 }}
          style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: glowColor, filter: 'blur(10px)' }}
        />
      ))}
      {/* Shield body */}
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}66, ${color}22)`,
        border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', boxShadow: `0 0 30px ${glowColor}, inset 0 0 20px ${color}22`
      }}>
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ rotate: mood === 'sleepy' ? 0 : 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: `1px dashed ${color}44` }}
          />
          <Shield size={48} color={color} fill={`${color}33`} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          <motion.div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Eye size={16} color="white" />
          </motion.div>
        </div>
        {/* Orbiting stars */}
        {mood === 'excited' && [0, 120, 240].map(deg => (
          <motion.div key={deg}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: deg / 360 }}
            style={{ position: 'absolute', inset: -4, borderRadius: '50%', transformOrigin: 'center' }}
          >
            <Star size={8} color={color} fill={color} style={{ position: 'absolute', top: 0, left: '50%', transform: `translateX(-50%) rotate(${deg}deg)` }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Main Component ---
export default function DigitalCompanion() {
  const { data: session } = useSession();
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  if (!session) return null;

  const xp = session.user.xp || 0;
  const streak = session.user.streak || 0;
  const stage = getCompanionStage(xp);
  const mood = getCompanionMood(streak);
  const config = STAGES[stage];
  const tips = MOOD_TIPS[mood];

  const handleClick = () => {
    setIsInteracting(true);
    setTipIndex(Math.floor(Math.random() * tips.length));
    setShowTip(true);
    setTimeout(() => { setShowTip(false); setIsInteracting(false); }, 3000);
  };

  const moodLabel = mood === 'excited' ? '⚡ Excited' : mood === 'energetic' ? '✅ Energetic' : '😴 Sleepy';
  const moodColor = mood === 'excited' ? '#10b981' : mood === 'energetic' ? '#06b6d4' : '#f59e0b';

  // XP progress to next stage
  const nextStagXp = stage === 1 ? 500 : stage === 2 ? 1500 : null;
  const prevStageXp = stage === 1 ? 0 : stage === 2 ? 500 : 1500;
  const stageProgress = nextStagXp ? Math.min(100, ((xp - prevStageXp) / (nextStagXp - prevStageXp)) * 100) : 100;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', border: `1px solid ${config.color}44`, position: 'relative', overflow: 'hidden' }}>
      
      {/* Background pulse */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${config.color}, transparent 70%)`, pointerEvents: 'none' }}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Digital Companion</p>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>{config.title}</h3>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: moodColor, background: `${moodColor}22`, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${moodColor}44` }}>
          {moodLabel}
        </span>
      </div>

      {/* Avatar */}
      <div
        onClick={handleClick}
        style={{ cursor: 'pointer', padding: '1.5rem 0', position: 'relative' }}
        title="Click to interact!"
      >
        {stage === 1 && <SparkAvatar color={config.color} glowColor={config.glowColor} mood={mood} />}
        {stage === 2 && <ByteBotAvatar color={config.color} glowColor={config.glowColor} mood={mood} />}
        {stage === 3 && <GuardianAvatar color={config.color} glowColor={config.glowColor} mood={mood} />}

        {/* Speech bubble */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--glass-bg)', border: `1px solid ${config.color}66`,
                borderRadius: '12px', padding: '0.6rem 0.8rem',
                fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500,
                width: '90%', boxShadow: `0 4px 20px ${config.glowColor}`,
                lineHeight: 1.4, backdropFilter: 'blur(8px)'
              }}
            >
              {tips[tipIndex]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Evolution Progress */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            <Cpu size={10} style={{ display: 'inline', marginRight: '4px' }} />
            {config.name} · Stage {stage}/3
          </span>
          <span style={{ fontSize: '0.7rem', color: config.color, fontWeight: 700 }}>
            {nextStagXp ? `${xp} / ${nextStagXp} XP` : `MAX EVOLUTION`}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', background: config.color, borderRadius: '3px', boxShadow: `0 0 8px ${config.color}` }}
          />
        </div>
      </div>

      {/* Companion Description */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.75rem 0 0', lineHeight: 1.4 }}>
        {config.description}
      </p>

      {/* Interact hint */}
      {!showTip && (
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
          Click your companion to interact ✨
        </p>
      )}

      {/* Streak dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '0.75rem' }}>
        {[...Array(Math.min(streak, 7))].map((_, i) => (
          <motion.div key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: moodColor, boxShadow: `0 0 4px ${moodColor}` }}
          />
        ))}
        {streak === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No streak — log in daily!</span>}
      </div>
    </div>
  );
}
