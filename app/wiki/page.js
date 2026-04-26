'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import SimulationLottie from '../components/SimulationLottie';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Plus, Search, Send, X, MessageSquare, Trash2, Flag, AlertCircle, Award, Video, PlayCircle, CornerDownRight, User, Loader2 } from 'lucide-react';
import BorderGlow from '../components/BorderGlow/BorderGlow';
import TextPressure from '../components/TextPressure/TextPressure';

function CommentItem({ comment, onReply, isReply = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: isReply ? 20 : 0 }}
      animate={{ opacity: 1, x: isReply ? 20 : 0 }}
      style={{ 
        marginBottom: '1rem', 
        paddingLeft: isReply ? '1.5rem' : '0',
        borderLeft: isReply ? '2px solid var(--glass-border)' : 'none'
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ 
          width: isReply ? '24px' : '32px', 
          height: isReply ? '24px' : '32px', 
          borderRadius: '50%', 
          background: 'var(--bg-tertiary)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          border: '1px solid var(--glass-border)',
          flexShrink: 0
        }}>
          <span style={{ fontSize: isReply ? '0.6rem' : '0.8rem', fontWeight: 800 }}>
            {comment.username?.charAt(0).toUpperCase() || <User size={12}/>}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>@{comment.username}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{comment.content}</p>
          
          {!isReply && (
            <button 
              onClick={() => onReply(comment.id)}
              style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700, marginTop: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </motion.div>
  );
}

function CommentSection({ guideId, comments = [], onCommentAdded }) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/guides/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guideId, 
          content, 
          parentCommentId: replyTo 
        }),
      });

      if (res.ok) {
        setContent('');
        setReplyTo(null);
        onCommentAdded();
      }
    } catch (error) {
      console.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={18} /> Discussion ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
      </h4>

      <div style={{ marginBottom: '2rem' }}>
        {comments.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No comments yet. Start the conversation!</p>
        ) : (
          comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={(id) => setReplyTo(id)} 
            />
          ))
        )}
      </div>

      {session ? (
        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          {replyTo && (
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CornerDownRight size={14} /> Replying to comment
              <button onClick={() => setReplyTo(null)} style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ 
                flex: 1, padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', 
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem'
              }}
            />
            <button 
              disabled={isSubmitting}
              className="btn-primary" 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)' }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Please sign in to join the discussion.</p>
      )}
    </div>
  );
}

function WikiContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
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
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const fetchGuides = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Add timestamp to bust cache and ensure we always get latest messages
      const res = await fetch(`/api/guides?t=${new Date().getTime()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setGuides(data);
    } catch (error) {
      console.error('Failed to fetch guides');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
    
    // LIVE PULSE: Auto-refresh data every 5 seconds to show new comments instantly
    const interval = setInterval(() => {
      fetchGuides(true); // silent update
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchGuides]);

  useEffect(() => {
    if (highlightId && guides.length > 0) {
      setSearchQuery('');
      setExpandedGuide(highlightId);
    }
  }, [highlightId, guides.length]);

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
      if (res.ok) fetchGuides(true);
    } catch (error) {
      console.error('Failed to vote');
    }
  };

  const handleDelete = async (guideId) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;
    setDeletingId(guideId);
    try {
      const res = await fetch(`/api/guides/${guideId}`, { method: 'DELETE' });
      if (res.ok) {
        setGuides(prev => prev.filter(g => g._id !== guideId));
      } else {
        const err = await res.json();
        alert(`Delete Error: ${err.error || 'Failed to delete'}`);
      }
    } catch (error) {
      alert('Network error while deleting. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!session) {
      alert('Please sign in to report content.');
      return;
    }
    if (!reportingGuide) return;
    
    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/guides/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: reportingGuide._id, reason: reportReason, details: reportDetails }),
      });
      
      if (res.ok) {
        setShowReportModal(false);
        setReportDetails('');
        setReportReason('Inaccurate Information');
        alert('Thank you for your report. Our moderators will review it shortly.');
      } else {
        const errorData = await res.json();
        alert(`Failed to submit report: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to report');
      alert('Network error. Please try again.');
    } finally {
      setIsSubmittingReport(false);
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
        fetchGuides(true);
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

  const previewId = getYouTubeId(videoUrl);

  return (
    <div style={{ marginTop: '2rem', paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex-center" style={{ marginBottom: '1rem' }}>
            <SimulationLottie width={220} height={220} />
          </div>
          <div style={{ position: 'relative', height: '120px', width: '100%', maxWidth: '900px', margin: '0 auto -1rem' }}>
            <TextPressure
              text="LEARNING HUB"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="var(--text-primary)"
              minFontSize={48}
            />
          </div>
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

      {loading && !guides.length ? (
        <div style={{ padding: '4rem' }}>
          <LoadingSpinner size={100} message="Syncing with the hive mind..." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
          {filteredGuides.map((guide, idx) => {
            const isHighlighted = guide._id === highlightId;
            const youtubeId = getYouTubeId(guide.videoUrl);
            const isExpanded = expandedGuide === guide._id;
            const isDeleting = deletingId === guide._id;
            
            return (
              <BorderGlow
                key={guide._id}
                edgeSensitivity={30}
                glowColor={isHighlighted ? "260 80 50" : (guide.domain === 'Cybersecurity' ? "260 80 80" : "190 80 80")}
                backgroundColor="var(--bg-primary)"
                borderRadius={24}
                glowRadius={isHighlighted ? 50 : 40}
                glowIntensity={isHighlighted ? 1.5 : 1.0}
                coneSpread={25}
                animated={isHighlighted}
                colors={isHighlighted ? ['#7c3aed', '#a78bfa', '#c4b5fd'] : (guide.domain === 'Cybersecurity' ? ['#8b5cf6', '#a78bfa', '#c4b5fd'] : ['#06b6d4', '#22d3ee', '#67e8f9'])}
              >
                <div
                  style={{ 
                    padding: '2rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative', 
                    height: '100%',
                    opacity: isDeleting ? 0.5 : 1
                  }}
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
                      {(session?.user?.id === guide.authorId || session?.user?.role === 'admin') ? (
                        <button 
                          disabled={isDeleting}
                          onClick={() => handleDelete(guide._id)} 
                          style={{ color: 'var(--accent-danger)', opacity: isDeleting ? 0.3 : 0.7 }}
                        >
                          {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        </button>
                      ) : (
                        <button onClick={() => { 
                          if (!session) {
                            window.location.href = '/auth/login';
                          } else {
                            setReportingGuide(guide); 
                            setShowReportModal(true); 
                          }
                        }} style={{ color: 'var(--text-muted)' }}><Flag size={18} /></button>
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
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                    {guide.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{guide.username?.charAt(0).toUpperCase() || 'S'}</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>@{guide.username || 'system'}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(guide.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setExpandedGuide(isExpanded ? null : guide._id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        color: isExpanded ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontSize: '0.85rem', fontWeight: 700
                      }}
                    >
                      <MessageSquare size={18} />
                      {guide.comments?.length || 0} Comments
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <CommentSection 
                          guideId={guide._id} 
                          comments={guide.comments} 
                          onCommentAdded={() => fetchGuides(true)} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      )}

      {/* Modal Forms */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: 'var(--radius-xl)', overflowY: 'auto', maxHeight: '95vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Share Your <span className="gradient-text">Wisdom</span></h2>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DOMAIN</label>
                  <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ padding: '0.7rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option>Cybersecurity</option>
                    <option>Financial Literacy</option>
                    <option>Mental Health</option>
                    <option>Life Skills</option>
                    <option>General</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STRATEGY TITLE</label>
                  <input required type="text" placeholder="e.g., How to spot a fake bank URL" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '0.7rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>YOUTUBE VIDEO URL (OPTIONAL)</label>
                  <div style={{ position: 'relative' }}>
                    <PlayCircle size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>

                <AnimatePresence>
                  {previewId && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', marginBottom: '0.5rem' }}>
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${previewId}`} title="YouTube preview" frameBorder="0"></iframe>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONTENT</label>
                  <textarea required rows={4} placeholder="Explain your strategy..." value={content} onChange={(e) => setContent(e.target.value)} style={{ padding: '0.7rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>

                <button disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Publish Strategy</>}
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
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DETAILS</label>
                  <textarea rows={4} placeholder="Help us understand..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>
                <button type="submit" disabled={isSubmittingReport} className="btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--accent-warning)' }}>
                  {isSubmittingReport ? <Loader2 className="animate-spin" size={20} /> : 'Submit Report'}
                </button>
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
