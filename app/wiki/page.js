'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import SimulationLottie from '../components/SimulationLottie';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Plus, Search, BookOpen, Send, X, MessageSquare, ShieldCheck, Trash2, Flag, AlertCircle, Award, Video, PlayCircle } from 'lucide-react';

function WikiContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [domain, setDomain] = useState('Cybersecurity');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Report State
  const [reportingGuide, setReportingGuide] = useState(null);
  const [reportReason, setReportReason] = useState('Inaccurate Information');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const res = await fetch('/api/guides');
      const data = await res.json();
      setGuides(data);
      if (highlightId) setSearchQuery('');
    } catch (error) {
      console.error('Failed to fetch guides');
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleVote = async (guideId) => {
    if (!session) return;
    try {
      const res = await fetch('/api/guides/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      if (res.ok) fetchGuides();
    } catch (error) {
      console.error('Failed to vote');
    }
  };

  const handleDelete = async (guideId) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;
    try {
      const res = await fetch(`/api/guides/${guideId}`, { method: 'DELETE' });
      if (res.ok) setGuides(guides.filter(g => g._id !== guideId));
    } catch (error) {
      console.error('Failed to delete guide');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!session || !reportingGuide) return;
    try {
      const res = await fetch('/api/guides/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: reportingGuide._id, reason: reportReason, details: reportDetails }),
      });
      if (res.ok) {
        setShowReportModal(false);
        setReportDetails('');
        alert('Thank you for your report.');
      }
    } catch (error) {
      console.error('Failed to report');
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
        body: JSON.stringify({ title, content, domain, videoUrl }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        setVideoUrl('');
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
    guide.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide._id === highlightId
  );

  return (
    <div style={{ marginTop: '2rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex-center" style={{ marginBottom: '1rem' }}>
            <SimulationLottie width={220} height={220} />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-2px' }}>Learning <span className="gradient-text">Hub</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
            Master simulations with community strategies, videos, and survival guides.
          </p>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search strategies, domains, or videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
        <button onClick={() => session ? setShowForm(true) : window.location.href='/auth/login'} className="btn-primary" style={{ padding: '1rem 2rem' }}>
          <Plus size={20} /> Share Strategy
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem' }}>
          <LoadingSpinner size={100} message="Syncing with the hive mind..." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
          {filteredGuides.map((guide, idx) => {
            const isHighlighted = guide._id === highlightId;
            const youtubeId = getYouTubeId(guide.videoUrl);
            
            return (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, scale: 1,
                  borderColor: isHighlighted ? 'var(--accent-primary)' : 'var(--glass-border)',
                  boxShadow: isHighlighted ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none'
                }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card"
                style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', position: 'relative', border: isHighlighted ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)' }}
              >
                {isHighlighted && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'white', padding: '2px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800, zIndex: 10 }}>
                    RECOMMENDED DEEP DIVE
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-secondary)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                      {guide.domain}
                    </span>
                    {guide.isOfficial && <Award size={18} color="var(--accent-primary)" />}
                    {youtubeId && <Video size={18} color="var(--accent-secondary)" />}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {session?.user?.id === guide.authorId ? (
                      <button onClick={() => handleDelete(guide._id)} style={{ color: 'var(--accent-danger)', opacity: 0.7 }}><Trash2 size={18} /></button>
                    ) : (
                      <button onClick={() => { setReportingGuide(guide); setShowReportModal(true); }} style={{ color: 'var(--text-muted)' }}><Flag size={18} /></button>
                    )}
                    <button onClick={() => handleVote(guide._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: guide.voters?.includes(session?.user?.id) ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      <ThumbsUp size={20} fill={guide.voters?.includes(session?.user?.id) ? 'var(--accent-primary)' : 'transparent'} />
                      <span style={{ fontWeight: 800 }}>{guide.upvotes || 0}</span>
                    </button>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', fontWeight: 700 }}>{guide.title}</h3>
                
                {youtubeId && (
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem', background: '#000' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                  {guide.content}
                </p>

                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{guide.username?.charAt(0).toUpperCase() || 'S'}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>@{guide.username || 'system'}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(guide.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Share Your <span className="gradient-text">Wisdom</span></h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DOMAIN</label>
                  <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ padding: '0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option>Cybersecurity</option>
                    <option>Financial Literacy</option>
                    <option>Mental Health</option>
                    <option>Life Skills</option>
                    <option>General</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STRATEGY TITLE</label>
                  <input required type="text" placeholder="e.g., How to spot a fake bank URL" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>YOUTUBE VIDEO URL (OPTIONAL)</label>
                  <div style={{ position: 'relative' }}>
                    <PlayCircle size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONTENT / DESCRIPTION</label>
                  <textarea required rows={4} placeholder="Explain your strategy or summarize the video..." value={content} onChange={(e) => setContent(e.target.value)} style={{ padding: '0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>

                <button disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}>
                  {isSubmitting ? 'Publishing...' : <><Send size={20} /> Publish Strategy</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={24} color="var(--accent-warning)" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Report <span className="gradient-text">Strategy</span></h2>
                </div>
                <button onClick={() => setShowReportModal(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>REASON</label>
                  <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option>Inaccurate Information</option>
                    <option>Inappropriate Content</option>
                    <option>Spam or Scams</option>
                    <option>Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ADDITIONAL DETAILS</label>
                  <textarea rows={4} placeholder="Help us understand..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--accent-warning)' }}>Submit Report</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WikiPage() {
  return (
    <main className="container">
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <WikiContent />
      </Suspense>
    </main>
  );
}
