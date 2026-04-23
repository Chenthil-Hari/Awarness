'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldAlert, Trash2, Send, Inbox, Star, AlertCircle, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../context/ThemeContext';
import { simulatedEmails } from '../data/emails';
import DrillLottie from './DrillLottie';

export default function InboxClient() {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [emails, setEmails] = useState(simulatedEmails.map(e => ({ ...e, read: false, acted: false })));
  const [selectedId, setSelectedId] = useState(simulatedEmails[0].id);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const selectedEmail = emails.find(e => e.id === selectedId);

  // Mark as read when selected
  useEffect(() => {
    if (selectedId) {
      setEmails(prev => prev.map(e => 
        e.id === selectedId && !e.read ? { ...e, read: true } : e
      ));
    }
  }, [selectedId]);

  const handleContentClick = (e) => {
    // Intercept link clicks in the email body
    if (e.target.tagName === 'A') {
      e.preventDefault();
      if (selectedEmail.acted) return;
      
      // Clicking a link in a phishing email is a failure
      if (selectedEmail.type.includes('Phishing')) {
        handleAction('ClickLink'); // Specialized failure action
      }
    }
  };

  const handleAction = async (action) => {
    if (selectedEmail.acted) return;

    // Logic: 
    // - If action is 'Report' and it was phishing: Correct
    // - If action is 'Delete' and it was phishing: Correct
    // - If action is 'Reply' and it was legitimate: Correct
    // - If action is 'ClickLink': Always Wrong (for phishing)
    
    let isCorrect = false;
    if (action === 'ClickLink') {
      isCorrect = false;
    } else {
      isCorrect = action === selectedEmail.correctAction || 
                 (action === 'Delete' && selectedEmail.type.includes('Phishing'));
    }

    const pointsAwarded = isCorrect ? selectedEmail.points : -100;
    
    setScore(prev => prev + pointsAwarded);
    setFeedback({
      correct: isCorrect,
      message: action === 'ClickLink' 
        ? "❌ CRITICAL ERROR: You clicked a link in a phishing email. This could have installed malware or stolen your credentials."
        : selectedEmail.feedback,
      points: pointsAwarded
    });

    setEmails(prev => prev.map(e => 
      e.id === selectedId ? { ...e, acted: true, read: true } : e
    ));

    if (session && isCorrect) {
      try {
        await fetch('/api/user/complete-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpToAdd: pointsAwarded }),
        });
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr', 
      height: '80vh',
      background: isDark ? 'rgba(5, 7, 10, 0.4)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: 'var(--radius-xl)',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      overflow: 'hidden',
      boxShadow: isDark ? 'none' : '0 10px 40px rgba(0,0,0,0.05)'
    }}>
      {/* Sidebar */}
      <div style={{ 
        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', 
        padding: '1.5rem',
        borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: isDark ? 'white' : 'var(--text-primary)' }}>Live <span className="gradient-text">Drills</span></h2>
          <div style={{ 
            fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-secondary)',
            background: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)', 
            padding: '0.4rem 0.8rem', borderRadius: '8px'
          }}>
            Score: {score} XP
          </div>
        </div>

        <div className="flex-col" style={{ gap: '0.5rem' }}>
          <SidebarItem icon={<Inbox size={18}/>} label="Inbox" active count={emails.filter(e => !e.read).length} isDark={isDark} />
          <SidebarItem icon={<ShieldAlert size={18}/>} label="Security" isDark={isDark} />
          <SidebarItem icon={<Trash2 size={18}/>} label="Trash" isDark={isDark} />
        </div>
      </div>

      {/* Main Content: List + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr' }}>
        {/* Email List */}
        <div style={{ 
          borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`, 
          overflowY: 'auto', 
          background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' 
        }}>
          <div style={{ padding: '1.25rem', borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)'}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: isDark ? 'white' : 'black' }} />
              <input 
                type="text" 
                placeholder="Search drills..." 
                style={{ 
                  width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', 
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', 
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                  borderRadius: '10px', color: isDark ? 'white' : 'black', fontSize: '0.85rem' 
                }} 
              />
            </div>
          </div>
          {emails.map(email => (
            <EmailListItem 
              key={email.id} 
              email={email} 
              active={selectedId === email.id}
              onClick={() => setSelectedId(email.id)}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Email Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}>
          {selectedEmail ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Toolbar */}
              <div style={{ 
                padding: '1rem 1.5rem', 
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex',
                gap: '0.75rem'
              }}>
                <ActionButton icon={<ShieldAlert size={18}/>} label="Report Phishing" color="#ef4444" onClick={() => handleAction('Report')} disabled={selectedEmail.acted} isDark={isDark} />
                <ActionButton icon={<Trash2 size={18}/>} label="Delete" color={isDark ? "#94a3b8" : "#64748b"} onClick={() => handleAction('Delete')} disabled={selectedEmail.acted} isDark={isDark} />
                <ActionButton icon={<Send size={18}/>} label="Reply" color="#7c3aed" onClick={() => handleAction('Reply')} disabled={selectedEmail.acted} isDark={isDark} />
              </div>

              {/* Content Area */}
              <div 
                onClick={handleContentClick}
                style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}
              >
                <div style={{ marginBottom: '2.5rem' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.5px', color: isDark ? 'white' : '#1e293b' }}>{selectedEmail.subject}</h1>
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                    <div style={{ 
                      width: '45px', height: '45px', borderRadius: '12px', 
                      background: 'var(--accent-primary)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                      fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                      color: 'white'
                    }}>
                      {selectedEmail.sender[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: isDark ? 'white' : '#334155' }}>{selectedEmail.sender}</div>
                      <div style={{ fontSize: '0.85rem', color: isDark ? 'var(--text-secondary)' : '#64748b', opacity: 0.8 }}>&lt;{selectedEmail.senderEmail}&gt;</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: isDark ? 'var(--text-secondary)' : '#94a3b8', fontWeight: 500 }}>{selectedEmail.timestamp}</div>
                  </div>
                </div>

                <div 
                  className="email-body"
                  style={{ color: isDark ? 'var(--text-secondary)' : '#475569', lineHeight: 1.7, fontSize: '1.05rem' }}
                  dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                />
              </div>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    style={{ 
                      margin: '1rem',
                      padding: '1.5rem',
                      background: feedback.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '15px',
                      border: `1px solid ${feedback.correct ? '#10b981' : '#ef4444'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    {feedback.correct ? <CheckCircle2 color="#22c55e" size={32} /> : <AlertCircle color="#ef4444" size={32} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: feedback.correct ? '#22c55e' : '#ef4444', marginBottom: '0.25rem' }}>
                        {feedback.correct ? 'Good Identification!' : 'Security Warning'}
                      </div>
                      <div style={{ fontSize: '0.9rem' }}>{feedback.message}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{feedback.points > 0 ? `+${feedback.points}` : feedback.points} XP</div>
                      <button 
                        onClick={() => setFeedback(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '2rem', padding: '2rem', textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <DrillLottie width={280} height={280} />
              </motion.div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: isDark ? 'white' : '#1e293b' }}>
                  Ready for your <span className="gradient-text">Live Drills</span>?
                </h3>
                <p style={{ color: isDark ? 'var(--text-secondary)' : '#64748b', maxWidth: '300px', margin: '0 auto', fontSize: '0.95rem' }}>
                  Select an email from the list to begin your security assessment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, count, isDark }) {
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '0.75rem', 
      padding: '0.75rem 1rem', borderRadius: '10px',
      background: active ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
      color: active ? 'var(--accent-primary)' : (isDark ? 'var(--text-secondary)' : '#64748b'),
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}>
      {icon}
      <span style={{ fontWeight: active ? 700 : 500, flex: 1 }}>{label}</span>
      {count > 0 && <span style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>}
    </div>
  );
}

