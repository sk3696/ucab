import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Car, User, ShieldAlert, Sun, Moon, Globe } from 'lucide-react';
import translations from '../utils/translations';

export const Navbar = () => {
  const { user, logout, isAuthenticated, language, toggleLanguage, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Car size={28} className="gradient-text" style={{ color: 'var(--primary)' }} />
        <span>U<span className="gradient-text" style={{ color: 'var(--primary)', fontWeight: 800 }}>cab</span></span>
      </Link>

      <div className="nav-links">
        {/* Localization & Theming Toggles (Always Visible) */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginRight: '1rem' }}>
          {/* Theme Toggler */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem', borderRadius: '50px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: 'var(--warning)' }} /> : <Moon size={15} style={{ color: '#475569' }} />}
          </button>

          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.6rem', height: '32px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', borderRadius: '50px' }}
            title="Switch Language / భాష మార్చండి"
          >
            <Globe size={13} />
            <span>{language === 'en' ? 'TE' : 'EN'}</span>
          </button>
        </div>

        {isAuthenticated ? (
          <>
            <span className="nav-link nav-user-greeting" style={{ cursor: 'default', color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {t.hello}, <strong>{user.name}</strong> 
              <span 
                className="badge badge-info" 
                style={{ marginLeft: '8px', fontSize: '0.65rem', padding: '2px 6px' }}
              >
                {user.role.toUpperCase()}
              </span>
            </span>

            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link flex items-center gap-1">
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {t.adminPanel}
              </Link>
            )}

            {user.role === 'driver' && (
              <Link to="/driver" className="nav-link flex items-center gap-1">
                <Car size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {t.driverDashboard}
              </Link>
            )}

            {user.role === 'user' && (
              <Link to="/dashboard" className="nav-link flex items-center gap-1">
                <User size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                {t.rideDesk}
              </Link>
            )}

            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            >
              <LogOut size={14} />
              {t.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">{t.login}</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              {t.signUp}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
