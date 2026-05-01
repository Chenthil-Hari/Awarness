'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Zap, Shield, Sparkles, Check, Lock, Star, Palette, Ghost, Heart } from 'lucide-react';
import BorderGlow from '../components/BorderGlow/BorderGlow';

const SHOP_ITEMS = [
  {
    id: 'item_extinguisher',
    name: 'Class-K Extinguisher',
    description: 'Essential gear for the "Kitchen Crisis". Prevents critical failure in grease fire scenarios.',
    price: 450,
    category: 'Tactical',
    icon: <Shield size={24} />,
    color: '#f43f5e'
  },
  {
    id: 'item_yubikey',
    name: 'Hardware Security Key',
    description: 'Neural-link protection. Automatically detects 100% of basic phishing links in Live Drills.',
    price: 800,
    category: 'Cyber-Gear',
    icon: <Lock size={24} />,
    color: '#22d3ee'
  },
  {
    id: 'item_first_aid',
    name: 'Tactical Med-Kit',
    description: 'Includes trauma supplies for "Emergency Response" scenarios. Increases success probability.',
    price: 500,
    category: 'Life-Skills',
    icon: <Heart size={24} />,
    color: '#10b981'
  },
  {
    id: 'item_privacy_filter',
    name: 'Neural Privacy Screen',
    description: 'Reduces the visibility of "Social Engineering" threats by 40% during surveillance missions.',
    price: 600,
    category: 'Tactical',
    icon: <Ghost size={24} />,
    color: '#94a3b8'
  },
  {
    id: 'theme_hacker',
    name: 'Terminal Zero Theme',
    description: 'A full-system overhaul with a high-fidelity "Black & Green" matrix aesthetic.',
    price: 2000,
    category: 'Interface',
    icon: <Palette size={24} />,
    color: '#10b981'
  },
  {
    id: 'xp_boost_elite',
    name: 'Neural Optimizer (24h)',
    description: 'Advanced data processing. Grants a 2.5x XP multiplier for all successfully neutralized threats.',
    price: 1500,
    category: 'Neural',
    icon: <Zap size={24} />,
    color: '#fbbf24'
  }
];

export default function ShopPage() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (session?.user?.inventory) {
      setInventory(session.user.inventory);
    }
  }, [session]);

  const handlePurchase = async (item) => {
    if (session.user.xp < item.price) return;
    
    setLoading(item.id);
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          price: item.price,
          itemName: item.name
        })
      });

      if (res.ok) {
        setPurchaseStatus({ id: item.id, message: 'SUCCESSFULLY ACQUIRED' });
        setInventory(prev => [...prev, item.id]);
        update(); // Refresh session to reflect XP change
        setTimeout(() => setPurchaseStatus(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Transaction failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <LoadingSpinner message="Accessing Vault..." />;

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ShoppingBag size={24} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '3px' }}>NEURAL MARKET</span>
            </div>
            <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem' }}>XP <span className="gradient-text">VAULT</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Exchange your neutralized threat data (XP) for high-tier cosmetic enhancements and operational boosts.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '1rem', 
              background: 'var(--bg-tertiary)', 
              padding: '1rem 2rem', 
              borderRadius: 'var(--radius-full)', 
              marginTop: '2.5rem',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)'
            }}
          >
            <Zap size={20} color="var(--accent-warning)" />
            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{session?.user?.xp || 0} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>XP AVAILABLE</span></span>
          </motion.div>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
          gap: '2rem' 
        }}>
          {SHOP_ITEMS.map((item, idx) => {
            const isOwned = inventory.includes(item.id);
            const canAfford = session.user.xp >= item.price;
            const isPurchasing = loading === item.id;
            const isJustBought = purchaseStatus?.id === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <BorderGlow 
                  glowColor={item.color.replace('#', '')} 
                  animated={!isOwned} 
                  borderRadius={24}
                >
                  <div style={{ 
                    padding: '2rem', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'var(--bg-secondary)',
                    opacity: isOwned ? 0.8 : 1
                  }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      background: `${item.color}20`, 
                      borderRadius: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: item.color,
                      marginBottom: '1.5rem',
                      border: `1px solid ${item.color}40`
                    }}>
                      {item.icon}
                    </div>
                    
                    <div style={{ marginBottom: 'auto' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.category}</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0 0.75rem' }}>{item.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>{item.description}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={14} color="var(--accent-warning)" />
                        <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{item.price}</span>
                      </div>
                      
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={isOwned || !canAfford || isPurchasing}
                        className={isOwned ? "btn-secondary" : "btn-primary"}
                        style={{ 
                          padding: '0.6rem 1.2rem', 
                          fontSize: '0.8rem', 
                          fontWeight: 800,
                          background: isOwned ? 'rgba(16, 185, 129, 0.1)' : undefined,
                          borderColor: isOwned ? 'var(--accent-success)' : undefined,
                          color: isOwned ? 'var(--accent-success)' : undefined,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isOwned ? (
                          <><Check size={14} /> OWNED</>
                        ) : isPurchasing ? (
                          'PROCESSING...'
                        ) : !canAfford ? (
                          <><Lock size={14} /> INSUFFICIENT XP</>
                        ) : (
                          'ACQUIRE'
                        )}
                      </button>
                    </div>

                    {isJustBought && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                          position: 'absolute', 
                          inset: 0, 
                          background: 'rgba(0,0,0,0.8)', 
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          borderRadius: '24px'
                        }}
                      >
                        <Sparkles size={40} color="var(--accent-warning)" style={{ marginBottom: '1rem' }} />
                        <span style={{ fontWeight: 900, color: 'white', letterSpacing: '1px' }}>SUCCESSFULLY ACQUIRED</span>
                      </motion.div>
                    )}
                  </div>
                </BorderGlow>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
