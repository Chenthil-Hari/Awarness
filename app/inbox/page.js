'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import InboxClient from '../components/InboxClient';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InboxPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <main className="container">
      <Navbar />
      
      <div style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '3rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              Live <span className="gradient-text">Drills</span> 📩
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Test your threat detection skills in real-time. Can you spot the phish?
            </p>
          </motion.div>
        </div>

        {/* Main Inbox UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {session ? (
            <InboxClient />
          ) : (
            <div className="glass-card flex-center" style={{ padding: '5rem', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '3rem' }}>🔒</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Login Required</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                You need to be logged in to participate in Live Drills and earn XP.
              </p>
              <a href="/api/auth/signin" className="btn-primary">Sign In to Start</a>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