function EmailListItem({ email, active, onClick, isDark }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '1.25rem', 
        borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
        background: active ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)') : 'transparent',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--accent-primary)' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: email.read ? 600 : 800, fontSize: '0.95rem', color: isDark ? 'white' : '#1e293b' }}>{email.sender}</span>
        <span style={{ fontSize: '0.75rem', color: isDark ? 'var(--text-secondary)' : '#94a3b8' }}>{email.timestamp}</span>
      </div>
      <div style={{ 
        fontWeight: email.read ? 500 : 700, 
        fontSize: '0.85rem', 
        marginBottom: '0.5rem', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis',
        color: isDark ? 'rgba(255,255,255,0.8)' : '#475569'
      }}>
        {email.subject}
      </div>
      <div style={{ 
        fontSize: '0.8rem', 
        color: isDark ? 'var(--text-secondary)' : '#64748b', 
        display: '-webkit-box', 
        WebkitLineClamp: 1, 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden' 
      }}>
        {email.content.replace(/<[^>]*>/g, '')}
      </div>
      {!email.read && <div style={{ position: 'absolute', right: '1rem', top: '50%', width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%' }} />}
    </div>
  );
}

function ActionButton({ icon, label, color, onClick, disabled, isDark }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.6rem', 
        padding: '0.6rem 1.2rem', borderRadius: '10px',
        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'white', 
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        color: disabled ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isDark ? 'white' : '#334155'), 
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)')}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.03)' : 'white')}
    >
      <span style={{ color: disabled ? 'inherit' : color }}>{icon}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</span>
    </button>
  );
}
