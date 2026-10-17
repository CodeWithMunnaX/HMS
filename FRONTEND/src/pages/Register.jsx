import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Activity, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';

export const Register = ({ onNavigateLogin, onNavigateHome }) => {
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '28',
    gender: 'Male',
    bloodGroup: 'O+',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await register({
        ...formData,
        age: Number(formData.age),
        role: 'Patient',
      });
      toast.success('Registration successful! Welcome to CarePulse.');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="cp-auth">
      <aside className="cp-auth-media">
        <img src="/images/care-team.webp" alt="Doctor and nurse reviewing patient details on a tablet" />
        <div className="cp-auth-overlay" />
        <div className="cp-auth-media-copy">
          <span className="cp-logo cp-logo-light">
            <span className="cp-logo-mark">
              <Activity size={18} />
            </span>
            CarePulse
          </span>
          <p className="cp-auth-tagline">Book visits, see prescriptions and keep your records in one place.</p>
        </div>
      </aside>

      <main className="cp-auth-panel">
        <div className="cp-auth-form-wrap">
          {onNavigateHome && (
            <button type="button" className="cp-back-link" onClick={onNavigateHome}>
              <ArrowLeft size={16} /> Back to home
            </button>
          )}

          <h1 className="cp-auth-title">Create a patient account</h1>
          <p className="cp-auth-sub">Book appointments online and access your prescriptions and medical files.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full name *
              </label>
              <div className="cp-input-icon">
                <User size={16} aria-hidden="true" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="form-input"
                  value={formData.name}
                  onChange={update('name')}
                />
              </div>
            </div>

            <div className="cp-form-grid cp-form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email address *
                </label>
                <div className="cp-input-icon">
                  <Mail size={16} aria-hidden="true" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jane@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={update('email')}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone *
                </label>
                <div className="cp-input-icon">
                  <Phone size={16} aria-hidden="true" />
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+1 (555) 000-0000"
                    className="form-input"
                    value={formData.phone}
                    onChange={update('phone')}
                  />
                </div>
              </div>
            </div>

            <div className="cp-form-grid cp-form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-age">
                  Age *
                </label>
                <input
                  id="reg-age"
                  type="number"
                  min="1"
                  required
                  className="form-input"
                  value={formData.age}
                  onChange={update('age')}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-gender">
                  Gender
                </label>
                <select id="reg-gender" className="form-select" value={formData.gender} onChange={update('gender')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-blood">
                  Blood group
                </label>
                <select
                  id="reg-blood"
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={update('bloodGroup')}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password * (min 6 characters)
              </label>
              <div className="cp-input-icon">
                <Lock size={16} aria-hidden="true" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength="6"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="form-input cp-has-toggle"
                  value={formData.password}
                  onChange={update('password')}
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

            <button type="submit" className="cp-btn cp-btn-primary cp-btn-lg cp-btn-block" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="cp-spin" /> Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="cp-auth-switch">
            Already have an account?{' '}
            <button type="button" className="cp-link" onClick={onNavigateLogin}>
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};
