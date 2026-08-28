import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  Lock,
  Mail,
  Shield,
  Stethoscope,
  UserCheck,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
} from 'lucide-react';

export const Login = ({ onNavigateRegister, onNavigateHome }) => {
  const { login, switchDemoRole } = useAuth();
  const toast = useToast();

  const [activePortalTab, setActivePortalTab] = useState('patient'); // 'patient', 'doctor', 'admin'
  const [email, setEmail] = useState('alex.johnson@example.com');
  const [password, setPassword] = useState('Patient@123');
  const [submitting, setSubmitting] = useState(false);

  const portals = {
    patient: {
      title: 'Patient Health Portal',
      subtitle: 'Access your personal health records, digital prescriptions, and book consultations',
      badge: '👤 Patient Sign In',
      color: '#0e7490',
      defaultEmail: 'alex.johnson@example.com',
      defaultPass: 'Patient@123',
      demoUser: 'Alex Johnson (O+ Blood)',
      role: 'Patient',
      icon: HeartPulse,
    },
    doctor: {
      title: 'Medical Doctor Portal',
      subtitle: "Review today's consultation queue, write E-Prescriptions, and inspect patient EMR",
      badge: '👨‍⚕️ Doctor Clinical Suite',
      color: '#0891b2',
      defaultEmail: 'sarah.cardio@carepulse.com',
      defaultPass: 'Doctor@123',
      demoUser: 'Dr. Sarah Jenkins (Cardiology)',
      role: 'Doctor',
      icon: Stethoscope,
    },
    admin: {
      title: 'Hospital Admin & Reception',
      subtitle: 'Complete hospital administration, inpatient ward matrix, and financial billing ledger',
      badge: '🛡️ Operations Suite',
      color: '#075985',
      defaultEmail: 'munna@gmail.com',
      defaultPass: 'munna@gmail.com',
      demoUser: 'Munna (Chief Admin)',
      role: 'Admin',
      icon: Shield,
    },
  };

  const currentPortal = portals[activePortalTab];

  const handleTabChange = (portalKey) => {
    setActivePortalTab(portalKey);
    const p = portals[portalKey];
    setEmail(p.defaultEmail);
    setPassword(p.defaultPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning('Please enter your email and password');
    }

    try {
      setSubmitting(true);
      await login(email, password);
      toast.success(`Welcome to CarePulse ${currentPortal.title}!`);
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handle1ClickLogin = async (roleName) => {
    try {
      setSubmitting(true);
      await switchDemoRole(roleName);
      toast.success(`Logged in to ${roleName} Portal!`);
    } catch (err) {
      toast.error('Failed to log in with demo account');
    } finally {
      setSubmitting(false);
    }
  };

  const PortalIcon = currentPortal.icon;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '2rem 1.5rem',
        backgroundImage: 'url(/hospital_hero_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Ambient Glass Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(11, 19, 41, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)',
          backdropFilter: 'blur(5px)',
        }}
      />

      <div
        className="card"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
          padding: '2.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#64748b',
              fontSize: '0.8125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back to Hospital Home
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 0.85rem auto',
              boxShadow: '0 10px 25px rgba(6, 182, 212, 0.45)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Activity size={30} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}
          >
            CarePulse Clinical Network
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', fontWeight: '500' }}>
            Choose your dedicated portal to sign in:
          </p>
        </div>

        {/* 3 Dedicated Portal Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            background: '#f1f5f9',
            padding: '0.35rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('patient')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: activePortalTab === 'patient' ? '#ffffff' : 'transparent',
              color: activePortalTab === 'patient' ? '#0e7490' : '#64748b',
              boxShadow: activePortalTab === 'patient' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              border: activePortalTab === 'patient' ? '1px solid #cffafe' : 'none',
              cursor: 'pointer',
            }}
          >
            <HeartPulse size={18} color={activePortalTab === 'patient' ? '#0e7490' : '#64748b'} />
            <span>Patient Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('doctor')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: activePortalTab === 'doctor' ? '#ffffff' : 'transparent',
              color: activePortalTab === 'doctor' ? '#0891b2' : '#64748b',
              boxShadow: activePortalTab === 'doctor' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              border: activePortalTab === 'doctor' ? '1px solid #a5f3fc' : 'none',
              cursor: 'pointer',
            }}
          >
            <Stethoscope size={18} color={activePortalTab === 'doctor' ? '#0891b2' : '#64748b'} />
            <span>Doctor Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.65rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: activePortalTab === 'admin' ? '#ffffff' : 'transparent',
              color: activePortalTab === 'admin' ? '#0369a1' : '#64748b',
              boxShadow: activePortalTab === 'admin' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              border: activePortalTab === 'admin' ? '1px solid #bae6fd' : 'none',
              cursor: 'pointer',
            }}
          >
            <Shield size={18} color={activePortalTab === 'admin' ? '#0369a1' : '#64748b'} />
            <span>Admin / Staff</span>
          </button>
        </div>

        {/* Portal Info Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ecfeff 100%)',
            border: '1px solid #cffafe',
            borderRadius: '14px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ fontWeight: '800', fontSize: '0.9375rem', color: '#0e7490', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PortalIcon size={16} />
              {currentPortal.title}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.725rem' }}
              onClick={() => handle1ClickLogin(currentPortal.role)}
            >
              ⚡ 1-Click Login
            </button>
          </div>
          <p style={{ fontSize: '0.775rem', color: '#475569', lineHeight: '1.4', margin: 0 }}>
            {currentPortal.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }}
              />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }}
              />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : `Sign In to ${currentPortal.title}`}
          </button>
        </form>

        {activePortalTab === 'patient' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
            New patient?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              style={{ color: '#0e7490', fontWeight: '800', cursor: 'pointer' }}
            >
              Create Patient Portal Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
