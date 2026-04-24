'use client';

import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { campaignMissions } from '../data/campaign';

export default function CampaignTracker({ onSelectScenario }) {
  const { data: session } = useSession();
  
  if (!session) return null;

  const completedMissions = session.user.completedMissions || [];

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.6rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>The Campaign: <span className="gradient-text">Global Defense Initiative</span></h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Hunt down "The Void" in this story-driven progression mode.</p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {campaignMissions.map((mission, index) => {
          // Mission 1 is always unlocked. Others unlock if previous is completed.
          const isUnlocked = index === 0 || completedMissions.includes(campaignMissions[index - 1].id);
          const isCompleted = completedMissions.includes(mission.id);

          return (
            <motion.div
              key={mission.id}
              whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: isCompleted ? '1px solid var(--accent-success)' : (isUnlocked ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)'),
                background: isUnlocked ? 'var(--glass-bg)' : 'rgba(255,255,255,0.02)',
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: isUnlocked ? 'pointer' : 'not-allowed'
              }}
              onClick={() => isUnlocked && onSelectScenario(mission)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCompleted ? 'var(--accent-success)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {isCompleted ? 'COMPLETED' : `MISSION ${index + 1}`}
                </span>
                {isCompleted ? <CheckCircle2 size={20} color="var(--accent-success)" /> : (!isUnlocked ? <Lock size={20} color="var(--text-muted)" /> : <Play size={20} color="var(--accent-primary)" />)}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{mission.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>{mission.description}</p>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  {mission.difficulty}
                </span>
                {isUnlocked && !isCompleted && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Deploy <Play size={14} />
                  </span>
                )}
              </div>

              {/* Progress Line connecting cards visually could be added here in future */}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
