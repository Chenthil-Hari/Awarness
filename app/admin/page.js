'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BookOpen, AlertTriangle, Trash2, CheckCircle, BarChart3, ArrowUpRight, User, ExternalLink, ShieldAlert, LogOut, Sun, Moon, Ghost } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, guides: 0, reports: 0 });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('dark');

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
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users')
      ]);
      
      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();
      const usersData = await usersRes.json();
      
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
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
        window.location.href = '/dashboard';
      }
    } catch (error) {
      alert('Failed to activate Ghost Mode');
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

  const isDark = theme === 'dark';

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: isDark ? '#0a0a0b' : '#f8fafc', 
      color: isDark ? 'white' : '#0f172a', 
      padding: '2rem',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
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
              <p style={{ color: isDark ? 'var(--text-muted)' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>SECURE SYSTEM OVERRIDE</p>
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', borderBottom: isDark ? '1px solid var(--glass-border)' : '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
          {['overview', 'reports', 'users'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', border: 'none', color: activeTab === tab ? (isDark ? 'var(--text-primary)' : '#7c3aed') : 'var(--text-muted)',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer', position: 'relative', padding: '0.5rem 1rem',
                textTransform: 'capitalize'
              }}
            >
              {tab}
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
              <table style={{ width: '100%', borderCollapse: collapse, textAlign: 'left' }}>
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

          {activeTab === 'overview' && (
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
        </div>
      </div>
    </main>
  );
}
