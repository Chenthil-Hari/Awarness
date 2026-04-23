'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import InboxClient from '../components/InboxClient';
import LoadingSpinner from '../components/LoadingSpinner';
import DrillLottie from '../components/DrillLottie';
import { calculateLevel } from '../lib/game';

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (session?.user?.xp !== undefined) {
      setTotalXp(session.user.xp);
    }
  }, [session]);

  const level = calculateLevel(totalXp);

  const handleXpUpdate = (newXp) => {
    setTotalXp(newXp);
  };

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <main className="container">
      <Navbar score={totalXp} level={level} />
      
      <div style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '3rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                Live <span className="gradient-text">Drills</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Test your threat detection skills in real-time. Can you spot the phish?
              </p>
            </div>
            <div style={{ transform: 'translateY(-5px)' }}>
              <DrillLottie width={120} height={120} />
            </div>
          </motion.div>
        </div>

        {/* Main Inbox UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {session ? (
            <InboxClient onProgressUpdate={handleXpUpdate} initialXp={totalXp} />
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
