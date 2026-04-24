'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Shield, Loader2, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SupportWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!session || session.user.role === 'admin') return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, category: 'General Help' })
      });
      if (res.ok) {
        setSent(true);
        setMessage('');
        setTimeout(() => {
          setSent(false);
          setIsOpen(false);
        }, 3000);
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9998 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass"
            style={{
              width: '320px', padding: '1.5rem', borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginBottom: '1rem',
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Guardian <span className="gradient-text">Chat</span></h3>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={40} color="var(--accent-success)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Message Sent!</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>An expert will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSend}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Have a question about a simulation or need help with your account?
                </p>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  style={{
                    width: '100%', height: '100px', padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    borderRadius: '12px', color: 'white', fontSize: '0.85rem', outline: 'none',
                    resize: 'none', marginBottom: '1rem'
                  }}
                />
                <button 
                  type="submit"
                  disabled={loading || !message}
                  className="btn-primary" 
                  style={{ width: '100%', gap: '0.5rem', padding: '0.75rem' }}
                >
                  {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--accent-primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)',
          border: 'none', cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
