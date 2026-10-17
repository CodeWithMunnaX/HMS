import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Stethoscope,
  UserRound,
} from 'lucide-react';

const QUICK_DEMO = [
  { role: 'Admin', icon: Shield },
  { role: 'Doctor', icon: Stethoscope },
  { role: 'Receptionist', icon: ClipboardList },
  { role: 'Patient', icon: UserRound },
];

export const Login = ({ onNavigateRegister, onNavigateHome }) => {
  const { login, switchDemoRole } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoRole, setDemoRole] = useState(null);

  const busy = submitting || Boolean(demoRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning('Please enter your email and password');
    }

    try {
      setSubmitting(true);
      await login(email, password);
      toast.success('Welcome back to CarePulse!');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (roleName) => {
    if (busy) return;
    try {
      setDemoRole(roleName);
      await switchDemoRole(roleName);
      toast.success(`Signed in to the ${roleName} demo`);
    } catch (err) {
      toast.error('Failed to log in with demo account');
    } finally {
      setDemoRole(null);
    }
  };

  return (
    <div className="cp-auth">
      <aside className="cp-auth-media">
        <img src="/images/ward.webp" alt="Modern inpatient ward with hospital beds" />
        <div className="cp-auth-overlay" />
        <div className="cp-auth-media-copy">
          <span className="cp-logo cp-logo-light">
            <span className="cp-logo-mark">
              <Activity size={18} />
            </span>
            CarePulse
          </span>
          <p className="cp-auth-tagline">Care teams, records and billing — together in one place.</p>
        </div>
      </aside>

      <main className="cp-auth-panel">
        <div className="cp-auth-form-wrap">
          {onNavigateHome && (
            <button type="button" className="cp-back-link" onClick={onNavigateHome}>
              <ArrowLeft size={16} /> Back to home
            </button>
          )}

          <h1 className="cp-auth-title">Sign in</h1>
          <p className="cp-auth-sub">Use your CarePulse account, or jump into a demo portal below.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email address
              </label>
              <div className="cp-input-icon">
                <Mail size={16} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="cp-input-icon">
                <Lock size={16} aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="form-input cp-has-toggle"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="cp-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="cp-btn cp-btn-primary cp-btn-lg cp-btn-block" disabled={busy}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="cp-spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="cp-divider">
            <span>Quick demo</span>
          </div>

          <div className="cp-quick-demo">
            {QUICK_DEMO.map(({ role, icon: Icon }) => (
              <button
                key={role}
                type="button"
                className="cp-quick-btn"
                onClick={() => handleDemoLogin(role)}
                disabled={busy}
                aria-busy={demoRole === role}
              >
                {demoRole === role ? <Loader2 size={18} className="cp-spin" /> : <Icon size={18} />}
                <span>{role}</span>
              </button>
            ))}
          </div>

          <p className="cp-auth-switch">
            New patient?{' '}
            <button type="button" className="cp-link" onClick={onNavigateRegister}>
              Create an account
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
