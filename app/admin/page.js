'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BookOpen, AlertTriangle, Trash2, CheckCircle, BarChart3, ArrowUpRight, User, ExternalLink, ShieldAlert, LogOut, Sun, Moon, Ghost, Mail, Command, Bot, Zap, Eye, EyeOff, Layout, Plus, Minus, Save } from 'lucide-react';
import AdminCommandBar from '../components/AdminCommandBar';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, guides: 0, reports: 0 });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('dark');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({
    title: '',
    category: 'Cybersecurity',
    difficulty: 'Beginner',
    description: '',
    xpReward: 100,
    steps: {
      start: {
        text: '',
        options: [
          { text: '', nextStep: 'success', feedback: '', points: 50 }
        ]
      },
      success: { text: 'Congratulations! You solved it.', isFinal: true },
      fail: { text: 'Unfortunate. Try again!', isFinal: true, failed: true }
    }
  });

  const handleSaveScenario = async () => {
    try {
      const res = await fetch('/api/admin/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScenario)
      });
      if (res.ok) {
        alert('Scenario deployed successfully!');
        setActiveTab('overview');
      }
    } catch (error) {
      alert('Failed to save scenario');
    }
  };

  useEffect(() => {
    // Command Bar Listener (Ctrl + K)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';
    setTheme(savedTheme);

    if (session?.user?.role === 'admin') {
      fetchAdminData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, reportsRes, usersRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users'),
        fetch('/api/admin/support')
      ]);
      
      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();
      const usersData = await usersRes.json();
      const ticketsData = await ticketsRes.json();
      
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuide = async (guideId, reportId) => {
    if (!confirm('Are you sure you want to delete this guide and dismiss the report?')) return;
    try {
      const res = await fetch(`/api/guides/${guideId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to delete guide');
    }
  };

  const handleImpersonate = async (userId, username) => {
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username })
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      alert('Failed to activate Ghost Mode');
    }
  };

  const handleTestEmail = async () => {
    const email = prompt("Enter email address to send test to:", session.user.email);
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/test-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ SUCCESS: ' + data.message);
      } else {
        alert('❌ FAILED: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ SYSTEM ERROR: Could not connect to test API');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) fetchAdminData();
    } catch (error) {
      alert('Failed to dismiss report');
    }
  };

  if (status === 'loading' || (session?.user?.role === 'admin' && loading)) {
    return <LoadingSpinner message="Authenticating Admin Access..." />;
  }

  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '8rem', fontWeight: 900, opacity: 0.1 }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>The page you are looking for does not exist.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: '1rem' }}>Return Home</button>
      </div>
    );
  }

  const handleMarkSafe = async (id, type) => {
    try {
      const res = await fetch(`/api/admin/moderation/safe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type })
      });
      if (res.ok) {
        // Refresh data
        const guidesRes = await fetch('/api/guides');
        const guidesData = await guidesRes.json();
        setGuides(guidesData);
      }
    } catch (error) {
      alert('Failed to authorize content');
    }
  };

  const handleReplyTicket = async (ticketId) => {
    const reply = prompt("Enter your reply to the user:");
    if (!reply) return;

    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, reply })
      });
      if (res.ok) {
        alert('Reply sent successfully!');
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to send reply');
    }
  };

  const isDark = theme === 'dark';

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0a0a0b' : '#f8fafc', 
      color: isDark ? 'white' : '#0f172a', 
      padding: '2rem',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <AdminCommandBar 
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onNavigate={setActiveTab}
        onToggleTheme={toggleTheme}
        onTestEmail={handleTestEmail}
        users={users}
        reports={reports}
        currentTheme={theme}
      />

      <div className="container">
        {/* Isolated Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '4rem', 
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', 
          paddingBottom: '2rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'var(--accent-primary)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <Shield size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>Admin <span className="gradient-text">Command</span></h1>
              <p style={{ color: isDark ? 'var(--text-muted)' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                SECURE SYSTEM OVERRIDE <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.6rem' }}><Command size={8} /> K</span>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={toggleTheme}
              style={{ 
                padding: '0.6rem', borderRadius: 'var(--radius-md)', 
                background: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? 'white' : '#0f172a',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} /> System Exit
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Total Citizens', value: stats.users, icon: <Users />, color: 'var(--accent-primary)' },
            { label: 'Strategies Shared', value: stats.guides, icon: <BookOpen />, color: 'var(--accent-secondary)' },
            { label: 'Pending Reports', value: stats.reports, icon: <AlertTriangle />, color: 'var(--accent-danger)' },
            { label: 'System Health', value: 'Optimal', icon: <CheckCircle />, color: 'var(--accent-success)' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card" 
              style={{ 
                padding: '1.5rem', borderRadius: 'var(--radius-xl)', 
                borderLeft: `4px solid ${stat.color}`,
                background: isDark ? 'var(--glass-bg)' : 'white',
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <BarChart3 size={16} style={{ opacity: 0.3 }} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: isDark ? 'white' : '#0f172a' }}>{stat.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.4rem' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', borderBottom: isDark ? '1px solid var(--glass-border)' : '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', overflowX: 'auto' }}>
          {['overview', 'reports', 'users', 'sandbox', 'support'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', border: 'none', color: activeTab === tab ? (isDark ? 'var(--text-primary)' : '#7c3aed') : 'var(--text-muted)',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer', position: 'relative', padding: '0.5rem 1rem',
                textTransform: 'capitalize', whiteSpace: 'nowrap'
              }}
            >
              {tab === 'sandbox' ? 'Sandbox 🏗️' : (tab === 'support' ? 'Support 💬' : tab)}
              {activeTab === tab && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-1rem', left: 0, right: 0, height: '3px', background: 'var(--accent-primary)' }} />}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          {activeTab === 'reports' && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {reports.length === 0 ? (
                  <div className="glass-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                    <Shield size={48} style={{ opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-muted)' }}>Community is safe. No pending reports.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reports.map(report => (
                      <div key={report._id} className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ background: 'var(--accent-danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800 }}>{report.reason}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? 'white' : '#0f172a' }}>{report.guideTitle}</h4>
                          <p style={{ fontSize: '0.9rem', color: isDark ? 'var(--text-secondary)' : '#475569', marginTop: '0.4rem' }}>"{report.details}"</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button 
                            onClick={() => window.open(`/wiki?id=${report.guideId}`, '_blank')}
                            className="btn-secondary" style={{ padding: '0.6rem', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => handleDismissReport(report._id)}
                            className="btn-secondary" style={{ padding: '0.6rem', color: 'var(--accent-success)', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteGuide(report.guideId, report._id)}
                            className="btn-secondary" style={{ padding: '0.6rem', color: 'var(--accent-danger)', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {activeTab === 'users' && (
            <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: isDark ? 'var(--glass-bg)' : 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isDark ? 'var(--bg-tertiary)' : '#f1f5f9', borderBottom: isDark ? '1px solid var(--glass-border)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>CITIZEN</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>USERNAME</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>EXPERIENCE (XP)</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>ROLE</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: isDark ? '1px solid var(--glass-border)' : '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDark ? 'var(--bg-tertiary)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: isDark ? 'white' : '#0f172a' }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem', fontWeight: 600, color: isDark ? 'white' : '#475569' }}>@{user.username}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: isDark ? 'white' : '#0f172a' }}>
                          <ArrowUpRight size={16} color="var(--accent-success)" />
                          {user.xp} XP
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800,
                            background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-muted)'
                          }}>
                            {user.role?.toUpperCase() || 'USER'}
                          </span>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => handleImpersonate(user._id, user.username)}
                              title="Ghost Mode (Impersonate)"
                              style={{ color: 'var(--accent-secondary)', opacity: 0.6 }}
                            >
                              <Ghost size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '0.8rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
                    <Layout size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>The <span className="gradient-text">Sandbox</span></h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Architect your own interactive simulations</p>
                  </div>
                  <button onClick={handleSaveScenario} className="btn-primary" style={{ marginLeft: 'auto', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
                    <Save size={18} /> Deploy Scenario
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {/* Basic Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>SCENARIO TITLE</label>
                      <input 
                        value={newScenario.title}
                        onChange={(e) => setNewScenario({...newScenario, title: e.target.value})}
                        placeholder="e.g. The Phishing Phone Call"
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>CATEGORY</label>
                      <select 
                        value={newScenario.category}
                        onChange={(e) => setNewScenario({...newScenario, category: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }}
                      >
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Financial Literacy">Financial Literacy</option>
                        <option value="Life Skills">Life Skills</option>
                        <option value="Mental Health">Mental Health</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>SHORT DESCRIPTION</label>
                      <textarea 
                        value={newScenario.description}
                        onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                        placeholder="Describe the situation to the user..."
                        style={{ width: '100%', height: '100px', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a', resize: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Steps Editor */}
                  <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Initial Step Configuration</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>QUESTION / STORY TEXT</label>
                      <textarea 
                        value={newScenario.steps.start.text}
                        onChange={(e) => {
                          const updated = {...newScenario};
                          updated.steps.start.text = e.target.value;
                          setNewScenario(updated);
                        }}
                        placeholder="What happens first?"
                        style={{ width: '100%', height: '80px', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a', resize: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block' }}>USER CHOICES</label>
                      {newScenario.steps.start.options.map((opt, i) => (
                        <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                          <input 
                            value={opt.text}
                            onChange={(e) => {
                              const updated = {...newScenario};
                              updated.steps.start.options[i].text = e.target.value;
                              setNewScenario(updated);
                            }}
                            placeholder={`Choice #${i + 1} text`}
                            style={{ width: '100%', marginBottom: '0.5rem', background: 'none', border: 'none', borderBottom: '1px solid var(--glass-border)', color: isDark ? 'white' : '#0f172a', padding: '0.5rem 0', outline: 'none' }}
                          />
                          <input 
                            value={opt.feedback}
                            onChange={(e) => {
                              const updated = {...newScenario};
                              updated.steps.start.options[i].feedback = e.target.value;
                              setNewScenario(updated);
                            }}
                            placeholder="Feedback for this choice..."
                            style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', outline: 'none' }}
                          />
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const updated = {...newScenario};
                          updated.steps.start.options.push({ text: '', nextStep: 'success', feedback: '', points: 50 });
                          setNewScenario(updated);
                        }}
                        style={{ padding: '0.75rem', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={14} /> Add Choice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: isDark ? 'white' : '#0f172a' }}>Active Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
                       <ShieldAlert color="var(--accent-primary)" />
                       <div>
                         <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: isDark ? 'white' : '#0f172a' }}>Security Patch Deployed</p>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threaded comments and guide deletion APIs secured.</p>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: isDark ? 'white' : '#0f172a' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button onClick={handleTestEmail} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-primary)' }}>
                      <Mail size={18} /> Test Email System
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                      <Shield size={18} /> Clear Audit Logs
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                      <Users size={18} /> Export User Data
                    </button>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'sentinel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(245, 158, 11, 0.3)', background: isDark ? 'rgba(245, 158, 11, 0.05)' : '#fffbeb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.8rem', background: '#f59e0b', borderRadius: '12px', color: 'white' }}>
                    <Bot size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>AI Sentinel <span style={{ color: '#f59e0b' }}>Review Queue</span></h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Content flagged for potential toxicity or misinformation</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {guides.filter(g => g.aiStatus && g.aiStatus !== 'safe').length === 0 ? (
                  <div className="glass-card" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: 'var(--accent-success)', margin: '0 auto 1.5rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>All Clear, Commander!</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>The AI Sentinel hasn't flagged any new content.</p>
                  </div>
                ) : (
                  guides.filter(g => g.aiStatus && g.aiStatus !== 'safe').map(item => (
                    <motion.div 
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                      style={{ 
                        padding: '1.5rem', 
                        borderRadius: 'var(--radius-xl)', 
                        borderLeft: `6px solid ${item.aiStatus === 'toxic' ? '#ef4444' : '#f59e0b'}`,
                        background: isDark ? 'var(--glass-bg)' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 900, 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          background: item.aiStatus === 'toxic' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: item.aiStatus === 'toxic' ? '#ef4444' : '#f59e0b',
                          textTransform: 'uppercase'
                        }}>
                          {item.aiStatus} detected
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wiki Guide</span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.content}
                      </p>

                      <div style={{ padding: '0.75rem', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px dashed var(--glass-border)' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          SENTINEL REASON:
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', fontStyle: 'italic', color: item.aiStatus === 'toxic' ? '#ef4444' : '#f59e0b' }}>
                          "{item.aiReason || 'Suspicious patterns in language or metadata.'}"
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => handleMarkSafe(item._id, 'guide')}
                          className="btn-secondary" 
                          style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', border: '1px solid var(--accent-success)', color: 'var(--accent-success)' }}
                        >
                          <CheckCircle size={16} /> Authorize
                        </button>
                        <button 
                          onClick={() => handleDeleteGuide(item._id)}
                          className="btn-secondary" 
                          style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)' }}
                        >
                          <Trash2 size={16} /> Vanish
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '2rem', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.8rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Guardian <span className="gradient-text">Inbox</span></h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Communicate directly with your community citizens</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tickets.length === 0 ? (
                  <div className="glass-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
                    <CheckCircle size={48} style={{ opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No pending support tickets. Great work!</p>
                  </div>
                ) : (
                  tickets.map(ticket => (
                    <motion.div 
                      key={ticket._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card"
                      style={{ 
                        padding: '1.5rem', borderRadius: 'var(--radius-xl)', 
                        borderLeft: `6px solid ${ticket.status === 'pending' ? '#ef4444' : '#10b981'}`,
                        background: isDark ? 'var(--glass-bg)' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ 
                            fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: '6px',
                            background: ticket.status === 'pending' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: ticket.status === 'pending' ? '#ef4444' : '#10b981',
                            textTransform: 'uppercase', marginRight: '0.5rem'
                          }}>
                            {ticket.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From @{ticket.userName}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: isDark ? 'white' : '#0f172a', marginBottom: '1rem' }}>
                        "{ticket.message}"
                      </p>

                      {ticket.replies && ticket.replies.length > 0 && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(124, 58, 237, 0.05)', borderRadius: '10px', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>YOUR RESPONSE:</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? 'var(--text-secondary)' : '#475569' }}>
                            {ticket.replies[ticket.replies.length - 1].message}
                          </p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button 
                          onClick={() => handleReplyTicket(ticket._id)}
                          className="btn-primary" 
                          style={{ flex: 1, fontSize: '0.8rem', gap: '0.4rem', padding: '0.6rem' }}
                        >
                          <Send size={16} /> {ticket.status === 'pending' ? 'Send Reply' : 'Send Another Reply'}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
