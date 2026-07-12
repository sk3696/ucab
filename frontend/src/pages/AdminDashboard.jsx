import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Car, Navigation, DollarSign, Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import translations from '../utils/translations';

export const AdminDashboard = () => {
  const { user, language } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard statistics
  const [stats, setStats] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [allRides, setAllRides] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketReplies, setTicketReplies] = useState({}); // replies map

  const t = translations[language];

  // Fetch all stats
  const fetchAdminStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch pending verification drivers
  const fetchPendingDrivers = async () => {
    try {
      const res = await axios.get('/api/admin/drivers/pending');
      setPendingDrivers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all rides logs
  const fetchAllRides = async () => {
    try {
      const res = await axios.get('/api/admin/rides');
      setAllRides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/admin/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Approve driver
  const handleApproveDriver = async (driverId) => {
    try {
      await axios.put(`/api/admin/driver/${driverId}/approve`);
      fetchPendingDrivers();
      fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Reject driver
  const handleRejectDriver = async (driverId) => {
    try {
      await axios.put(`/api/admin/driver/${driverId}/reject`);
      fetchPendingDrivers();
      fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Reply and resolve tickets
  const handleResolveTicket = async (ticketId) => {
    const reply = ticketReplies[ticketId];
    if (!reply) return;
    try {
      await axios.put(`/api/admin/tickets/${ticketId}/reply`, {
        reply
      });
      setTicketReplies((prev) => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchPendingDrivers();
    
    const pollInterval = setInterval(() => {
      fetchAdminStats();
      fetchPendingDrivers();
      if (activeTab === 'audits') fetchAllRides();
      if (activeTab === 'support') fetchTickets();
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'audits') {
      fetchAllRides();
    } else if (activeTab === 'support') {
      fetchTickets();
    }
  }, [activeTab]);

  const totalVerificationsPending = pendingDrivers.length;

  return (
    <div className="main-content">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation tabs */}
        <div className="glass-panel" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Shield size={16} /> {t.overviewTab}
          </button>
          <button 
            onClick={() => setActiveTab('verifications')} 
            className={`btn ${activeTab === 'verifications' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Car size={16} /> {t.verificationTab} ({totalVerificationsPending})
          </button>
          <button 
            onClick={() => setActiveTab('audits')} 
            className={`btn ${activeTab === 'audits' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Navigation size={16} /> {t.auditTab}
          </button>
          <button 
            onClick={() => setActiveTab('support')} 
            className={`btn ${activeTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <MessageSquare size={16} /> {t.supportTab}
          </button>
        </div>

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Stats boxes */}
            <div className="grid grid-4" style={{ gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--primary-glow)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.totalUsers}</span>
                  <h3 style={{ fontSize: '1.75rem', marginTop: '0.15rem' }}>{stats?.totalUsers || 0}</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,23,68,0.1)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                  <Car size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.totalDrivers}</span>
                  <h3 style={{ fontSize: '1.75rem', marginTop: '0.15rem' }}>{stats?.totalDrivers || 0}</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--success-glow)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <Navigation size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.totalRides}</span>
                  <h3 style={{ fontSize: '1.75rem', marginTop: '0.15rem' }}>{stats?.totalRides || 0}</h3>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,179,0,0.1)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.revenue}</span>
                  <h3 style={{ fontSize: '1.75rem', marginTop: '0.15rem', color: 'var(--success)' }}>Rs. {stats?.totalRevenue || 0}</h3>
                </div>
              </div>
            </div>

            {/* Quick check verification alert banner */}
            {totalVerificationsPending > 0 && (
              <div className="glass-panel" style={{ padding: '1.25rem 2rem', background: 'rgba(255, 179, 0, 0.05)', borderLeft: '4px solid var(--warning)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
                  <div>
                    <strong>Action Required: Verifications</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      There are {pendingDrivers.length} pending drivers waiting for verification.
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('verifications')} className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
                  Review Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* VERIFICATIONS TAB (DRIVERS ONLY) */}
        {activeTab === 'verifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="glass-panel">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h3>{language === 'en' ? 'Cab Driver / Rider Verification Approvals' : 'క్యాబ్ డ్రైవర్ల / రైడర్స్ ధృవీకరణ ఆమోదాలు'}</h3>
              </div>
              <div className="card-body" style={{ marginTop: '1rem' }}>
                {pendingDrivers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {language === 'en' ? 'No pending driver registrations.' : 'ధృవీకరణ కోసం పెండింగ్ డ్రైవర్లు ఎవరూ లేరు.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingDrivers.map((driver) => (
                      <div 
                        key={driver._id}
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
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{driver.user?.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email: {driver.user?.email}</p>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                            <span>Model: <strong>{driver.vehicleModel}</strong></span>
                            <span>License Plate: <strong>{driver.vehicleNumber}</strong></span>
                            <span>Tier: <strong style={{ textTransform: 'capitalize' }}>{driver.vehicleType}</strong></span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleRejectDriver(driver._id)} 
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                          >
                            <X size={14} /> {t.rejectBtn}
                          </button>
                          <button 
                            onClick={() => handleApproveDriver(driver._id)} 
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
                          >
                            <Check size={14} /> {t.approveBtn}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SYSTEM RIDE AUDITS */}
        {activeTab === 'audits' && (
          <div className="glass-panel">
            <div className="card-header">
              <h3>{t.auditsTitle}</h3>
            </div>
            <div className="card-body" style={{ overflowX: 'auto' }}>
              {allRides.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No system rides run yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem' }}>{t.passengerName}</th>
                      <th style={{ padding: '0.75rem' }}>{t.driverName}</th>
                      <th style={{ padding: '0.75rem' }}>Route Address Details</th>
                      <th style={{ padding: '0.75rem' }}>{t.rideTier}</th>
                      <th style={{ padding: '0.75rem' }}>Fare</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRides.map((ride) => (
                      <tr key={ride._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(ride.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{ride.user?.name}</td>
                        <td style={{ padding: '0.75rem' }}>{ride.driver?.name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>From: {ride.pickupLocation.address}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>To: {ride.dropoffLocation.address}</span>
                        </td>
                        <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{ride.vehicleType}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Rs. {ride.fare}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${
                            ride.status === 'completed' ? 'badge-success' :
                            ride.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                          }`}>
                            {ride.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SUPPORT CENTER MESSAGING */}
        {activeTab === 'support' && (
          <div className="glass-panel">
            <div className="card-header">
              <h3>{t.ticketLog}</h3>
            </div>
            <div className="card-body">
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No customer support tickets logged.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket._id}
                      style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '1.25rem', 
                        background: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem' }}>{ticket.subject}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            From: {ticket.user?.name} ({ticket.user?.email})
                          </span>
                        </div>
                        <span className={`badge ${ticket.status === 'resolved' ? 'badge-success' : 'badge-pending'}`}>
                          {ticket.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.1)', padding: '0.6rem 0.8rem', borderRadius: '5px' }}>
                        {ticket.message}
                      </p>

                      {ticket.reply ? (
                        <div style={{ background: 'rgba(0, 242, 254, 0.05)', borderLeft: '3px solid var(--primary)', padding: '0.6rem 0.8rem', borderRadius: '0 5px 5px 0', fontSize: '0.85rem' }}>
                          <strong>Admin Reply:</strong> {ticket.reply}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder={t.replyPlaceholder}
                            value={ticketReplies[ticket._id] || ''}
                            onChange={(e) => setTicketReplies((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                          />
                          <button 
                            onClick={() => handleResolveTicket(ticket._id)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 1.25rem' }}
                          >
                            {t.sendBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default AdminDashboard;
