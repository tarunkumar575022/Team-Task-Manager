import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Layout, CheckCircle, Clock, AlertCircle, BarChart2, Users } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      const res = await api.get('/tasks/stats');
      setStats(res.data);
      
      // If user is a member and has projects, and hasn't seen the notification this session
      const hasSeenNotification = sessionStorage.getItem('hasSeenProjectInvite');
      if (user?.role === 'Member' && res.data.projectCount > 0 && !hasSeenNotification) {
          setNotification({
              message: `You have been assigned to ${res.data.projectCount} project(s)!`,
              link: '/projects'
          });
      }
    } catch (err) {
      console.error('Frontend Stats Error:', err);
      setError('Could not load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (link) => {
    sessionStorage.setItem('hasSeenProjectInvite', 'true');
    setNotification(null);
    if (link) navigate(link);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>Loading...</div>;

  const filteredTasks = stats?.tasks?.filter(task => {
    if (selectedCategory === 'Total Tasks') return true;
    if (selectedCategory === 'Completed') return task.status === 'Done';
    if (selectedCategory === 'In Progress') return task.status === 'In Progress';
    if (selectedCategory === 'Overdue') {
        return task.status !== 'Done'; 
    }
    return false;
  }) || [];

  const pieData = stats ? {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{
      data: [stats.todo, stats.inProgress, stats.done],
      backgroundColor: ['#94a3b8', '#6366f1', '#10b981'],
      borderWidth: 0,
    }]
  } : null;

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px', position: 'relative' }}>
      
      {/* Notification Toast */}
      {notification && (
        <div className="glass-card animate-slide-in" style={{ position: 'fixed', bottom: '40px', right: '40px', width: '320px', padding: '20px', border: '1px solid var(--primary)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '12px' }}>
                    <Layout size={20} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.4' }}>{notification.message}</p>
            </div>
            <button onClick={() => handleCloseNotification(notification.link)} className="btn btn-primary" style={{ padding: '10px', fontSize: '13px' }}>
                View Projects Now
            </button>
            <button onClick={() => handleCloseNotification(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}

      {error && <div className="glass-card" style={{ padding: '15px', color: 'var(--danger)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Hello, {user.name} 👋</h1>
            <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your projects today.</p>
        </div>
        <div className="glass-card" onClick={() => navigate('/projects')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
            <span style={{ color: 'var(--primary)' }}>●</span> {stats?.projectCount || 0} Projects Tracked
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={<Layout size={24} />} title="Total Tasks" value={stats.total} color="var(--primary)" active={selectedCategory === 'Total Tasks'} onClick={() => setSelectedCategory(selectedCategory === 'Total Tasks' ? null : 'Total Tasks')} />
        <StatCard icon={<CheckCircle size={24} />} title="Completed" value={stats.done} color="var(--success)" active={selectedCategory === 'Completed'} onClick={() => setSelectedCategory(selectedCategory === 'Completed' ? null : 'Completed')} />
        <StatCard icon={<Clock size={24} />} title="In Progress" value={stats.inProgress} color="var(--primary)" active={selectedCategory === 'In Progress'} onClick={() => setSelectedCategory(selectedCategory === 'In Progress' ? null : 'In Progress')} />
        <StatCard icon={<AlertCircle size={24} />} title="Overdue" value={stats.overdue} color="var(--danger)" active={selectedCategory === 'Overdue'} onClick={() => setSelectedCategory(selectedCategory === 'Overdue' ? null : 'Overdue')} />
      </div>

      {selectedCategory && (
        <div className="glass-card animate-fade-in" style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedCategory} List</h3>
                <button onClick={() => setSelectedCategory(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredTasks.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No tasks found in this category.</p>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task._id} onClick={() => navigate(`/projects/${task.project}`)} className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '15px 20px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '10px' }}>{task.priority}</span>
                                <span style={{ fontWeight: '600' }}>{task.title}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--primary)' }}>View Board →</span>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={20} /> Task Distribution
          </h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            {pieData && <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} /> Team Workload
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {(() => {
                const userCounts = {};
                stats.tasks?.forEach(t => {
                    const name = t.assignedTo?.name || 'Unassigned';
                    userCounts[name] = (userCounts[name] || 0) + 1;
                });
                return Object.entries(userCounts).sort((a,b) => b[1] - a[1]).map(([name, count]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                {name[0]}
                            </div>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{name}</span>
                        </div>
                        <span className="badge badge-primary" style={{ padding: '4px 12px' }}>{count} Tasks</span>
                    </div>
                ));
            })()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/projects')} style={{ justifyContent: 'flex-start', padding: '15px' }}>
                <span style={{ background: 'var(--glass-bg)', padding: '8px', borderRadius: '8px' }}>🚀</span>
                View All Projects
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/projects')} style={{ justifyContent: 'flex-start', padding: '15px' }}>
                <span style={{ background: 'var(--glass-bg)', padding: '8px', borderRadius: '8px' }}>📝</span>
                Manage Tasks
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/projects')} style={{ justifyContent: 'flex-start', padding: '15px' }}>
                <span style={{ background: 'var(--glass-bg)', padding: '8px', borderRadius: '8px' }}>👥</span>
                Invite Team Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, onClick, active }) => (
  <div 
    className="glass-card" 
    onClick={onClick}
    style={{ 
        padding: '28px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '24px', 
        position: 'relative', 
        overflow: 'hidden', 
        cursor: 'pointer',
        border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
        transform: active ? 'translateY(-5px)' : 'none',
        boxShadow: active ? `0 10px 30px ${color}22` : 'none'
    }}
  >
    <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: color, opacity: '0.05', borderRadius: '50%' }}></div>
    <div style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, color: color, padding: '16px', borderRadius: '18px', border: `1px solid ${color}33`, boxShadow: `0 8px 16px ${color}11` }}>{icon}</div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{title}</p>
      <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>{value}</h2>
    </div>
  </div>
);

export default Dashboard;
