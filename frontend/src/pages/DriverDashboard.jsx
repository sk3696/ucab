import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import { 
  Car, Power, DollarSign, Award, MapPin, Navigation, 
  User, CheckCircle, Play, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import translations from '../utils/translations';

export const DriverDashboard = () => {
  const { user, loadUser, language } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  
  // States
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRides, setIncomingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [activePassenger, setActivePassenger] = useState(null);
  const [error, setError] = useState('');
  
  const t = translations[language];
  
  // Animation simulation ref
  const routeSimulationInterval = useRef(null);

  // Fetch driver earnings & online status
  const fetchDriverInfo = async () => {
    try {
      await loadUser();
      const res = await axios.get('/api/driver/earnings');
      setEarnings(res.data);
      setIsOnline(res.data.isOnline);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle online status
  const handleToggleOnline = async () => {
    setError('');
    try {
      const res = await axios.put('/api/driver/status', {
        isOnline: !isOnline
      });
      setIsOnline(res.data.isOnline);
      fetchDriverInfo();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Fetch incoming requests (Only if online and approved)
  const fetchIncoming = async () => {
    if (!isOnline || user?.driverInfo?.status !== 'approved') {
      setIncomingRides([]);
      return;
    }
    try {
      const res = await axios.get('/api/ride/incoming');
      setIncomingRides(res.data);
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
    }
  };

  // Fetch active ride
  const checkActiveRide = async () => {
    try {
      const res = await axios.get('/api/ride/active');
      if (res.data && res.data.ride) {
        setActiveRide(res.data.ride);
        setActivePassenger(res.data.ride.user);
        
        if (res.data.ride.status === 'started') {
          startRouteSimulation(res.data.ride._id, res.data.ride.driverRouteIndex);
        }
      } else {
        setActiveRide(null);
        setActivePassenger(null);
        stopRouteSimulation();
      }
    } catch (err) {
      console.error('Error fetching active ride:', err);
    }
  };

  // Accept a ride request
  const handleAcceptRide = async (rideId) => {
    setError('');
    try {
      await axios.put(`/api/ride/${rideId}/accept`);
      checkActiveRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not accept ride');
    }
  };

  // Update Ride status (arrived, started, completed)
  const handleUpdateStatus = async (status) => {
    if (!activeRide) return;
    try {
      const payload = { status };
      if (status === 'started') {
        payload.driverRouteIndex = 0;
      }
      const res = await axios.put(`/api/ride/${activeRide._id}/status`, payload);
      setActiveRide(res.data);
      
      if (status === 'started') {
        startRouteSimulation(activeRide._id, 0);
      } else if (status === 'completed') {
        stopRouteSimulation();
        setActiveRide(null);
        setActivePassenger(null);
        fetchDriverInfo(); // reload earnings
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulation: Move the driver closer along the route line
  const startRouteSimulation = (rideId, startIndex) => {
    if (routeSimulationInterval.current) return;
    
    let currentIndex = startIndex || 0;
    
    routeSimulationInterval.current = setInterval(async () => {
      currentIndex += 1;
      if (currentIndex <= 30) {
        try {
          const res = await axios.put(`/api/ride/${rideId}/status`, {
            driverRouteIndex: currentIndex
          });
          setActiveRide(res.data);
        } catch (err) {
          console.error('Route sync error:', err);
        }
      } else {
        stopRouteSimulation();
      }
    }, 2000);
  };

  const stopRouteSimulation = () => {
    if (routeSimulationInterval.current) {
      clearInterval(routeSimulationInterval.current);
      routeSimulationInterval.current = null;
    }
  };

  useEffect(() => {
    fetchDriverInfo();
    checkActiveRide();

    // Set polling timers
    const pollInterval = setInterval(() => {
      checkActiveRide();
      fetchIncoming();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      stopRouteSimulation();
    };
  }, [isOnline]);

  const getSimulatedDriverLocation = () => {
    if (!activeRide) return null;
    const start = activeRide.pickupLocation;
    const end = activeRide.dropoffLocation;
    
    if (activeRide.status === 'accepted') {
      return { lat: 16.5085, lng: 80.6400 };
    }
    if (activeRide.status === 'arrived') {
      return { lat: start.lat, lng: start.lng };
    }
    if (activeRide.status === 'started') {
      const index = activeRide.driverRouteIndex || 0;
      const t = Math.min(index / 30, 1);
      return {
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t
      };
    }
    return null;
  };

  const driverLoc = getSimulatedDriverLocation();

  return (
    <div className="main-content">
      
      {/* 1. Account Pending Approval State */}
      {user?.driverInfo?.status === 'pending' && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderLeft: '5px solid var(--warning)', background: 'rgba(255, 179, 0, 0.03)' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)', marginBottom: '1.5rem', margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>{t.driverPendingMsg}</h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            Status: <span className="badge badge-pending">{t.pending.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* 2. Account Approved & Active State */}
      {user?.driverInfo?.status === 'approved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Panel: Stats & Online toggle */}
          <div className="grid grid-3" style={{ gap: '1.5rem' }}>
            
            {/* Online Toggle Card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t.dutyStatus}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'}`}>
                    {isOnline ? t.online : t.offline}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isOnline ? t.receivingJobs : t.onBreak}
                  </span>
                </div>
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}

              <button 
                onClick={handleToggleOnline} 
                className={`btn ${isOnline ? 'btn-danger' : 'btn-primary'}`}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                <Power size={16} />
                {isOnline ? t.goOffline : t.goOnline}
              </button>
            </div>

            {/* Earnings Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'var(--success-glow)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t.totalEarnings}</h4>
                <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>Rs. {earnings?.totalEarnings || 0}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.completedRidesCount}</span>
              </div>
            </div>

            {/* Rating Card */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'var(--primary-glow)', width: '50px', height: '50px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{t.ratingStar}</h4>
                <h2 style={{ fontSize: '2rem', color: 'var(--warning)' }}>★ {earnings?.rating?.toFixed(1) || '5.0'}</h2>
              </div>
            </div>

          </div>

          {/* Active Job / Incoming Requests Panels */}
          {activeRide ? (
            <div className="grid grid-2" style={{ gap: '2rem' }}>
              <div className="glass-panel" style={{ height: '420px', padding: '0.5rem' }}>
                <LeafletMap 
                  pickup={activeRide.pickupLocation} 
                  dropoff={activeRide.dropoffLocation}
                  driverLocation={driverLoc}
                />
              </div>

              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <h3>{t.ongoingRideDetails}</h3>
                  <span className="badge badge-info">{activeRide.status.toUpperCase()}</span>
                </div>
                
                <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{t.passengerName}</span>
                        <strong>{activePassenger?.name}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div>
                        <strong>Pickup:</strong>
                        <p style={{ color: 'var(--text-muted)' }}>{activeRide.pickupLocation.address}</p>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <strong>Dropoff:</strong>
                        <p style={{ color: 'var(--text-muted)' }}>{activeRide.dropoffLocation.address}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
                    <span>{t.estimatedPayout}:</span>
                    <strong style={{ color: 'var(--success)', fontSize: '1.2rem' }}>Rs. {activeRide.fare}</strong>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeRide.status === 'accepted' && (
                      <button 
                        onClick={() => handleUpdateStatus('arrived')} 
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        <CheckCircle size={16} /> {t.stepperArrived}
                      </button>
                    )}

                    {activeRide.status === 'arrived' && (
                      <button 
                        onClick={() => handleUpdateStatus('started')} 
                        className="btn btn-primary"
                        style={{ width: '100%', background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)' }}
                      >
                        <Play size={16} /> {t.stepperStart}
                      </button>
                    )}

                    {activeRide.status === 'started' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>Trip Route Progress:</span>
                          <strong>{Math.round(((activeRide.driverRouteIndex || 0) / 30) * 100)}%</strong>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'var(--primary)', 
                              width: `${((activeRide.driverRouteIndex || 0) / 30) * 100}%`,
                              transition: 'width 0.5s ease'
                            }} 
                          />
                        </div>
                        
                        <button 
                          onClick={() => handleUpdateStatus('completed')} 
                          className="btn btn-primary"
                          style={{ width: '100%', marginTop: '0.5rem' }}
                          disabled={(activeRide.driverRouteIndex || 0) < 30}
                        >
                          {(activeRide.driverRouteIndex || 0) < 30 ? t.stepperProgress : t.stepperComplete}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ) : (
              <div className="glass-panel">
                <div className="card-header">
                  <h3>{t.jobDispatchBoard}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {!isOnline ? 'Go Online to view requests' : 'Listening for booking requests...'}
                  </span>
                </div>
                <div className="card-body">
                  {!isOnline ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      <Power size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>Go online to begin receiving incoming requests in your vehicle class.</p>
                    </div>
                  ) : incomingRides.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      <Car size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} className="animate-pulse" />
                      <p>{t.noIncoming}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {incomingRides.map((ride) => (
                        <div 
                          key={ride._id}
                          style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-sm)', 
                            padding: '1.25rem', 
                            background: 'rgba(255,255,255,0.01)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passenger: </span>
                              <strong>{ride.user?.name}</strong>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                              <div><strong>From:</strong> {ride.pickupLocation.address}</div>
                              <div><strong>To:</strong> {ride.dropoffLocation.address}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                            <strong style={{ color: 'var(--success)', fontSize: '1.25rem' }}>Rs. {ride.fare}</strong>
                            <button 
                              onClick={() => handleAcceptRide(ride._id)} 
                              className="btn btn-primary"
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                            >
                              {t.acceptJob}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

        </div>
      )}
    </div>
  );
};
export default DriverDashboard;
