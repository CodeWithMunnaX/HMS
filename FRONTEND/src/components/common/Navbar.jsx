import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Siren,
  Microscope,
  Pill,
  X,
  Trash2,
} from 'lucide-react';

export const Navbar = ({ onSearch, searchQuery }) => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'emergency',
      icon: Siren,
      color: '#dc2626',
      bg: '#fee2e2',
      title: 'Emergency Triage Alert',
      message: 'Trauma intake assigned to ER Bay 2 — Critical Care team dispatched.',
      time: '2 mins ago',
      read: false,
    },
    {
      id: 2,
      type: 'pharmacy',
      icon: Pill,
      color: '#0d9488',
      bg: '#ccfbf1',
      title: 'Pharmacy Dispense Fulfilled',
      message: 'Prescription RX-50001 for Alex Johnson marked as Dispensed.',
      time: '15 mins ago',
      read: false,
    },
    {
      id: 3,
      type: 'lab',
      icon: Microscope,
      color: '#4338ca',
      bg: '#e0e7ff',
      title: 'Pathology Biomarker Report Ready',
      message: 'Complete Blood Count (CBC) analysis completed for review.',
      time: '45 mins ago',
      read: false,
    },
    {
      id: 4,
      type: 'appointment',
      icon: Calendar,
      color: '#0284c7',
      bg: '#e0f2fe',
      title: 'New Consultation Confirmed',
      message: 'Token #104 scheduled with Dr. Sarah Jenkins (Cardiology).',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="app-navbar" style={{ position: 'relative', zIndex: 100 }}>
      <div className="navbar-search">
        <Search size={16} color="#64748b" />
        <input
          type="text"
          placeholder="Search patients, doctors, tokens, or invoices..."
          value={searchQuery || ''}
          onChange={(e) => onSearch && onSearch(e.target.value)}
        />
      </div>

      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0e7490', fontSize: '0.8125rem', fontWeight: '600' }}>
          <ShieldCheck size={16} />
          <span>CarePulse v1.0 • Secure HIPAA Ready</span>
        </div>

        {/* Notification Bell with Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            style={{
              position: 'relative',
              padding: '0.55rem',
              borderRadius: '50%',
              backgroundColor: isDropdownOpen ? '#e2e8f0' : '#f1f5f9',
              color: isDropdownOpen ? '#0e7490' : '#475569',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Hospital Clinical Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  borderRadius: '999px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: '0',
                width: '360px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out',
                zIndex: 1000,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Clinical Notifications</strong>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0891b2',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem auto', color: '#10b981' }} />
                    <p style={{ margin: 0, fontWeight: '600' }}>All caught up!</p>
                    <span style={{ fontSize: '0.75rem' }}>No new clinical alerts at this time.</span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: item.read ? '#ffffff' : '#f0fdfa',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: item.bg,
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={17} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <strong style={{ fontSize: '0.8125rem', color: '#0f172a' }}>{item.title}</strong>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{item.time}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.3' }}>
                            {item.message}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => clearNotification(item.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px',
                            opacity: 0.7,
                          }}
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>
                  CarePulse Hospital Alert Network • Real-Time Sync Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
