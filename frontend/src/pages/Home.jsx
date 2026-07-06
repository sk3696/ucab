import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Compass, DollarSign, ArrowRight } from 'lucide-react';
import translations from '../utils/translations';

export const Home = () => {
  const { isAuthenticated, user, language } = useAuth();
  const t = translations[language];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', padding: '2rem 0' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          {t.heroTitle} <br />
          <span className="gradient-text" style={{ fontSize: '4rem' }}>{t.heroHighlight}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
          {t.heroDesc}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link 
              to={user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/dashboard'} 
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}
            >
              {t.driverDashboard} <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}>
                {t.bookRide}
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.9rem 2rem' }}>
                {t.driveWithUs}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-3" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ background: 'var(--primary-glow)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <MapPin size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.feature1Title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t.feature1Desc}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ background: 'rgba(255,23,68,0.1)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--danger)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.feature2Title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t.feature2Desc}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ background: 'var(--success-glow)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
            <DollarSign size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.feature3Title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t.feature3Desc}
          </p>
        </div>
      </section>

      {/* Demo Credentials Alert Panel */}
      <section className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '1.5rem 2rem', borderLeft: '4px solid var(--primary)', background: 'rgba(0, 242, 254, 0.04)' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} /> {t.seedTitle}
        </h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {t.seedDesc}
        </p>
        <div className="grid grid-3" style={{ fontSize: '0.85rem' }}>
          <div>
            <strong>Passenger Portal:</strong><br />
            Email: <code style={{ color: 'var(--primary)' }}>user@ucab.com</code><br />
            Password: <code>user123</code>
          </div>
          <div>
            <strong>Driver Portal (Approved):</strong><br />
            Email: <code style={{ color: 'var(--primary)' }}>driver@ucab.com</code><br />
            Password: <code>driver123</code>
          </div>
          <div>
            <strong>Admin Verification Panel:</strong><br />
            Email: <code style={{ color: 'var(--primary)' }}>admin@ucab.com</code><br />
            Password: <code>admin123</code>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
