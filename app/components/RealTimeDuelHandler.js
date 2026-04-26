'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Check, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';

export default function RealTimeDuelHandler() {
  const { data: session } = useSession();
  const [invitation, setInvitation] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth', // We need this for private channels
    });

    const channelName = `private-user-${session.user.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('incoming-duel', (data) => {
      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {}); // Browser might block audio without interaction
      } catch (e) {}
      
      setInvitation(data);
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [session]);

  const handleAccept = () => {
    if (!invitation) return;
    const roomUrl = `/duels?room=${invitation.roomCode}`;
    setInvitation(null);
    router.push(roomUrl);
  };

  const handleDecline = () => {
    setInvitation(null);
  };

  return (
    <AnimatePresence>
      {invitation && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'calc(100% - 2rem)',
            maxWidth: '450px',
          }}
        >
          <div style={{
            background: 'rgba(15, 15, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '15px',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                position: 'relative'
              }}>
                <Swords size={28} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '15px',
                    background: 'var(--accent-primary)'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Incoming Challenge
                </p>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0.2rem 0', color: 'white' }}>
                  {invitation.challengerName}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '8px', color: '#ef4444' }}>
                <Bell size={14} className="animate-pulse" />
                <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>LIVE</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              You have been challenged to a 1v1 "Speed-Breach" Duel. Accept to defend your ranking!
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDecline}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <X size={18} /> Decline
              </button>
              <button
                onClick={handleAccept}
                style={{
                  flex: 1.5,
                  padding: '1rem',
                  borderRadius: '14px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                }}
              >
                <Check size={18} /> Accept Duel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
