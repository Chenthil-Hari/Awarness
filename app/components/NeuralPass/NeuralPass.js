'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Lock, Check, Zap, Shield, Target, Palette, Award, Star, Crown, Sparkles } from 'lucide-react';
import NeuralProUpgrade from '../NeuralProUpgrade';
import { NEURAL_PASS_TIERS } from '@/app/data/neuralPass';
import './NeuralPass.css';

export default function NeuralPass() {
  const { data: session, update } = useSession();
  const [userXp, setUserXp] = useState(0);
  const [claimedTiers, setClaimedTiers] = useState([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUserXp(session.user.xp || 0);
      setClaimedTiers(session.user.claimedTiers || [1]); // Tier 1 is auto-claimed
    }
  }, [session]);

  const handleClaim = async (tier) => {
    if (claimedTiers.includes(tier.tier)) return;
    
    try {
      const res = await fetch('/api/user/neural-pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier.tier })
      });

      if (res.ok) {
        setClaimedTiers(prev => [...prev, tier.tier]);
        update(); // Refresh session
      }
    } catch (err) {
      console.error("Failed to claim reward");
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Shield': return <Shield size={24} />;
      case 'Zap': return <Zap size={24} />;
      case 'Palette': return <Palette size={24} />;
      case 'Target': return <Target size={24} />;
      case 'Crown': return <Crown size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      default: return <Star size={24} />;
    }
  };

  return (
    <div className="neural-pass-container">
      <div className="pass-header">
        <div className="pass-title-group">
          <h2 className="pass-title">NEURAL <span className="gradient-text">PASS</span></h2>
          <span className="pass-subtitle">SEASON 01: THE SILENT BREACH</span>
        </div>
        <div className="pass-stats">
          <div className="p-stat">
            <span className="p-label">CURRENT PROGRESS</span>
            <span className="p-val">{userXp} XP</span>
          </div>
          {!session?.user?.isPro && (
            <button className="upgrade-pass-btn" onClick={() => setIsUpgradeModalOpen(true)}>
              <Crown size={14} /> UPGRADE TO PRO
            </button>
          )}
          {session?.user?.isPro && (
            <div className="pro-status-badge">
              <Crown size={14} /> PRO STATUS ACTIVE
            </div>
          )}
        </div>
      </div>

      <div className="pass-track-wrapper">
        <div className="pass-track">
          {NEURAL_PASS_TIERS.map((tier, idx) => {
            const isUnlocked = userXp >= tier.requiredXp;
            const isClaimed = claimedTiers.includes(tier.tier);
            
            return (
              <motion.div 
                key={tier.tier}
                className={`pass-tier-card ${isUnlocked ? 'unlocked' : 'locked'} ${isClaimed ? 'claimed' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="tier-number">TIER {tier.tier}</div>
                <div className="tier-rewards-container">
                  <div className="tier-reward-box free">
                    <div className="reward-label">FREE</div>
                    <div className="tier-reward-icon">
                      {getIcon(tier.reward.icon)}
                      {!isUnlocked && <div className="lock-overlay"><Lock size={16} /></div>}
                    </div>
                    <span className="tier-reward-name">{tier.reward.name}</span>
                  </div>

                  <div className={`tier-reward-box premium ${session?.user?.isPro ? 'pro-unlocked' : 'pro-locked'}`}>
                    <div className="reward-label premium-label"><Crown size={8} /> PRO</div>
                    <div className="tier-reward-icon premium-icon">
                      {getIcon(tier.premiumReward.icon)}
                      {!session?.user?.isPro && <div className="lock-overlay"><Crown size={16} /></div>}
                      {session?.user?.isPro && !isUnlocked && <div className="lock-overlay"><Lock size={16} /></div>}
                    </div>
                    <span className="tier-reward-name">{tier.premiumReward.name}</span>
                  </div>
                </div>

                <div className="tier-info">
                  <span className="tier-requirement">{tier.requiredXp} XP REQUIRED</span>
                </div>
                
                {isUnlocked && !isClaimed && (
                  <button className="claim-btn" onClick={() => handleClaim(tier)}>CLAIM</button>
                )}
                {isClaimed && (
                  <div className="claimed-badge"><Check size={14} /> COLLECTED</div>
                )}
                {!isUnlocked && (
                  <div className="progress-needed">
                    <div className="progress-bar-small">
                       <div className="progress-fill-small" style={{ width: `${(userXp / tier.requiredXp) * 100}%` }} />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <NeuralProUpgrade 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </div>
  );
}
