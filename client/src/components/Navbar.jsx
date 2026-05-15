import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Layout, CheckSquare, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ margin: '20px 40px', padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '20px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
          <CheckSquare size={24} color="white" />
        </div>
        <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.8px', color: isDark ? '#fff' : '#0f172a' }}>TeamFlow</span>
      </Link>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', gap: '24px' }}>
                <Link to="/" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', transition: 'color 0.3s' }}>Dashboard</Link>
                <Link to="/projects" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px', transition: 'color 0.3s' }}>Projects</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '28px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: isDark ? '#fff' : '#0f172a' }}>{user.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <User size={20} color="var(--primary)" />
                </div>
              </div>
              <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '10px', borderRadius: '10px' }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '10px', borderRadius: '10px' }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={toggleTheme} className="btn btn-outline" style={{ padding: '10px', borderRadius: '10px', marginRight: '10px' }}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
