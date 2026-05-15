import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin'); // Default to Admin
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px', border: `1px solid ${role === 'Admin' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, transition: 'border 0.3s ease' }}>
        
        {/* Role Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', marginBottom: '30px' }}>
            <button 
                onClick={() => { setRole('Admin'); setError(''); }}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: role === 'Admin' ? 'var(--primary)' : 'transparent', color: role === 'Admin' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}
            >
                Admin
            </button>
            <button 
                onClick={() => { setRole('Member'); setError(''); }}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: role === 'Member' ? 'var(--primary)' : 'transparent', color: role === 'Member' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}
            >
                Member
            </button>
        </div>

        <h2 style={{ fontSize: '28px', marginBottom: '10px', textAlign: 'center' }}>{role} Portal</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Enter your details to access your dashboard</p>
        
        {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                style={{ width: '100%', paddingLeft: '45px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{ width: '100%', paddingLeft: '45px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <LogIn size={20} />
            Sign In as {role}
          </button>
        </form>
        
        <p style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
