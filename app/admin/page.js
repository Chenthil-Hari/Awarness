'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BookOpen, AlertTriangle, Trash2, CheckCircle, BarChart3, ArrowUpRight, User, ExternalLink, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, guides: 0, reports: 0 });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchAdminData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

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
        // Also dismiss the report
        await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to delete guide');
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

  // HIDDEN PAGE: If not admin, show a "404 Not Found" style UI
  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '8rem', fontWeight: 900, opacity: 0.1 }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>The page you are looking for does not exist.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: '1rem' }}>Return Home</button>
      </div>
    );
  }

  return (
    <main className="container" style={{ paddingBottom: '5rem' }}>
      <Navbar />
      
      <div style={{ marginTop: '3rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.8rem', background: 'var(--accent-primary)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
              <Shield size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>Admin <span className="gradient-text">Command</span></h1>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Secure Management Interface v2.0</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
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
              style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', borderLeft: `4px solid ${stat.color}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
                <BarChart3 size={16} style={{ opacity: 0.3 }} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>{stat.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.4rem' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          {['overview', 'reports', 'users'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                background: 'none', border: 'none', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
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
                  <div className="glass-card flex-center" style={{ padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
                    <Shield size={48} style={{ opacity: 0.2 }} />
                    <p style={{ color: 'var(--text-muted)' }}>Community is safe. No pending reports.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reports.map(report => (
                      <div key={report._id} className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ background: 'var(--accent-danger)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800 }}>{report.reason}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reported {new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{report.guideTitle}</h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>"{report.details}"</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                          <button 
                            onClick={() => window.open(`/wiki?id=${report.guideId}`, '_blank')}
                            className="btn-secondary" style={{ padding: '0.6rem' }}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button 
                            onClick={() => handleDismissReport(report._id)}
                            className="btn-secondary" style={{ padding: '0.6rem', color: 'var(--accent-success)' }}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteGuide(report.guideId, report._id)}
                            className="btn-secondary" style={{ padding: '0.6rem', color: 'var(--accent-danger)' }}
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
            <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>CITIZEN</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>USERNAME</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>EXPERIENCE (XP)</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>ROLE</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem', fontWeight: 600 }}>@{user.username}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                          <ArrowUpRight size={16} color="var(--accent-success)" />
                          {user.xp} XP
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800,
                          background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-muted)'
                        }}>
                          {user.role?.toUpperCase() || 'USER'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'overview' && (
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Active Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-lg)' }}>
                       <ShieldAlert color="var(--accent-primary)" />
                       <div>
                         <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Security Patch Deployed</p>
                         <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threaded comments and guide deletion APIs secured.</p>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}><Shield size={18} /> Clear Audit Logs</button>
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}><Users size={18} /> Export User Data</button>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
