'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Send, Trash, ChevronRight, Inbox, Star, AlertCircle } from 'lucide-react';
import { INITIAL_MAILS } from '@/app/data/neuralMail';

export default function NeuralMail({ isOpen, onClose }) {
  const [mails, setMails] = useState(INITIAL_MAILS);
  const [selectedMail, setSelectedMail] = useState(null);

  const handleRead = (id) => {
    setMails(mails.map(m => m.id === id ? { ...m, isRead: true } : m));
    setSelectedMail(mails.find(m => m.id === id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ 
            width: '900px', height: '600px', background: 'rgba(10, 12, 18, 0.95)', 
            backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px', display: 'flex', overflow: 'hidden', pointerEvents: 'auto',
            boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
          }}
        >
          {/* Sidebar */}
          <div style={{ width: '240px', background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="white" />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '2px' }}>NEURAL MAIL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', border: 'none', fontSize: '0.8rem', fontWeight: 800, textAlign: 'left', cursor: 'pointer' }}>
                <Inbox size={18} /> Inbox
                <span style={{ marginLeft: 'auto', background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.6rem' }}>
                  {mails.filter(m => !m.isRead).length}
                </span>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', color: 'rgba(255,255,255,0.4)', border: 'none', fontSize: '0.8rem', fontWeight: 800, textAlign: 'left', cursor: 'pointer' }}>
                <Star size={18} /> Important
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'none', color: 'rgba(255,255,255,0.4)', border: 'none', fontSize: '0.8rem', fontWeight: 800, textAlign: 'left', cursor: 'pointer' }}>
                <Trash size={18} /> Trash
              </button>
            </div>
          </div>

          {/* List Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MESSAGES</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex' }}>
              {/* Mail List */}
              <div style={{ width: '320px', borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
                {mails.map(mail => (
                  <div 
                    key={mail.id} 
                    onClick={() => handleRead(mail.id)}
                    style={{ 
                      padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', 
                      cursor: 'pointer', position: 'relative',
                      background: selectedMail?.id === mail.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {!mail.isRead && <div style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '60%', background: 'var(--accent-primary)', borderRadius: '0 2px 2px 0' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: mail.isRead ? 'rgba(255,255,255,0.4)' : 'white' }}>{mail.from}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{mail.date}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mail.subject}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mail.content}</div>
                  </div>
                ))}
              </div>

              {/* Mail Content */}
              <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                {selectedMail ? (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedMail.subject}</h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          From: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedMail.from}</span>
                        </div>
                      </div>
                      {selectedMail.priority === 'urgent' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '1rem', fontSize: '0.6rem', fontWeight: 900 }}>
                          <AlertCircle size={12} /> URGENT
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                      {selectedMail.content}
                    </div>
                    
                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                      <button style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Send size={16} /> REPLY
                      </button>
                      <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                        ARCHIVE
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                    <Mail size={64} style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>SELECT A MESSAGE TO READ</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
