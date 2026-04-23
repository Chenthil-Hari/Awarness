'use client';

import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, ChevronRight } from 'lucide-react';
import SettingsIcon from '../components/SettingsIcon';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  if (!session) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-primary)' }}>
        <LoadingSpinner size={180} message="Authenticating session..." />
      </div>
    );
  }

  return (
    <main className="container">
      <Navbar score={1200} level={4} />
      
      <div className="flex-center" style={{ marginTop: '2rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: 'var(--bg-tertiary)', 
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--glass-border)',
              overflow: 'hidden'
            }}>
              <SettingsIcon size={48} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform <span className="gradient-text">Settings</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Personalize your experience</p>
          </div>

          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Monitor size={18} color="var(--accent-secondary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Appearance</h3>
            </div>
            
            <div className="flex-mobile-column" style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => theme === 'dark' && toggleTheme()}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${theme === 'light' ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  background: theme === 'light' ? 'rgba(124, 58, 237, 0.05)' : 'var(--bg-tertiary)',
                  color: theme === 'light' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: theme === 'light' ? 'var(--accent-primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme === 'light' ? 'white' : 'inherit',
                  border: theme === 'light' ? 'none' : '1px solid var(--glass-border)'
                }}>
                  <Sun size={18} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Light Mode</span>
              </button>

              <button 
                onClick={() => theme === 'light' && toggleTheme()}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${theme === 'dark' ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  background: theme === 'dark' ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-tertiary)',
                  color: theme === 'dark' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: theme === 'dark' ? 'var(--accent-primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme === 'dark' ? 'white' : 'inherit',
                  border: theme === 'dark' ? 'none' : '1px solid var(--glass-border)'
                }}>
                  <Moon size={18} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Dark Mode</span>
              </button>
            </div>
          </section>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <Link href="/profile" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Back to Profile Identity</span>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
