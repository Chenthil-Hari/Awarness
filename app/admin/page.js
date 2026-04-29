'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, BookOpen, AlertTriangle, Trash2, CheckCircle, BarChart3, ArrowUpRight, User, ExternalLink, ShieldAlert, LogOut, Sun, Moon, Ghost, Mail, Command, Bot, Zap, Eye, EyeOff, Layout, Plus, Minus, Save, Globe, Send, Sparkles, ShieldCheck, Vote, Map as MapIcon, ThumbsUp, ThumbsDown, Trophy, Calendar, Image as ImageIcon, Folder, FileText, Upload, Key, Lock, Workflow, Activity, Settings } from 'lucide-react';
import AdminCommandBar from '../components/AdminCommandBar';
import * as XLSX from 'xlsx';
import { getPusherClient } from '@/lib/pusher';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, guides: 0, reports: 0 });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [pendingMissions, setPendingMissions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState([]);
  const [config, setConfig] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [allGuides, setAllGuides] = useState([]);
  const [activityLog, setActivityLog] = useState([
    { id: 1, type: 'login', user: 'System', time: 'Just now', msg: 'Core protocols initialized' },
    { id: 2, type: 'security', user: 'Sentinel', time: '1m ago', msg: 'Neural firewall active' }
  ]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [heatmapDots, setHeatmapDots] = useState([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [broadcastType, setBroadcastType] = useState('announcement');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [polls, setPolls] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [roles, setRoles] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [newTournament, setNewTournament] = useState({ title: '', prizePool: 1000, duration: 24 });
  const [theme, setTheme] = useState('dark');
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [configPoll, setConfigPoll] = useState(null);
  const [selectedCorrectOptions, setSelectedCorrectOptions] = useState([]);
  const [rewardXP, setRewardXP] = useState(50);
  const [isPublishing, setIsPublishing] = useState(false);
  const [blockedIPs, setBlockedIPs] = useState(['192.168.1.1', '45.76.12.33']);
  const [newBadge, setNewBadge] = useState({ name: '', icon: 'Zap', color: '#f59e0b', xpRequired: 500 });
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
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([
    { id: 'start', title: 'Phishing Hook', x: 50, y: 150, type: 'trigger' },
    { id: 'q1', title: 'Check Link?', x: 250, y: 100, type: 'question' },
    { id: 'q2', title: 'Input Pass?', x: 250, y: 200, type: 'question' },
    { id: 'end', title: 'Success', x: 450, y: 150, type: 'outcome' }
  ]);

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
      
      // Real-time listener for Admin
      const pusher = getPusherClient();
      if (pusher) {
        const channel = pusher.subscribe('polls');
        channel.bind('poll-updated', (data) => {
          console.log('Admin: Real-time update received:', data);
          fetchAdminData();
        });

        return () => {
          channel.unbind_all();
          channel.unsubscribe();
        };
      }
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
      const [statsRes, reportsRes, usersRes, ticketsRes, missionsRes, auditRes, configRes, analyticsRes, guidesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users'),
        fetch('/api/admin/support'),
        fetch('/api/admin/pending-missions'),
        fetch('/api/admin/audit'),
        fetch('/api/admin/config'),
        fetch('/api/admin/analytics'),
        fetch('/api/guides')
      ]);

      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();
      const usersData = await usersRes.json();
      const ticketsData = await ticketsRes.json();
      const missionsData = await missionsRes.json();
      const auditData = await auditRes.json();
      const configData = await configRes.json();
      const analyticsData = await analyticsRes.json();
      const guidesData = await guidesRes.json();

      setStats(statsData);
      setReports(reportsData);
      setUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));
      setTickets(ticketsData.tickets || []);
      setPendingMissions(missionsData.missions || []);
      setAuditLogs(auditData || []);
      setConfig(configData);
      setAnalytics(analyticsData);
      setAllGuides(guidesData || []);
      
      setAnalytics(analyticsData);
      setAllGuides(guidesData || []);
      
      // Fetch Democracy data
      try {
        const [ipRes, badgeRes, pollsRes, suggRes, tourRes, assetRes, rolesRes] = await Promise.all([
          fetch('/api/admin/security/blocklist'),
          fetch('/api/admin/badges'),
          fetch('/api/admin/polls'),
          fetch('/api/admin/suggestions'),
          fetch('/api/admin/tournaments'),
          fetch('/api/admin/assets'),
          fetch('/api/admin/roles')
        ]);
        if (ipRes.ok) setBlockedIPs(await ipRes.json());
        if (pollsRes.ok) setPolls(await pollsRes.json());
        if (suggRes.ok) setSuggestions(await suggRes.json());
        if (tourRes.ok) setTournaments(await tourRes.json());
        if (assetRes.ok) setAssets(await assetRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
        
        const [heatmapRes, forecastRes] = await Promise.all([
          fetch('/api/admin/heatmap'),
          fetch('/api/admin/analytics/forecast')
        ]);
        if (heatmapRes.ok) setHeatmapDots(await heatmapRes.json());
        if (forecastRes.ok) setForecast(await forecastRes.json());
      } catch (err) {
        console.error("New modules fetch error:", err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuide = async (guideId, reportId = null) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;
    try {
      const res = await fetch(`/api/guides/${guideId}`, { method: 'DELETE' });
      if (res.ok) {
        if (reportId) {
          await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
        }
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to delete guide');
    }
  };

  const handleDeployFlow = async () => {
    try {
      const scenario = {
        title: `Flow_${Date.now()}`,
        category: 'Custom Flow',
        difficulty: 'Advanced',
        description: 'Visual flow designed via Admin Designer',
        xpReward: 250,
        steps: nodes.reduce((acc, node) => {
          acc[node.id] = { text: node.title, options: [] };
          return acc;
        }, {})
      };
      
      const res = await fetch('/api/admin/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });
      if (res.ok) {
        alert('Simulation flow sequence deployed and saved to database!');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to deploy simulation flow');
    }
  };

  const handleAutoLayout = () => {
    alert('Applying force-directed graph layout to simulation nodes...');
    setNodes(prev => prev.map((n, i) => ({ ...n, x: 50 + (i * 150), y: 150 + (i % 2 === 0 ? -50 : 50) })));
  };

  const handlePublishPoll = async (pollId) => {
    const poll = polls.find(p => p._id === pollId);
    if (!poll) return;
    setConfigPoll(poll);
    setSelectedCorrectOptions([]);
    setRewardXP(50);
  };

  const finalizePublication = async () => {
    if (!configPoll || isPublishing) return;
    setIsPublishing(true);
    
    console.log('Finalizing Poll:', configPoll._id, {
      correctOptionIds: selectedCorrectOptions,
      xpAmount: rewardXP
    });

    try {
      const res = await fetch(`/api/admin/polls/${configPoll._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'published', 
          correctOptionIds: selectedCorrectOptions,
          xpAmount: rewardXP
        })
      });
      
      const data = await res.json();
      console.log('Publication Response:', data);

      if (res.ok) {
        alert(`Success! Results published. ${data.rewardedCount || 0} users rewarded with +${rewardXP} XP.`);
        setConfigPoll(null);
        fetchAdminData();
      } else {
        alert(`Error: ${data.error || 'Failed to publish results'}`);
      }
    } catch (err) {
      console.error('Publication Error:', err);
      alert('Failed to publish results. Check console for details.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm('PERMANENTLY PURGE THIS POLL? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId })
      });
      if (res.ok) {
        alert('Poll successfully purged from system.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to delete poll');
    }
  };

  const handleUploadAsset = async () => {
    const name = prompt("Enter asset name:");
    if (!name) return;
    
    try {
      const res = await fetch('/api/admin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: 'image/png',
          size: '1.5 MB',
          url: '/images/custom-asset.png',
          category: 'Admin Upload'
        })
      });
      if (res.ok) {
        alert(`Asset "${name}" successfully registered in Cloud Vault.`);
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to upload asset');
    }
  };

  const handlePurgeAsset = (assetName) => {
    if (confirm(`Are you sure you want to permanently purge ${assetName}?`)) {
      alert(`${assetName} has been wiped from the edge nodes.`);
    }
  };

  const handleMissionAction = async (missionId, action) => {
    try {
      const res = await fetch('/api/admin/approve-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, action })
      });
      if (res.ok) {
        setPendingMissions(prev => prev.filter(m => m._id !== missionId));
        alert(`Mission ${action}d successfully`);
      }
    } catch (error) {
      alert('Action failed');
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
    alert(`Attempting to dismiss report: ${reportId}`);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        const errorData = await res.json();
        alert(`Failed to dismiss report: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error while dismissing report');
    }
  };

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
        setAllGuides(guidesData);
      }
    } catch (error) {
      alert('Failed to authorize content');
    }
  };

  const handleBlockIP = async (ip, action = 'block') => {
    try {
      const res = await fetch('/api/admin/security/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, action })
      });
      if (res.ok) {
        if (action === 'block') setBlockedIPs(prev => [...prev, ip]);
        else setBlockedIPs(prev => prev.filter(x => x !== ip));
        alert(`IP ${action === 'block' ? 'banned' : 'unbanned'} successfully`);
      }
    } catch (err) {
      alert('Security update failed');
    }
  };

  const handlePublishBadge = async () => {
    if (!newBadge.name) return alert('Badge name required');
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBadge)
      });
      if (res.ok) {
        alert('Badge published and added to vault!');
        setNewBadge({ name: '', icon: 'Zap', color: '#f59e0b', xpRequired: 500 });
      }
    } catch (err) {
      alert('Failed to publish badge');
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || newPoll.options.some(o => !o)) return alert('Question and all options are required');
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoll)
      });
      if (res.ok) {
        alert('Poll deployed to community!');
        setNewPoll({ question: '', options: ['', ''] });
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to deploy poll');
    }
  };

  const handleReviewSuggestion = async (id, status) => {
    try {
      const res = await fetch('/api/admin/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setSuggestions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      }
    } catch (err) {
      alert('Failed to update suggestion');
    }
  };

  const handleCreateTournament = async () => {
    if (!newTournament.title) return alert('Tournament title is required');
    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament)
      });
      if (res.ok) {
        alert('Tournament scheduled successfully!');
        setNewTournament({ title: '', prizePool: 1000, duration: 24 });
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to schedule tournament');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
        alert('Citizen role updated');
      }
    } catch (err) {
      alert('Failed to update role');
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

  const handleUpdateConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfig(newConfig);
        alert('Configuration updated successfully');
      }
    } catch (error) {
      alert('Failed to update configuration');
    }
  };

  const handleRewardUser = async (userId, xpAmount, reason) => {
    try {
      const res = await fetch('/api/admin/users/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, xpAmount, reason })
      });
      if (res.ok) {
        alert('Reward issued successfully!');
        fetchAdminData();
      }
    } catch (error) {
      alert('Failed to issue reward');
    }
  };

  const handleTerminalCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = terminalInput.toLowerCase().trim();
    setTerminalInput('');

    const logEntry = (msg, type = 'system') => {
      setActivityLog(prev => [{ id: Date.now(), type, user: 'Admin', time: 'Just now', msg }, ...prev.slice(0, 19)]);
    };

    if (cmd === '/clear') {
      setActivityLog([]);
      return;
    }

    if (cmd === '/maintenance on') {
      handleUpdateConfig({ ...config, maintenanceMode: true });
      logEntry('Maintenance mode activated via shell', 'security');
    } else if (cmd === '/maintenance off') {
      handleUpdateConfig({ ...config, maintenanceMode: false });
      logEntry('Maintenance mode deactivated via shell', 'security');
    } else if (cmd.startsWith('/reward')) {
      const parts = cmd.split(' ');
      if (parts.length >= 3) {
        logEntry(`Issued reward of ${parts[2]} XP via shell`, 'reward');
        alert('Reward command queued. Processing...');
      }
    } else {
      logEntry(`Unknown command: ${cmd}`, 'error');
    }
  };

  const handleExportUsers = () => {
    try {
      const exportData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Username: user.username,
        XP: user.xp || 0,
        Role: user.role || 'user',
        Joined: new Date(user.createdAt).toLocaleDateString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Citizens");

      XLSX.writeFile(workbook, `Awareness_Citizens_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      alert('Failed to generate Excel report');
      console.error(error);
    }
  };


  const isDark = theme === 'dark';

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

  return (
    <>
    <main style={{ 
      minHeight: '100vh', 
      background: isDark ? 'var(--bg-main)' : '#f8fafc', 
      color: isDark ? 'var(--text-primary)' : '#0f172a',
      display: 'flex'
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

      {/* Fixed Vertical Sidebar */}
      <aside style={{
        width: '280px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: isDark ? 'rgba(0,0,0,0.3)' : 'white',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1rem',
        zIndex: 100,
        overflowY: 'auto'
      }} className="no-scrollbar">
        <div style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="white" />
            </div>
            COMMAND <span className="gradient-text">CENTER</span>
          </h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { id: 'overview', icon: <Globe size={18} />, label: 'Overview' },
            { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
            { id: 'users', icon: <Users size={18} />, label: 'Citizens' },
            { id: 'cms', icon: <BookOpen size={18} />, label: 'Wiki CMS' },
            { id: 'missions', icon: <Zap size={18} />, label: 'Missions' },
            { id: 'reports', icon: <ShieldAlert size={18} />, label: 'Reports' },
            { id: 'democracy', icon: <Vote size={18} />, label: 'Democracy' },
            { id: 'designer', icon: <Workflow size={18} />, label: 'Designer' },
            { id: 'tournaments', icon: <Trophy size={18} />, label: 'Sprints' },
            { id: 'assets', icon: <Folder size={18} />, label: 'Cloud Vault' },
            { id: 'permissions', icon: <Key size={18} />, label: 'Permissions' },
            { id: 'security', icon: <Shield size={18} />, label: 'Security' },
            { id: 'achievements', icon: <Sparkles size={18} />, label: 'Badges' },
            { id: 'audit', icon: <Activity size={18} />, label: 'Audit' },
            { id: 'config', icon: <Settings size={18} />, label: 'Config' },
            { id: 'email', icon: <Mail size={18} />, label: 'Email' },
            { id: 'support', icon: <Bot size={18} />, label: 'Support' },
            { id: 'broadcast', icon: <Send size={18} />, label: 'Broadcast' },
            { id: 'sentinel', icon: <Eye size={18} />, label: 'Sentinel' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id 
                  ? 'var(--accent-primary)' 
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : (isDark ? 'rgba(255,255,255,0.5)' : '#64748b'),
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.id ? '0 10px 20px rgba(124, 58, 237, 0.2)' : 'none'
              }}
            >
              <div style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={toggleTheme} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={() => signOut()} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.8rem', color: 'var(--accent-danger)' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '280px', padding: '2rem 3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>Welcome back, <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{session?.user?.name}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsCommandBarOpen(true)} className="btn-secondary" style={{ gap: '0.5rem' }}>
              <Command size={18} /> <span style={{ fontSize: '0.8rem' }}>CTRL+K</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
          
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
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? 'white' : '#0f172a' }}>{report.guideTitle || 'Unknown / Deleted Strategy'}</h4>
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

          {activeTab === 'missions' && (
            <div className="grid-container" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Zap color="#f59e0b" size={20} /> MISSION MODERATION QUEUE
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '0.25rem' }}>Review community-created missions before deployment.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingMissions.length > 0 ? pendingMissions.map((mission) => (
                    <div key={mission._id} style={{ padding: '1.5rem', borderRadius: '12px', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{mission.title}</h4>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>Creator: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{mission.creatorName}</span> • {mission.phases?.length} Phases • {mission.mode}</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>{mission.description}</p>

                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Payload Overview</p>
                          {mission.phases?.slice(0, 2).map((p, i) => (
                            <div key={i} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>P{i + 1}:</span> {p.title} ({p.questions?.length} Questions)
                            </div>
                          ))}
                          {mission.phases?.length > 2 && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>...and {mission.phases.length - 2} more phases</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleMissionAction(mission._id, 'approve')}
                          className="btn-primary"
                          style={{ padding: '0.5rem 1rem', background: 'var(--accent-success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <CheckCircle size={14} /> APPROVE
                        </button>
                        <button
                          onClick={() => handleMissionAction(mission._id, 'reject')}
                          style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <Trash2 size={14} /> REJECT
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <Ghost size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                      <p>No missions pending moderation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleRewardUser(user._id, 100, 'Manual Admin Reward')}
                                title="Reward 100 XP"
                                style={{ color: 'var(--accent-success)', opacity: 0.8 }}
                              >
                                <Zap size={16} />
                              </button>
                              <button
                                onClick={() => handleImpersonate(user._id, user.username)}
                                title="Ghost Mode (Impersonate)"
                                style={{ color: 'var(--accent-secondary)', opacity: 0.6 }}
                              >
                                <Ghost size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cms' && (
            <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isDark ? 'var(--bg-tertiary)' : '#f1f5f9', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>STRATEGY TITLE</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>CATEGORY</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>AUTHOR</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {allGuides.map((guide, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{guide.title}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{guide.category}</td>
                      <td style={{ padding: '1rem' }}>{guide.authorName}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, background: guide.aiStatus === 'safe' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: guide.aiStatus === 'safe' ? '#10b981' : '#f59e0b' }}>
                          {guide.aiStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => handleDeleteGuide(guide._id)} style={{ color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
               <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>User Growth (Last 30 Days)</h3>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    {analytics?.userGrowth?.map((d, i) => (
                      <div key={i} title={`${d._id}: ${d.count}`} style={{ flex: 1, background: 'var(--accent-primary)', height: `${(d.count / Math.max(...(analytics.userGrowth.length > 0 ? analytics.userGrowth.map(x => x.count) : [1]))) * 100}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
                    ))}
                  </div>
               </div>
               <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Wiki Categories</h3>
                  {analytics?.guideStats?.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{c._id || 'Uncategorized'}</span>
                      <span style={{ fontWeight: 800 }}>{c.count}</span>
                    </div>
                  ))}
               </div>
               <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Top Citizens</h3>
                  {analytics?.topEarners?.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                      <span style={{ width: '20px', fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-primary)' }}>#{i+1}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{u.username}</p>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{u.xp} XP</span>
                    </div>
                  ))}
                </div>

              {/* Phase 7: Predictive AI Section */}
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(124, 58, 237, 0.2)', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), transparent)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Bot size={20} color="var(--accent-primary)" /> AI Risk Shield
                  </h3>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{forecast?.riskScore}%</div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>NETWORK RISK SCORE</p>
                    <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>TRENDING DOWN (SAFE)</div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.8rem' }}>CONTENT GAPS IDENTIFIED</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {forecast?.contentGaps?.map(gap => (
                        <div key={gap} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{gap}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Predicted Activity (7D Forecast)</h3>
                  <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '1.5rem', paddingBottom: '2rem' }}>
                    {forecast?.predictedActiveUsers?.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '100%', background: 'rgba(124, 58, 237, 0.2)', height: `${(d.count / 250) * 100}%`, borderRadius: '8px 8px 0 0', position: 'relative' }}>
                          <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} style={{ width: '100%', background: 'var(--accent-primary)', borderRadius: '8px 8px 0 0' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isDark ? 'var(--bg-tertiary)' : '#f1f5f9', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>OPERATOR</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>ACTION</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>DETAILS</th>
                    <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '1rem', fontWeight: 700 }}>{log.userName}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>{log.action}</span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{log.details}</td>
                      <td style={{ padding: '1rem', fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} color="var(--accent-primary)" /> System Overrides
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>Maintenance Mode</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lock down the platform for all non-admins</p>
                    </div>
                    <button
                      onClick={() => handleUpdateConfig({ ...config, maintenanceMode: !config?.maintenanceMode })}
                      style={{
                        width: '50px', height: '24px', borderRadius: '12px', background: config?.maintenanceMode ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        border: 'none', position: 'relative', cursor: 'pointer'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '2px', left: config?.maintenanceMode ? '28px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>New Registrations</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allow or block new citizen sign-ups</p>
                    </div>
                    <button
                      onClick={() => handleUpdateConfig({ ...config, registrationEnabled: !config?.registrationEnabled })}
                      style={{
                        width: '50px', height: '24px', borderRadius: '12px', background: config?.registrationEnabled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        border: 'none', position: 'relative', cursor: 'pointer'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '2px', left: config?.registrationEnabled ? '28px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Template Vault</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Welcome Email', 'Password Reset', 'Security Alert', 'Reward Earned', 'Support Response'].map(t => (
                    <button key={t} style={{ textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Template Architect</h3>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}><Save size={16} /> Save Changes</button>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', minHeight: '400px', border: '1px solid var(--glass-border)', fontFamily: 'monospace', fontSize: '0.9rem', color: '#10b981' }}>
                  &lt;!DOCTYPE html&gt;<br/>
                  &lt;html&gt;<br/>
                  &nbsp;&nbsp;&lt;body style="background: #0f172a; color: white;"&gt;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;&lt;h1&gt;Welcome to Awareness Pro, &#123;&#123;name&#125;&#125;!&lt;/h1&gt;<br/>
                  &nbsp;&nbsp;&lt;/body&gt;<br/>
                  &lt;/html&gt;
                </div>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="grid-container" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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

                      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleReplyTicket(ticket._id)}
                          className="btn-secondary"
                          style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', gap: '0.5rem' }}
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

          {activeTab === 'designer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', height: '600px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Workflow size={20} color="var(--accent-primary)" /> Simulation Flow Designer
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleAutoLayout} className="btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>AUTO-LAYOUT</button>
                    <button onClick={handleDeployFlow} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}><Save size={16} /> DEPLOY FLOW</button>
                  </div>
                </div>

                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {nodes.map((node, i) => i < nodes.length - 1 && (
                    <line 
                      key={i} 
                      x1={node.x + 100} y1={node.y + 30} 
                      x2={nodes[i+1].x} y2={nodes[i+1].y + 30} 
                      stroke="var(--accent-primary)" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" 
                    />
                  ))}
                </svg>

                {nodes.map(node => (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, x: n.x + info.delta.x, y: n.y + info.delta.y } : n));
                    }}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: '180px',
                      padding: '1rem',
                      background: isDark ? 'rgba(10, 10, 11, 0.95)' : 'white',
                      border: `1px solid ${selectedNode === node.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                      borderRadius: '12px',
                      cursor: 'grab',
                      boxShadow: selectedNode === node.id ? '0 0 20px rgba(124, 58, 237, 0.3)' : '0 10px 25px rgba(0,0,0,0.2)',
                      zIndex: selectedNode === node.id ? 100 : 1
                    }}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.type === 'trigger' ? '#f59e0b' : node.type === 'outcome' ? '#10b981' : 'var(--accent-primary)' }} />
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5 }}>{node.type}</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: '0.85rem' }}>{node.title}</p>
                  </motion.div>
                ))}

                <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', zIndex: 10 }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Node Controls</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem' }}><Plus size={14} /></button>
                    <button className="btn-secondary" style={{ padding: '0.4rem' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Key size={20} color="var(--accent-primary)" /> Defined Roles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {roles.map(role => (
                    <div key={role.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800 }}>{role.name}</span>
                        <Lock size={14} style={{ opacity: 0.3 }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {role.permissions.map(p => (
                          <span key={p} style={{ fontSize: '0.6rem', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Team Management</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {users.filter(u => u.role !== 'user').map(u => (
                    <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} /></div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>{u.name}</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{u.username}</p>
                        </div>
                      </div>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}
                      >
                        <option value="admin">Super Admin</option>
                        <option value="moderator">Junior Moderator</option>
                        <option value="creator">Content Creator</option>
                        <option value="user">Revoke Access</option>
                      </select>
                    </div>
                  ))}
                  {users.filter(u => u.role !== 'user').length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>No administrators currently assigned.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Folder size={20} color="var(--accent-primary)" /> Asset Library
                  </h3>
                  <button onClick={handleUploadAsset} className="btn-primary" style={{ padding: '0.6rem 1.2rem', gap: '0.5rem' }}><Upload size={16} /> UPLOAD ASSET</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {assets.map(asset => (
                    <div key={asset.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                      <div style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        {asset.type.includes('image') ? <ImageIcon size={32} opacity={0.3} /> : <FileText size={32} opacity={0.3} />}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</p>
                      <p style={{ margin: '0.2rem 0 0.8rem 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{asset.size} • {asset.category}</p>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => alert('Opening edge preview...')} className="btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.65rem' }}>PREVIEW</button>
                        <button onClick={() => handlePurgeAsset(asset.name)} className="btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.65rem', color: 'var(--accent-danger)' }}>PURGE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Trophy size={20} color="#f59e0b" /> Tournament Manager
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>TOURNAMENT TITLE</label>
                      <input 
                        value={newTournament.title} 
                        onChange={e => setNewTournament({...newTournament, title: e.target.value})} 
                        placeholder="e.g. Summer Awareness Sprint" 
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>PRIZE POOL (XP)</label>
                      <input 
                        type="number" 
                        value={newTournament.prizePool} 
                        onChange={e => setNewTournament({...newTournament, prizePool: parseInt(e.target.value) || 0})} 
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} 
                      />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.03)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 900, color: '#f59e0b', marginBottom: '1rem' }}>EVENT PREVIEW</p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Trophy size={32} color="#f59e0b" />
                      <div>
                        <h4 style={{ margin: 0 }}>{newTournament.title || 'Upcoming Event'}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6 }}>Duration: {newTournament.duration} Hours</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800 }}>Total Reward: <span style={{ color: '#f59e0b' }}>{newTournament.prizePool} XP</span></p>
                    </div>
                  </div>
                </div>
                <button onClick={handleCreateTournament} className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: '#f59e0b', color: 'black' }}>DEPLOY TOURNAMENT</button>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Active Sprints</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tournaments.map(t => (
                    <div key={t._id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800 }}>{t.title}</span>
                        <span style={{ fontSize: '0.6rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> Ends in 14h 22m
                      </div>
                    </div>
                  ))}
                  {tournaments.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>No active tournaments</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'democracy' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Vote size={20} color="var(--accent-primary)" /> Poll Architect
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>POLL QUESTION</label>
                    <input 
                      value={newPoll.question} 
                      onChange={e => setNewPoll({...newPoll, question: e.target.value})} 
                      placeholder="e.g. Which awareness topic should we focus on next?" 
                      style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: isDark ? 'white' : '#0f172a' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>OPTIONS</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {newPoll.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            value={opt} 
                            onChange={e => {
                              const newOpts = [...newPoll.options];
                              newOpts[i] = e.target.value;
                              setNewPoll({...newPoll, options: newOpts});
                            }}
                            placeholder={`Option ${i+1}`} 
                            style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} 
                          />
                          {newPoll.options.length > 2 && (
                            <button onClick={() => setNewPoll({...newPoll, options: newPoll.options.filter((_, idx) => idx !== i)})} style={{ color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={16} /></button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})} className="btn-secondary" style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.75rem' }}><Plus size={14} /> Add Option</button>
                    </div>
                  </div>
                  <button onClick={handleCreatePoll} className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>DEPLOY GLOBAL POLL</button>
                </div>

                <div style={{ marginTop: '3rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Active Polls & Sentiment</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {polls.map(poll => (
                      <div key={poll._id} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <p style={{ margin: 0, fontWeight: 700 }}>{poll.question}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{poll.options.reduce((a, b) => a + (b.votes || 0), 0)} Votes</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          {poll.options.map((opt, i) => {
                            const total = poll.options.reduce((a, b) => a + (b.votes || 0), 0);
                            const percent = total > 0 ? Math.round(((opt.votes || 0) / total) * 100) : 0;
                            return (
                              <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                                  <span>{opt.text}</span>
                                  <span style={{ fontWeight: 800 }}>{percent}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} style={{ height: '100%', background: poll.status === 'published' ? 'var(--accent-success)' : 'var(--accent-primary)' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                          {poll.status !== 'published' ? (
                            <button 
                              onClick={() => handlePublishPoll(poll._id)}
                              className="btn-secondary" 
                              style={{ flex: 2, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            >
                              <CheckCircle size={16} /> PUBLISH RESULTS
                            </button>
                          ) : (
                            <div style={{ flex: 2, textAlign: 'center', padding: '0.8rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', color: '#10b981', fontSize: '0.7rem', fontWeight: 800 }}>
                              RESULTS PUBLISHED
                            </div>
                          )}
                          <button 
                            onClick={() => handleDeletePoll(poll._id)}
                            className="btn-secondary" 
                            style={{ flex: 1, color: 'var(--accent-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' }}>Suggestion Box</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {suggestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No suggestions yet</div>
                  ) : (
                    suggestions.map(s => (
                      <div key={s._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>"{s.text}"</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>by @{s.userName}</span>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleReviewSuggestion(s._id, 'approved')} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent-success)' }}><ThumbsUp size={14} /></button>
                            <button onClick={() => handleReviewSuggestion(s._id, 'rejected')} className="btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent-danger)' }}><ThumbsDown size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldAlert color="var(--accent-danger)" /> Threat Intelligence
                </h3>
                <div style={{ height: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'radial-gradient(circle, var(--accent-danger) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div style={{ padding: '1rem', position: 'relative', zIndex: 1 }}>
                    <p style={{ color: 'var(--accent-danger)', fontSize: '0.7rem', fontWeight: 900, marginBottom: '1rem' }}>LIVE ATTACK VECTORS</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px' }}>
                          <span style={{ fontFamily: 'monospace' }}>182.44.{Math.floor(Math.random()*255)}.{Math.floor(Math.random()*255)}</span>
                          <span style={{ color: 'var(--accent-danger)', fontWeight: 800 }}>BLOCKED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>IP Blocklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {blockedIPs.map(ip => (
                    <div key={ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{ip}</span>
                      <button onClick={() => handleBlockIP(ip, 'unblock')} style={{ color: 'var(--accent-danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input 
                      id="ip-input"
                      placeholder="Add IP to ban..." 
                      style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} 
                    />
                    <button 
                      onClick={() => {
                        const val = document.getElementById('ip-input').value;
                        if (val) handleBlockIP(val, 'block');
                      }}
                      className="btn-primary" style={{ padding: '0.6rem 1rem' }}
                    >BAN</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' }}>Badge Architect</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>BADGE NAME</label>
                      <input value={newBadge.name} onChange={e => setNewBadge({...newBadge, name: e.target.value})} placeholder="e.g. Master Cipher" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>XP THRESHOLD</label>
                      <input type="number" value={newBadge.xpRequired} onChange={e => setNewBadge({...newBadge, xpRequired: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: isDark ? 'white' : '#0f172a' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(124, 58, 237, 0.03)', borderRadius: '16px', border: '2px dashed rgba(124, 58, 237, 0.2)' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem' }}>LIVE PREVIEW</p>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: newBadge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 25px ${newBadge.color}44` }}>
                      <Bot size={40} color="white" />
                    </div>
                    <h4 style={{ margin: '1rem 0 0.2rem 0', fontWeight: 900 }}>{newBadge.name || 'Untitled Badge'}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{newBadge.xpRequired} XP Required</p>
                  </div>
                </div>
                <button onClick={handlePublishBadge} className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>PUBLISH ACHIEVEMENT</button>
              </div>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Active Badges</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {['Bug Hunter', 'Security First', 'Top Scholar'].map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={16} color="white" /></div>
                      <span style={{ fontWeight: 700 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '0.8rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
                    <Globe size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Global <span className="gradient-text">Broadcast</span></h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Send high-priority dispatches to all platform citizens</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>DISPATCH SUBJECT</label>
                      <input
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        placeholder="e.g. Scheduled System Maintenance"
                        style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>ANNOUNCEMENT TYPE</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setBroadcastType('announcement')}
                          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: broadcastType === 'announcement' ? 'var(--accent-primary)' : 'none', color: broadcastType === 'announcement' ? 'white' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Announcement
                        </button>
                        <button
                          onClick={() => setBroadcastType('maintenance')}
                          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: broadcastType === 'maintenance' ? 'var(--accent-primary)' : 'none', color: broadcastType === 'maintenance' ? 'white' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Maintenance
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>MESSAGE PAYLOAD</label>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Citizens of Awareness Pro, please be advised..."
                        style={{ width: '100%', height: '200px', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--text-primary)', resize: 'none', lineHeight: 1.6 }}
                      />
                    </div>

                    <button
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.innerText = 'SENDING...';
                        btn.disabled = true;
                        try {
                          const res = await fetch('/api/admin/broadcast', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject: broadcastSubject, message: broadcastMessage, type: broadcastType })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert(data.message);
                            setBroadcastSubject('');
                            setBroadcastMessage('');
                          } else {
                            alert(data.error);
                          }
                        } catch (err) {
                          alert('Failed to send broadcast');
                        } finally {
                          btn.innerText = 'DEPLOY BROADCAST';
                          btn.disabled = false;
                        }
                      }}
                      className="btn-primary"
                      style={{ width: '100%', padding: '1.2rem', gap: '0.75rem', fontSize: '1rem', boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)' }}
                    >
                      <Zap size={20} /> DEPLOY BROADCAST
                    </button>
                  </div>

                  <div style={{ padding: '2rem', background: 'rgba(124, 58, 237, 0.03)', borderRadius: '16px', border: '1px dashed var(--accent-primary)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={18} color="var(--accent-primary)" /> Dispatch Guidelines
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
                      <li>Broadcasts are sent to <strong>ALL</strong> registered citizens instantly.</li>
                      <li>Use <strong>Maintenance</strong> type for server downtimes or updates.</li>
                      <li>HTML is not supported in the message box, but line breaks are preserved.</li>
                      <li>Avoid sending more than one broadcast per 24 hours to prevent spam filters.</li>
                      <li>Subject lines should be clear and professional.</li>
                    </ul>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: isDark ? 'rgba(255,255,255,0.02)' : 'white', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>NETWORK REACH</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 900 }}>{stats.users} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-success)' }}>Active Citizens</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: isDark ? 'white' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Globe size={20} color="var(--accent-primary)" /> Global Threat Map
                  </h3>
                  <div style={{ 
                    height: '400px', 
                    background: 'rgba(0,0,0,0.4)', 
                    borderRadius: '16px', 
                    position: 'relative', 
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {/* Simulated World Map SVG */}
                    <svg viewBox="0 0 1000 500" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, fill: 'var(--accent-primary)' }}>
                      <path d="M150,100 Q400,50 850,100 T150,400 T150,100" opacity="0.3" fill="none" stroke="currentColor" strokeWidth="1" />
                      <circle cx="200" cy="150" r="2" /> <circle cx="400" cy="250" r="2" /> <circle cx="700" cy="180" r="2" />
                    </svg>
                    
                    {heatmapDots.map(dot => (
                      <motion.div
                        key={dot.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 2, 1.5], opacity: [0, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                        style={{
                          position: 'absolute',
                          left: `${dot.x}%`,
                          top: `${dot.y}%`,
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          boxShadow: '0 0 15px var(--accent-primary)',
                          zIndex: 2
                        }}
                      />
                    ))}

                    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} /> LIVE SIMULATIONS
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-danger)' }} /> SECURITY BREACHES
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: isDark ? 'white' : '#0f172a' }}>Active Notifications</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
                      <ShieldAlert color="var(--accent-primary)" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: isDark ? 'white' : '#0f172a' }}>Global Network Analysis</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulation traffic is currently up 14% in the last hour.</p>
                      </div>
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
                  <button onClick={handleExportUsers} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                    <Users size={18} /> Export User Data (Excel)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sentinel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', background: isDark ? 'var(--glass-bg)' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ padding: '0.8rem', background: 'var(--accent-primary)', borderRadius: '12px', color: 'white' }}>
                    <Bot size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Sentinel <span className="gradient-text">Moderation</span></h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI-Powered content monitoring and authorization</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {allGuides.filter(g => g.aiStatus !== 'safe').map(guide => (
                    <div key={guide._id} className="glass-card" style={{ padding: '1.5rem', background: isDark ? 'rgba(255,255,255,0.02)' : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>AI_FLAGGED</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{guide.category}</span>
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>{guide.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Reason: {guide.aiReason || 'Potential violation of community standards'}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleMarkSafe(guide._id, 'guide')} className="btn-primary" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent-success)', fontSize: '0.75rem' }}>AUTHORIZE</button>
                        <button onClick={() => handleDeleteGuide(guide._id)} className="btn-secondary" style={{ flex: 1, padding: '0.6rem', color: 'var(--accent-danger)', fontSize: '0.75rem' }}>PURGE</button>
                      </div>
                    </div>
                  ))}
                  {allGuides.filter(g => g.aiStatus !== 'safe').length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <CheckCircle size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                      <p>All content has been cleared by the Sentinel.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* System Shell Terminal */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        <AnimatePresence>
          {isTerminalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card"
              style={{
                width: '400px',
                height: '300px',
                marginBottom: '1rem',
                background: 'rgba(0,0,0,0.95)',
                border: '1px solid var(--accent-primary)',
                borderRadius: '16px',
                padding: '1.2rem',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
                  <span style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>SYSTEM_SHELL v2.4</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>CONNECTED // SECURE</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.85rem', color: '#10b981', marginBottom: '1rem' }} className="no-scrollbar">
                <p style={{ margin: '0 0 0.8rem 0', opacity: 0.5, fontSize: '0.7rem' }}># GDI_OS KERNEL LOADED...</p>
                {activityLog.slice(0, 8).reverse().map(log => (
                  <p key={log.id} style={{ margin: '0 0 0.4rem 0', display: 'flex', gap: '0.8rem' }}>
                    <span style={{ opacity: 0.3, minWidth: '70px' }}>[{new Date(log.id).toLocaleTimeString()}]</span> 
                    <span>{log.msg}</span>
                  </p>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>$</span>
                <input 
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalCommand}
                  placeholder="Enter system command..."
                  style={{ background: 'none', border: 'none', outline: 'none', color: '#10b981', width: '100%', fontSize: '0.85rem', fontFamily: 'inherit' }}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: isTerminalOpen ? '#ef4444' : '#7c3aed',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isTerminalOpen 
                ? '0 0 40px rgba(239, 68, 68, 0.4)' 
                : '0 0 40px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isTerminalOpen ? 'rotate(135deg) scale(0.9)' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Command size={28} />
            {!isTerminalOpen && (
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                width: '8px', 
                height: '8px', 
                background: '#10b981', 
                borderRadius: '50%', 
                boxShadow: '0 0 10px #10b981' 
              }} />
            )}
          </button>
        </div>
      </div>
    </main>

    {/* Poll Publication & Reward Modal */}
    <AnimatePresence>
      {configPoll && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card" 
            style={{ width: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--accent-primary)' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Challenge <span className="gradient-text">Configuration</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Define the correct answers and set the XP reward for this community challenge.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>Correct Options</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {configPoll.options.map(opt => (
                    <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCorrectOptions.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCorrectOptions([...selectedCorrectOptions, opt.id]);
                          else setSelectedCorrectOptions(selectedCorrectOptions.filter(id => id !== opt.id));
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.6rem' }}>XP Reward Amount</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="number" 
                    value={rewardXP}
                    onChange={(e) => setRewardXP(parseInt(e.target.value))}
                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}
                  />
                  <div style={{ padding: '0.8rem 1.2rem', background: 'var(--accent-primary)', borderRadius: '8px', color: 'white', fontWeight: 900, fontSize: '0.8rem' }}>XP</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConfigPoll(null)} className="btn-secondary" style={{ flex: 1, padding: '1rem' }} disabled={isPublishing}>CANCEL</button>
              <button 
                onClick={finalizePublication} 
                className="btn-primary" 
                style={{ flex: 2, padding: '1rem', opacity: isPublishing ? 0.7 : 1 }}
                disabled={isPublishing}
              >
                {isPublishing ? 'PROCESSING...' : 'FINALIZE & REWARD'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
