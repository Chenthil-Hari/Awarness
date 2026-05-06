'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const CATEGORIES = ['phishing', 'smishing', 'finance', 'security'];

const AVATARS = [
  { id: 'identity_0', url: '/avatars/identity_0.jpg', name: 'Phantom Operative' },
  { id: 'identity_1', url: '/avatars/identity_1.jpg', name: 'Shadow Infiltrator' },
  { id: 'identity_2', url: '/avatars/identity_2.jpg', name: 'Neural Nomad' },
  { id: 'identity_3', url: '/avatars/identity_3.jpg', name: 'Void Specialist' },
  { id: 'identity_4', url: '/avatars/identity_4.jpg', name: 'Glitch Master' },
  { id: 'neo_1', url: '/avatars/neo_1.jpg', name: 'Cyber Centurion' },
  { id: 'neo_2', url: '/avatars/neo_2.jpg', name: 'Vector Vanguard' },
  { id: 'neo_3', url: '/avatars/neo_3.jpg', name: 'Binary Blade' },
  { id: 'neo_4', url: '/avatars/neo_4.jpg', name: 'Zenith Zero' },
];

function calculateLevel(xp = 0) {
  return Math.floor(xp / 1000) + 1;
}

function getCategoryColor(cat) {
  switch(cat) {
    case 'phishing': return '#bc13fe'; // neon pink
    case 'smishing': return '#ec4899';
    case 'finance': return '#f59e0b';
    case 'security': return '#0aff00'; // neon green
    default: return '#00f3ff'; // neon cyan
  }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [updateStatus, setUpdateStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userXp, setUserXp] = useState(0);
  const [animatedXp, setAnimatedXp] = useState(0);

  const canvasRef = useRef(null);

  useEffect(() => {
    if (session?.user?.username) {
      setUsername(session.user.username);
      setUserXp(session.user.xp || 0);
      fetchTickets();
      fetchNotifications();
    }

    const handleXpUpdate = (e) => {
      const { xp } = e.detail;
      setUserXp(xp);
    };

    window.addEventListener('xp-update', handleXpUpdate);
    return () => {
      window.removeEventListener('xp-update', handleXpUpdate);
    };
  }, [session]);

  // Animated XP Counter
  useEffect(() => {
    if (userXp === 0) return;
    let current = animatedXp;
    const duration = 1500;
    const range = userXp - animatedXp;
    if (range <= 0) {
       setAnimatedXp(userXp);
       return;
    }
    const stepTime = 30;
    const increment = Math.max(1, Math.ceil(range / (duration / stepTime)));
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= userXp) {
        setAnimatedXp(userXp);
        clearInterval(timer);
      } else {
        setAnimatedXp(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [userXp]);

  // Background Particles
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let animationFrameId;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for(let i=0; i<100; i++) particles.push({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
      s: Math.random()*2
    });

    const animateBg = () => {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>w) p.vx*=-1;
        if(p.y<0||p.y>h) p.vy*=-1;
        ctx.fillStyle = 'rgba(0,243,255,0.25)';
        ctx.fillRect(p.x,p.y,p.s,p.s);
      });
      for(let i=0;i<particles.length;i++) {
        for(let j=i+1;j<particles.length;j++) {
          let dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
          let dist = Math.sqrt(dx*dx+dy*dy);
          if(dist<120) {
            ctx.strokeStyle = `rgba(0,243,255,${0.05*(1-dist/120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animateBg);
    };
    animateBg();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const level = calculateLevel(userXp);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/ticket');
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {}
  };

  const markNotificationRead = async (id = null) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, action: id ? 'read' : 'read_all' }),
      });
      fetchNotifications();
    } catch (err) {}
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
      if (res.ok) {
        setNewTicket({ subject: '', message: '' });
        fetchTickets();
        setUpdateStatus({ type: 'success', message: 'Mission query sent to Command!' });
        setTimeout(() => setUpdateStatus({ type: '', message: '' }), 3000);
      }
    } catch (err) {
      setUpdateStatus({ type: 'error', message: 'Broadcast failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await update({ ...session, user: { ...session.user, username: data.username } });

      setUpdateStatus({ type: 'success', message: 'Handle updated!' });
      setTimeout(() => {
        setIsEditing(false);
        setUpdateStatus({ type: '', message: '' });
      }, 1500);
      router.refresh();
    } catch (err) {
      setUpdateStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await update({ ...session, user: { ...session.user, image: data.image || avatarUrl } });
      setIsAvatarModalOpen(false);
      router.refresh();
    } catch (err) {
      alert("Failed to update avatar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Maximum size is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => handleAvatarUpdate(reader.result);
    reader.readAsDataURL(file);
  };

  if (status === 'loading') {
    return (
      <div className="profile-page flex items-center justify-center">
        <LoadingSpinner message="Establishing Neural Link..." />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="profile-page flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-orbitron text-red-500 font-bold mb-4 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">ACCESS DENIED</h1>
          <p className="text-gray-400 font-mono">Please sign in to view your operative profile.</p>
        </div>
      </main>
    );
  }

  const { user } = session;
  const performance = user.performance || {};
  const history = [...(user.history || [])].reverse();

  let totalAttempts = 0;
  let totalSuccesses = 0;
  CATEGORIES.forEach(cat => {
    totalAttempts += performance[cat]?.attempts || 0;
    totalSuccesses += performance[cat]?.successes || 0;
  });
  const accuracy = totalAttempts > 0 ? Math.round((totalSuccesses / totalAttempts) * 100) : 0;
  const circumference = 2 * Math.PI * 85;
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <main className="profile-page relative">
      <canvas ref={canvasRef} className="bg-canvas"></canvas>
      <div className="scanlines"></div>

      <div className="min-h-screen flex items-start justify-center p-4 relative z-10 pt-20 pb-20">
        <div className="w-full max-w-6xl">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-orbitron text-4xl md:text-5xl font-bold tracking-widest uppercase text-white mb-2 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">Operative Profile</h1>
            <p className="text-cyan-400 font-mono text-sm tracking-[0.3em]">IDENTITY_VERIFIED // ENCRYPTED_CONNECTION</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Profile & Stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="glass-card rounded-2xl p-8 text-center relative">
                <button onClick={() => signOut()} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition" title="Disconnect">
                  <i className="fas fa-power-off"></i>
                </button>
                {/* Avatar */}
                <div className="avatar-container mx-auto mb-6" onClick={() => setIsAvatarModalOpen(true)}>
                  <div className="avatar-border"></div>
                  {user.image ? (
                    <img src={user.image} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder text-4xl font-orbitron text-cyan-400">{user.name?.charAt(0) || 'U'}</div>
                  )}
                  <div className="scan-beam"></div>
                  <div className="avatar-overlay">
                    <i className="fas fa-camera text-white text-2xl"></i>
                  </div>
                </div>
                
                {/* Name & Username */}
                <h2 className="text-2xl font-bold text-white font-orbitron mb-1">{user.name || 'Unknown Agent'}</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="text-cyan-400 font-mono text-sm">@{user.username || 'user'}</p>
                  <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-cyan-400 transition"><i className="fas fa-edit text-xs"></i></button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-cyan-400 font-orbitron">{animatedXp.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Total XP</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-pink-400 font-orbitron">Lvl {level}</div>
                    <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Level</div>
                  </div>
                </div>
              </div>

              {/* Overall Accuracy */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-white font-orbitron mb-4 w-full text-left">
                  <i className="fas fa-crosshairs text-green-400 mr-2"></i>Overall Accuracy
                </h3>
                <div className="accuracy-ring">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <motion.circle 
                      cx="100" cy="100" r="85" fill="none" stroke="var(--neon-green)" strokeWidth="12" strokeDasharray="534" 
                      initial={{ strokeDashoffset: 534 }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white font-orbitron">{accuracy}%</span>
                    <span className="text-xs text-gray-400 font-mono mt-1">PRECISION</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-4 text-center">Based on {totalAttempts} data points</p>
              </div>
            </div>

            {/* Middle Col: Skill Matrix & Categories */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Skill Matrix */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white font-orbitron mb-4">
                  <i className="fas fa-radar text-cyan-400 mr-2"></i>Skill Matrix
                </h3>
                <div className="flex justify-center my-4">
                  <SkillRadar performance={performance} />
                </div>
              </div>

              {/* Category Proficiency */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white font-orbitron mb-6">
                  <i className="fas fa-chart-bar text-pink-400 mr-2"></i>Category Proficiency
                </h3>
                <div className="space-y-5">
                  {CATEGORIES.map((cat, idx) => {
                    const stats = performance[cat] || {};
                    const xp = stats.xp || 0;
                    const catAcc = stats.attempts > 0 ? Math.round((stats.successes / stats.attempts) * 100) : 0;
                    const percent = Math.min(100, (xp / 2000) * 100);
                    const color = getCategoryColor(cat);

                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-gray-300 font-mono uppercase tracking-wider">{cat}</span>
                          <span className="text-xs font-mono" style={{ color }}>{catAcc}% Acc</span>
                        </div>
                        <div className="skill-track">
                          <motion.div 
                            className="skill-fill" 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Command Support & Alerts */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Support Form */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white font-orbitron mb-4">
                  <i className="fas fa-headset text-cyan-400 mr-2"></i>Command Support
                </h3>
                <p className="text-xs text-gray-400 font-mono mb-6 leading-relaxed">
                  Need backup? Submit a mission query to Command Center.
                </p>
                
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  {updateStatus.message && (
                    <div className={`p-2 text-xs font-mono rounded ${updateStatus.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {updateStatus.message}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Subject</label>
                    <input type="text" placeholder="Mission ID / Issue" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="cyber-input text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Details</label>
                    <textarea rows="4" placeholder="Describe anomaly..." value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="cyber-input text-sm resize-none" required></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="cyber-btn w-full py-3 rounded text-sm uppercase flex items-center justify-center">
                    {isSubmitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>ENCRYPTING...</> : <><i className="fas fa-paper-plane mr-2"></i>Transmit</>}
                  </button>
                </form>
              </div>
              
              {/* Status Feed / Alerts */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-white font-orbitron uppercase tracking-wider">
                    <i className="fas fa-satellite-dish text-green-400 mr-2"></i>Command Alerts
                  </h3>
                  {notifications.some(n => !n.read) && (
                    <button onClick={() => markNotificationRead()} className="text-[10px] text-cyan-400 hover:text-white font-mono">CLEAR ALL</button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? notifications.map((n, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => !n.read && markNotificationRead(n._id)}
                      className={`p-3 rounded-lg border text-sm transition ${n.read ? 'bg-white/5 border-white/10' : 'bg-cyan-500/10 border-cyan-500/30 cursor-pointer hover:bg-cyan-500/20'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-mono font-bold ${n.read ? 'text-gray-300' : 'text-cyan-400'}`}>{n.title}</span>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400"></div>}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{n.message}</p>
                      <div className="text-[10px] text-gray-500 font-mono text-right">{timeAgo(n.createdAt)}</div>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-gray-500 font-mono text-xs">
                      <i className="fas fa-shield-alt text-2xl mb-2 opacity-50 block"></i>
                      SYSTEMS NORMAL.<br/>NO ALERTS.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Mission Log & Comms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Mission Log */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-orbitron mb-4">
                <i className="fas fa-history text-cyan-400 mr-2"></i>Mission Log
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {history.length > 0 ? history.slice(0, 10).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${item.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                      <i className={`fas ${item.success ? 'fa-shield-check' : 'fa-skull'}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-sm font-orbitron">{item.type} {item.success ? 'Secured' : 'Breached'}</p>
                        <p className="text-xs text-gray-500 font-mono">{timeAgo(item.timestamp)}</p>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{item.xp > 0 ? `Reward: +${item.xp} XP` : 'Standard Drill'}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 font-mono">No missions recorded.</div>
                )}
              </div>
            </div>

            {/* Mission Comms (Tickets) */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white font-orbitron mb-4">
                <i className="fas fa-envelope-open-text text-pink-400 mr-2"></i>Mission Comms
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {tickets.length > 0 ? tickets.map((ticket, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded font-mono uppercase ${ticket.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {ticket.status}
                        </span>
                        <h4 className="font-bold text-sm mt-2">{ticket.subject}</h4>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">{timeAgo(ticket.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{ticket.message}</p>
                    
                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="p-3 rounded-lg bg-cyan-500/5 border-l-2 border-cyan-400">
                        {ticket.replies.map((reply, ridx) => (
                          <div key={ridx} className="mb-2 last:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <i className="fas fa-shield-alt text-cyan-400 text-[10px]"></i>
                              <span className="text-[10px] font-bold text-cyan-400 font-mono">COMMAND</span>
                            </div>
                            <p className="text-xs text-gray-300">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 font-mono">No active comms channel.</div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 font-mono text-xs text-gray-600 tracking-[0.2em]">
            ENCRYPTED Transmission v4.2.1 // ID: 0x{user._id ? user._id.slice(-6).toUpperCase() : 'PH4N70M'}
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a10] border border-cyan-500 p-8 rounded-2xl max-w-lg w-full text-center shadow-[0_0_40px_rgba(0,243,255,0.1)]"
            >
              <h2 className="text-2xl font-bold text-white font-orbitron mb-2">Select Identity</h2>
              <p className="text-gray-400 text-sm font-mono mb-6">Choose your visual representation</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {AVATARS.map(avatar => (
                  <img 
                    key={avatar.id}
                    src={avatar.url} 
                    onClick={() => handleAvatarUpdate(avatar.url)}
                    className={`w-full aspect-square rounded-xl cursor-pointer object-cover border transition ${user.image === avatar.url ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]'}`} 
                    alt={avatar.name} 
                  />
                ))}
              </div>
              
              <div className="mb-6">
                <label className="cyber-btn px-6 py-3 rounded inline-block cursor-pointer text-sm font-mono text-center w-full">
                  <i className="fas fa-upload mr-2"></i>Upload Custom
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
              
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-gray-400 hover:text-white font-mono text-sm">[ CLOSE ]</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Username Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a10] border border-cyan-500 p-8 rounded-2xl max-w-md w-full shadow-[0_0_40px_rgba(0,243,255,0.1)]"
            >
              <h2 className="text-2xl font-bold text-white font-orbitron mb-2">Update Handle</h2>
              <p className="text-gray-400 text-sm font-mono mb-6">Choose a unique identifier.</p>
              
              <form onSubmit={handleUsernameUpdate}>
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-cyan-400 text-lg">@</span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                    placeholder="agent_name" 
                    autoFocus 
                    className="w-full bg-white/5 border border-cyan-500/30 rounded-lg py-3 pl-10 pr-4 text-white font-mono outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition"
                  />
                </div>
                
                {updateStatus.message && (
                  <div className={`p-3 rounded text-sm font-mono mb-6 ${updateStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <i className={`fas ${updateStatus.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                    {updateStatus.message}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition font-mono text-sm">Cancel</button>
                  <button type="submit" disabled={loading} className="cyber-btn flex-[2] py-3 px-6 rounded text-sm text-center">
                    {loading ? 'Processing...' : 'Save Identity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

function SkillRadar({ performance }) {
  const size = 260;
  const center = size / 2;
  const radius = 100;
  const points = CATEGORIES.map((cat, i) => {
    const stats = performance[cat] || {};
    const xpVal = Math.min(100, (stats.xp || 0) / 15);
    const accVal = stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0;
    const value = (xpVal * 0.4) + (accVal * 0.6);
    const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
    const r = (value / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="rgba(0,243,255,0.1)" strokeWidth="1" />
        ))}
        {CATEGORIES.map((_, i) => {
          const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
          return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(0,243,255,0.1)" strokeWidth="1" />;
        })}
        <motion.polygon 
          points={points} 
          fill="rgba(188, 19, 254, 0.15)" 
          stroke="var(--neon-cyan)" 
          strokeWidth="2" 
          strokeLinejoin="round" 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ duration: 1.5, ease: "backOut", delay: 0.5 }} 
        />
      </svg>
      {CATEGORIES.map((cat, i) => {
        const angle = (i / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2;
        const r = radius + 25;
        return <div key={cat} style={{ position: 'absolute', top: center + r * Math.sin(angle), left: center + r * Math.cos(angle), transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: 900, color: '#e0e0e0', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</div>;
      })}
    </div>
  );
}
