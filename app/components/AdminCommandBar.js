'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Shield, MessageSquare, Sun, Moon, Mail, Command, CornerDownLeft, Ghost, AlertCircle } from 'lucide-react';

export default function AdminCommandBar({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onToggleTheme, 
  onTestEmail,
  users = [],
  reports = [],
  currentTheme 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter commands and entities
  const commands = [
    { id: 'tab-overview', title: 'Go to Overview', icon: <Shield size={16} />, category: 'Navigation', action: () => onNavigate('overview') },
    { id: 'tab-reports', title: 'Go to Reports', icon: <MessageSquare size={16} />, category: 'Navigation', action: () => onNavigate('reports') },
    { id: 'tab-users', title: 'Go to Users', icon: <Users size={16} />, category: 'Navigation', action: () => onNavigate('users') },
    { id: 'action-theme', title: `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: currentTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />, category: 'Actions', action: onToggleTheme },
    { id: 'action-test', title: 'Test Email System', icon: <Mail size={16} />, category: 'Actions', action: onTestEmail },
  ];

  const filteredEntities = [
    ...users.map(u => ({ id: `user-${u._id}`, title: u.name, subtitle: `@${u.username}`, icon: <Users size={16} />, category: 'Citizens', action: () => onNavigate('users') })),
    ...reports.map(r => ({ id: `report-${r._id}`, title: r.guideTitle, subtitle: r.reason, icon: <AlertCircle size={16} />, category: 'Reports', action: () => onNavigate('reports') }))
  ].filter(e => e.title.toLowerCase().includes(query.toLowerCase()) || (e.subtitle && e.subtitle.toLowerCase().includes(query.toLowerCase())));

  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
  
  const allResults = [...filteredCommands, ...filteredEntities];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          allResults[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allResults]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 10000
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            style={{
              position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '600px', zIndex: 10001,
              background: currentTheme === 'dark' ? '#161618' : 'white',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: `1px solid ${currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: `1px solid ${currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
              <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '1rem' }} />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Search commands, citizens, reports..."
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  color: currentTheme === 'dark' ? 'white' : '#0f172a',
                  fontSize: '1rem', fontWeight: 500
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                ESC
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              {allResults.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No results found for "{query}"
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {allResults.map((result, index) => (
                    <div 
                      key={result.id}
                      onClick={() => { result.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: selectedIndex === index ? (currentTheme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : '#f1f5f9') : 'transparent',
                        transition: 'all 0.1s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: selectedIndex === index ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                          {result.icon}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: selectedIndex === index ? 'var(--accent-primary)' : (currentTheme === 'dark' ? 'white' : '#0f172a') }}>
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedIndex === index && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
                          ENTER <CornerDownLeft size={12} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', background: currentTheme === 'dark' ? '#1c1c1f' : '#f8fafc', borderTop: `1px solid ${currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Command size={10} /> + K to open</span>
                <span>↑↓ to navigate</span>
                <span>ENTER to select</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)' }}>OMNI-SEARCH v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
