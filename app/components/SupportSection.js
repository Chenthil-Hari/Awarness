'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Shield, Loader2, CheckCircle, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SupportSection() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!session) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, category: 'Account/Settings Support' })
      });
      if (res.ok) {
        setSent(true);
        setMessage('');
        setTimeout(() => setSent(false), 5000);
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <Mail size={18} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Guardian <span className="gradient-text">Support</span></h3>
      </div>

      {sent ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '1.5rem 0' }}
        >
          <CheckCircle size={32} color="var(--accent-success)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Ticket Received</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>An admin will review your request shortly.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Need formal assistance with your account? Send a dispatch directly to our command center.
          </p>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or request..."
            style={{
              width: '100%', height: '120px', padding: '0.8rem', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
              resize: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading || !message}
            className="btn-primary" 
            style={{ gap: '0.5rem', padding: '0.8rem', fontSize: '0.85rem', background: 'var(--accent-primary)' }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            Submit Official Ticket
          </button>
        </form>
      )}
    </div>
  );
}
