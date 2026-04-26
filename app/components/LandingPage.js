'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, ArrowRight, CheckCircle2, Play, Zap, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import BorderGlow from './BorderGlow/BorderGlow';

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
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '8rem 0 6rem', 
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="hero-gradient-bg" />
        
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
              background: 'rgba(124, 58, 237, 0.1)', 
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1px solid rgba(124, 58, 237, 0.2)'
            }}>
              <Zap size={14} />
              <span>THE FUTURE OF LEARNING IS HERE</span>
            </div>
            
            <h1 style={{ 
              fontSize: '4.5rem', 
              fontWeight: 900, 
              lineHeight: 1, 
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              Master the Unseen <br />
              <span className="gradient-text">Real-World Skills</span>
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '2.5rem',
              maxWidth: '540px',
              lineHeight: 1.6
            }}>
              Awareness Pro is the world's most advanced simulation platform for mastering 
              cybersecurity, financial literacy, and essential life skills through immersive, 
              risk-free scenarios.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/auth/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Start Training Now <ArrowRight size={20} />
              </Link>
              <button className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Watch Demo <Play size={20} fill="currentColor" />
              </button>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-tertiary)', 
                    border: '3px solid var(--bg-primary)',
                    marginLeft: '-12px',
                    overflow: 'hidden'
                  }}>
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>1,200+</span> experts joined this week
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="animate-float"
            style={{ position: 'relative' }}
          >
            <div style={{ 
              position: 'relative', 
              zIndex: 2,
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)'
            }}>
              <Image 
                src="/images/hero-illustration.png" 
                alt="Awareness Pro Simulations" 
                width={700} 
                height={700}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </div>
            
            {/* Floating Achievement Card */}
            <motion.div 
              initial={{ x: 20, y: 20 }}
              animate={{ x: 0, y: 0 }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 }}
              style={{ 
                position: 'absolute',
                bottom: '10%',
                left: '-10%',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-primary)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                zIndex: 3,
                border: '1px solid var(--glass-border)'
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'var(--accent-success)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Award size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, margin: 0 }}>LATEST BADGE</p>
                <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Security Guardian</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Why Choose <span className="gradient-text">Awareness Pro?</span></h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              We combine cognitive science with cutting-edge simulation technology to create 
              the most effective learning experience.
            </p>
          </div>
          
          <div className="feature-grid">
            {features.map((feature, i) => (
              <BorderGlow
                key={i}
                edgeSensitivity={30}
                glowColor="40 80 80"
                backgroundColor="var(--bg-primary)"
                borderRadius={32}
                glowRadius={40}
                glowIntensity={1.0}
                coneSpread={25}
                animated={true}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
              >
                <div style={{ padding: '3rem 2rem', height: '100%' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '16px', 
                    background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '2rem'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {feature.description}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {['Interactive Scenarios', 'Real-time Feedback', 'Progress Tracking'].map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem' 
          }}>
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-number gradient-text">{stat.value}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <motion.div 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            className="glass-card" 
            style={{ 
              padding: '5rem 2rem', 
              textAlign: 'center', 
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.5 }}>
              <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '40%', height: '80%', background: 'var(--accent-primary)', filter: 'blur(120px)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40%', height: '80%', background: 'var(--accent-secondary)', filter: 'blur(120px)', borderRadius: '50%' }} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: 900 }}>Ready to Elevate Your Awareness?</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Join thousands of learners who are already mastering the skills needed to thrive in the modern world.
              </p>
              <Link href="/auth/login" className="btn-primary animate-pulse-glow" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>
                Get Started for Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="white" />
              </div>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Awareness <span className="gradient-text">Pro</span></h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>© 2026 Awareness Pro. All rights reserved.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '3rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Simulations</li>
                <li>Leaderboard</li>
                <li>Wiki Hub</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
