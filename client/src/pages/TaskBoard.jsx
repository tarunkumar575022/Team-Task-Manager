import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Plus, MoreVertical, Calendar, User, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TaskBoard = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjectDetails();
  }, [projectId]);

  const fetchTasks = async () => {
    const res = await api.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  };

  const fetchProjectDetails = async () => {
      const res = await api.get('/projects');
      const current = res.data.find(p => p._id === projectId);
      setProjectDetails(current);
      setProjectMembers(current?.members || []); 
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post(`/projects/${projectId}/members`, { email: memberEmail });
        setProjectMembers(res.data.members);
        setMemberEmail('');
        alert('Member added successfully!');
    } catch (err) {
        alert(err.response?.data?.error || 'User not found');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
        const res = await api.delete(`/projects/${projectId}/members/${userId}`);
        // Refresh local state
        setProjectMembers(projectMembers.filter(m => m._id !== userId));
    } catch (err) {
        alert('Error removing member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
        await api.post('/tasks', { ...newTask, project: projectId });
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
        fetchTasks();
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Error creating task. Please check your connection.');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
        await api.patch(`/tasks/${taskId}`, { status });
        setActiveMenu(null);
        fetchTasks();
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px' }} onClick={() => setActiveMenu(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: isDark ? '#fff' : '#0f172a' }}>Project Board</h1>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--glass-bg)', padding: '5px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Search size={16} /> 
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '5px', color: isDark ? '#fff' : '#0f172a', width: '200px' }} 
                />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            {projectDetails?.admin?._id === user?._id && (
                <>
                <button className="btn btn-outline" onClick={() => setShowTeamModal(true)}>
                    <User size={18} /> Manage Team
                </button>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                    <Plus size={20} /> Add Task
                </button>
                </>
            )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', paddingBottom: '30px', minHeight: 'calc(100vh - 250px)' }}>
        {columns.map(col => (
          <div key={col} className="kanban-column" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', width: '360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '10px 5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col === 'To Do' ? '#94a3b8' : col === 'In Progress' ? 'var(--primary)' : 'var(--success)' }}></div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: isDark ? '#fff' : '#0f172a' }}>{col}</h3>
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {tasks.filter(t => t.status === col && t.title.toLowerCase().includes(searchTerm.toLowerCase())).length}
                  </span>
              </div>
              <MoreVertical size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.filter(t => t.status === col && t.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{searchTerm ? 'No matches found' : `No tasks in ${col}`}</p>
                  </div>
              ) : (
                tasks.filter(t => t.status === col && t.title.toLowerCase().includes(searchTerm.toLowerCase())).map(task => (
                    <div key={task._id} className="glass-card task-card" style={{ padding: '24px', cursor: 'default', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '20px' }}>{task.priority}</span>
                        {(projectDetails?.admin?._id === user?._id || task.assignedTo?._id === user?._id) && (
                            <div style={{ position: 'relative' }}>
                                <MoreVertical 
                                    size={18} 
                                    color="var(--text-muted)" 
                                    style={{ cursor: 'pointer' }} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === task._id ? null : task._id);
                                    }}
                                />
                                {activeMenu === task._id && (
                                    <div className="glass-card" style={{ position: 'absolute', right: '0', top: '25px', width: '180px', zIndex: 10, padding: '12px', background: isDark ? 'var(--bg-dark)' : '#fff', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', padding: '0 10px 10px 10px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>Move To Column</p>
                                        {columns.filter(c => c !== col).map(targetCol => (
                                            <button 
                                                key={targetCol}
                                                onClick={() => updateStatus(task._id, targetCol)}
                                                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: isDark ? '#fff' : '#0f172a', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                                                onMouseEnter={(e) => e.target.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                {targetCol}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4', color: isDark ? '#fff' : '#0f172a' }}>{task.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>{task.description}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500' }}>
                          <Calendar size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                        </div>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', border: '2px solid var(--bg-dark)' }}>
                          {task.assignedTo?.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 10, 18, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Manage Team</h2>
                <button onClick={() => setShowTeamModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Close</button>
            </div>

            <form onSubmit={handleAddMember} style={{ marginBottom: '30px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>INVITE BY EMAIL</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="email" 
                        placeholder="teammate@company.com" 
                        required 
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.2)' }}
                    />
                    <button type="submit" className="btn btn-primary">Invite</button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>CURRENT MEMBERS</label>
                {projectMembers.map(member => (
                    <div key={member._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                {member.name[0]}
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '600' }}>{member.name} {member._id === projectDetails?.admin?._id && <span style={{ color: 'var(--primary)', fontSize: '10px' }}>(Owner)</span>}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email}</p>
                            </div>
                        </div>
                        {projectDetails?.admin?._id === user?._id && member._id !== user?._id && (
                            <button 
                                onClick={() => handleRemoveMember(member._id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer' }}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7, 10, 18, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '540px', padding: '48px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <button 
                onClick={() => setShowTaskModal(false)}
                style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}
            >
                &times;
            </button>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>New Task</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Add a new objective to the project board.</p>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>TASK TITLE</label>
                <input 
                    type="text" 
                    placeholder="What needs to be done?"
                    required 
                    value={newTask.title} 
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '16px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                <textarea 
                    placeholder="Provide some details..."
                    value={newTask.description} 
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '16px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>PRIORITY</label>
                  <select 
                    value={newTask.priority} 
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>ASSIGN TO</label>
                  <select 
                    value={newTask.assignedTo} 
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <option value="">Unassigned</option>
                    {/* Assuming projectMembers is populated with user objects */}
                    {projectMembers.map(member => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>DUE DATE</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '16px' }}>
                    <Plus size={20} />
                    Create Task
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)} style={{ padding: '16px' }}>
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

export default TaskBoard;
