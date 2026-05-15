import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, User, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation(); // Prevent navigating to project
    if (!window.confirm('Are you sure you want to delete this project? All tasks will be permanently removed.')) return;
    
    try {
        await api.delete(`/projects/${projectId}`);
        fetchProjects();
    } catch (err) {
        alert(err.response?.data?.error || 'Error deleting project');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert('Error creating project');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: isDark ? '#fff' : '#0f172a' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your team projects</p>
        </div>
        {user?.role === 'Admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Create Project
            </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
        {projects.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '10px', color: isDark ? '#fff' : '#0f172a' }}>No Projects Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              {user?.role === 'Admin' 
                ? "You haven't created any projects yet. Click the button above to start!" 
                : "You haven't been invited to any projects yet. Ask your Project Admin to add you via your email."}
            </p>
            <button className="btn btn-outline" onClick={fetchProjects}>Refresh List</button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="glass-card project-card animate-fade-in" onClick={() => navigate(`/projects/${project._id}`)} style={{ padding: '30px', cursor: 'pointer', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '14px', borderRadius: '16px' }}>
                  <Folder size={28} />
                </div>
                {user?._id === project.admin?._id && (
                    <button 
                        onClick={(e) => handleDelete(e, project._id)}
                        className="btn-icon" 
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = 'var(--danger)'; }}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', letterSpacing: '-0.02em', color: isDark ? '#fff' : '#0f172a' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', height: '48px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} color="var(--text-muted)" />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>{project.admin?.name || 'Admin'}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>View Board →</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 10, 18, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '540px', padding: '48px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <button 
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}
            >
                &times;
            </button>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Create Project</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Launch a new workspace for your team.</p>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>PROJECT NAME</label>
                <input 
                    type="text" 
                    placeholder="e.g. Marketing Campaign 2024"
                    required 
                    value={newProject.name} 
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} 
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                <textarea 
                    rows="4" 
                    placeholder="Briefly describe the project goals..."
                    value={newProject.description} 
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} 
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '16px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '16px' }}>
                    <Plus size={20} />
                    Launch Project
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ padding: '16px' }}>
                    Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
