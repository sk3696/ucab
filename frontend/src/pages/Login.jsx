import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react';
import translations from '../utils/translations';
import axios from 'axios';

export const Login = () => {
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const [email, setEmail] = useState(localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState(localStorage.getItem('savedPassword') || '');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, language } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  // Show/Hide password & Forgot password states
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLocalError('');
    setIsSubmitting(true);
    try {
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('rememberMe');
      }

      const data = await login(email, password, rememberMe);
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetNewPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    setLocalError('');
    setResetSuccessMsg('');
    setIsSubmitting(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email: resetEmail,
        newPassword: resetNewPassword
      });
      setResetSuccessMsg(t.resetSuccess || 'Password reset successfully! You can now login.');
      setResetEmail('');
      setResetNewPassword('');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        
        {/* Render Forgot Password Form */}
        {isForgotMode ? (
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>{t.resetPasswordTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
              {t.enterEmailReset}
            </p>

            {localError && (
              <div style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span>{localError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">{t.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.newPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                    placeholder="••••••••"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? <Loader size={18} className="animate-spin" /> : t.resetBtn}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={() => {
                  setIsForgotMode(false);
                  setLocalError('');
                  setResetSuccessMsg('');
                }}
              >
                {t.backToLogin}
              </button>
            </form>
          </>
        ) : (
          /* Render Login Form */
          <>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>{t.welcomeBack}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', textAlign: 'center' }}>
              {t.loginDesc}
            </p>

            {localError && (
              <div style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span>{localError}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '0.8rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">{t.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                    {t.saveLogin}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true);
                    setLocalError('');
                    setResetSuccessMsg('');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {t.forgotPassword}
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                    {t.signingIn}
                  </>
                ) : (
                  t.signIn
                )}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t.noAccount} </span>
              <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                {t.createAccount}
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
export default Login;
