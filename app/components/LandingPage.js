'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, ArrowRight, CheckCircle2, Play, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BorderGlow from './BorderGlow/BorderGlow';
import TextPressure from './TextPressure/TextPressure';
// import ThreeBackground from './ThreeBackground';

const features = [
  {
    icon: <Shield className="text-purple-500" />,
    title: 'Cybersecurity Drills',
    description: 'Face realistic phishing, social engineering, and network breach scenarios in a safe environment.',
    color: 'var(--accent-primary)'
  },
  {
    icon: <TrendingUp className="text-cyan-500" />,
    title: 'Financial Wisdom',
    description: 'Master budgeting, investment risks, and debt management through interactive market simulations.',
    color: 'var(--accent-secondary)'
  },
  {
    icon: <Users className="text-emerald-500" />,
    title: 'Life Skills',
    description: 'Develop critical thinking and emotional intelligence for complex real-world social situations.',
    color: 'var(--accent-success)'
  }
];

const stats = [
  { label: 'Active Learners', value: '50K+' },
  { label: 'Simulations', value: '200+' },
  { label: 'Success Rate', value: '98%' },
  { label: 'Countries', value: '120+' }
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      {/* 3D Dashboard Background - Temporarily disabled for diagnosis */}
      {/* <ThreeBackground mode="dashboard" scrollProgress={scrollProgress} /> */}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <section style={{ 
          padding: '8rem 0 6rem', 
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="container" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '4rem', 
            alignItems: 'center' 
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-full)', 
                background: 'rgba(124, 58, 237, 0.2)', 
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <Zap size={14} />
                <span>COMMAND CENTER ACTIVE</span>
              </div>
              
              <div style={{ position: 'relative', height: '100px', width: '100%', marginBottom: '0.5rem', marginLeft: '-5px' }}>
                <TextPressure
                  text="MASTER THE UNSEEN"
                  flex={true}
                  alpha={false}
                  stroke={false}
                  width={true}
                  weight={true}
                  italic={true}
                  textColor="white"
                  minFontSize={64}
                />
              </div>
              <h1 style={{ 
                fontSize: '4.5rem', 
                fontWeight: 900, 
                lineHeight: 1, 
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                <span style={{ color: 'var(--accent-primary)' }}>Real-World</span> Skills
              </h1>
              
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255,255,255,0.7)', 
                marginBottom: '2.5rem',
                maxWidth: '540px',
                lineHeight: 1.6
              }}>
                Enter the Command Center. Master cybersecurity, financial literacy, and essential life skills through immersive 3D simulations.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/auth/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Initialize Training <ArrowRight size={20} />
                </Link>
                <button className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', color: 'white', borderColor: 'white' }}>
                  View Network <Play size={20} fill="currentColor" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features / Nodes Breakdown */}
        <section style={{ padding: '10rem 0', minHeight: '100vh' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div /> {/* Spacer for 3D node */}
              <motion.div 
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 50 }}
                className="glass-card" 
                style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div style={{ width: '60px', height: '60px', background: '#ef4444', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
                  <Zap size={32} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white' }}>Survival: The Gauntlet</h2>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  Face the ultimate elimination challenge. 100 players enter a digital arena where only the most aware survive. High-speed decision making and real-time threat detection are your only weapons.
                </p>
                <Link href="/survival" className="btn-primary" style={{ background: '#ef4444', border: 'none' }}>Enter Arena</Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section style={{ padding: '10rem 0', minHeight: '100vh' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <motion.div 
                whileInView={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: -50 }}
                className="glass-card" 
                style={{ padding: '3rem', borderRadius: '32px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div style={{ width: '60px', height: '60px', background: '#06b6d4', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}>
                  <Shield size={32} />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white' }}>The Heist: Co-op Ops</h2>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  Coordinate with specialists across the globe to breach the Vault. Every role matters. Infiltrate systems, bypass biometric locks, and vanish before the trace begins.
                </p>
                <Link href="/heist" className="btn-primary" style={{ background: '#06b6d4', border: 'none' }}>Start Operation</Link>
              </motion.div>
              <div /> {/* Spacer for 3D node */}
            </div>
          </div>
        </section>

        <section style={{ padding: '10rem 0', minHeight: '100vh' }}>
          <div className="container">
            <div style={{ textAlign: 'center' }}>
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                className="glass-card" 
                style={{ padding: '5rem 3rem', borderRadius: '40px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)', border: '1px solid var(--accent-primary)', maxWidth: '900px', margin: '0 auto' }}
              >
                <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white' }}>Ready to Breach?</h2>
                <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem' }}>
                  The network is open. Your awareness is your only defense.
                </p>
                <Link href="/auth/login" className="btn-primary" style={{ padding: '1.2rem 4rem', fontSize: '1.2rem' }}>
                  Connect Now
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="white" />
                </div>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>Awareness <span style={{ color: 'var(--accent-primary)' }}>Pro</span></h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>© 2026 Awareness Pro. All rights reserved.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'white' }}>Platform</h4>
                <ul style={{ listStyle: 'none', padding: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>Simulations</li>
                  <li>Leaderboard</li>
                  <li>Wiki Hub</li>
                </ul>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'white' }}>Company</h4>
                <ul style={{ listStyle: 'none', padding: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
