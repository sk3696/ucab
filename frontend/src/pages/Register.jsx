import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Car, Hash, Shield, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import translations from '../utils/translations';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'driver'
  
  // Driver specific fields
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('economy');

  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, language } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setLocalError('Please fill in all core fields');
      return;
    }

    if (role === 'driver' && (!vehicleModel || !vehicleNumber)) {
      setLocalError('Please fill in all vehicle details');
      return;
    }

    setLocalError('');
    setIsSubmitting(true);

    const submitData = {
      name,
      email: email.toLowerCase().trim(), // explicit lowercasing client side
      password,
      role,
      ...(role === 'driver' ? { vehicleModel, vehicleNumber, vehicleType } : {})
    };

    try {
      const data = await register(submitData);
      if (data.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>{t.getStarted}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.0rem', textAlign: 'center' }}>
          {t.registerDesc}
        </p>

        {localError && (
          <div 
            style={{ 
              background: 'rgba(255, 23, 68, 0.1)', 
              border: '1px solid var(--danger)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '0.8rem 1rem', 
              color: 'var(--text-main)', 
              fontSize: '0.9rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1.5rem' 
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.fullName}</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.email}</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
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
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
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

          <div className="form-group">
            <label className="form-label">{t.accountRole}</label>
            <div style={{ position: 'relative' }}>
              <Shield 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <select
                className="form-select"
                style={{ paddingLeft: '2.5rem' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">{t.passengerRole}</option>
                <option value="driver">{t.driverRole}</option>
              </select>
            </div>
          </div>

          {/* Conditional Driver Registration Fields */}
          {role === 'driver' && (
            <div 
              style={{ 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '1.5rem', 
                marginTop: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem' 
              }}
            >
              <h4 style={{ color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>{t.vehicleDetails}</h4>
              
              <div className="form-group">
                <label className="form-label">{t.vehicleModel}</label>
                <div style={{ position: 'relative' }}>
                  <Car 
                    size={18} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Toyota Prius (White)"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.licensePlate}</label>
                <div style={{ position: 'relative' }}>
                  <Hash 
                    size={18} 
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="KA-01-MJ-9999"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.tierCategory}</label>
                <select
                  className="form-select"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="bike">Bike (Two-wheeler)</option>
                  <option value="scooty">Scooty (Scooter)</option>
                  <option value="mini">Mini (Hatchback)</option>
                  <option value="economy">Economy (Sedan)</option>
                  <option value="xl">XL (7-Seater SUV)</option>
                </select>
              </div>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Note: Driver accounts require admin approval before going online.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                {t.creatingAccount}
              </>
            ) : (
              t.signUp
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{t.alreadyAccount} </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            {t.signIn}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
