'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Plus, Search, BookOpen, Send, X, MessageSquare, ShieldCheck } from 'lucide-react';

export default function WikiPage() {
  const { data: session } = useSession();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [domain, setDomain] = useState('Cybersecurity');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      setGuides(data);
    } catch (error) {
      console.error('Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (guideId) => {
    if (!session) return;

    try {
      const res = await fetch('/api/guides/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      
      if (res.ok) {
        fetchGuides(); // Refresh list to update votes
      }
    } catch (error) {
      console.error('Failed to vote');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, domain }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setShowForm(false);
        fetchGuides();
      }
    } catch (error) {
      console.error('Failed to submit guide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="container">
      <Navbar />
      
      <div style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex-center" style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '15px', 
                background: 'var(--accent-primary)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)'
              }}>
                <BookOpen size={32} />
              </div>
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Learning <span className="gradient-text">Hub</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Master the simulations with community-contributed strategies and survival guides.
            </p>
          </motion.div>
        </div>

        {/* Action Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '1.5rem', 
          marginBottom: '3rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search strategies or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3.5rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            onClick={() => session ? setShowForm(true) : window.location.href='/auth/login'}
            className="btn-primary" 
            style={{ padding: '1rem 2rem' }}
          >
            <Plus size={20} /> Share Strategy
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div style={{ padding: '4rem' }}>
            <LoadingSpinner size={100} message="Syncing with the hive mind..." />
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
            gap: '2rem' 
          }}>
            {filteredGuides.map((guide, idx) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card"
                style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    color: 'var(--accent-secondary)', 
                    background: 'rgba(6, 182, 212, 0.1)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase'
                  }}>
                    {guide.domain}
                  </span>
                  <button 
                    onClick={() => handleVote(guide._id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: guide.voters?.includes(session?.user?.id) ? 'var(--accent-primary)' : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ThumbsUp size={20} fill={guide.voters?.includes(session?.user?.id) ? 'var(--accent-primary)' : 'transparent'} />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{guide.upvotes || 0}</span>
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: 700 }}>{guide.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                  {guide.content}
                </p>

                <div style={{ 
                  paddingTop: '1.5rem', 
                  borderTop: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{guide.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>@{guide.username}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(guide.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        <AnimatePresence>
          {showForm && (
            <div style={{ 
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Share Your <span className="gradient-text">Wisdom</span></h2>
                  <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DOMAIN</label>
                    <select 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      style={{
                        padding: '1rem', background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', outline: 'none'
                      }}
                    >
                      <option>Cybersecurity</option>
                      <option>Financial Literacy</option>
                      <option>Mental Health</option>
                      <option>Life Skills</option>
                      <option>General</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STRATEGY TITLE</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., How to spot a fake bank URL"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        padding: '1rem', background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONTENT</label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Explain your strategy in detail..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        padding: '1rem', background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)', outline: 'none', resize: 'none'
                      }}
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                  >
                    {isSubmitting ? 'Publishing...' : <><Send size={20} /> Publish Guide</>}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
