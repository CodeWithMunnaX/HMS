import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, CheckCircle2, Calendar, Siren, Microscope, Pill, X } from 'lucide-react';
import { Avatar } from './Avatar';

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
    <header className="app-navbar">
      <div className="navbar-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search patients, doctors, tokens, or invoices..."
          value={searchQuery || ''}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          aria-label="Search"
        />
      </div>

      <div className="navbar-right">
        {/* Notification bell with dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className={`navbar-icon-btn ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
          </button>

          {isDropdownOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>Notifications</strong>
                  {unreadCount > 0 && <span className="badge badge-rose">{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button type="button" className="notif-link-btn" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <CheckCircle2 size={28} style={{ margin: '0 auto 0.5rem auto', color: 'var(--success-500)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--slate-700)' }}>All caught up</p>
                    <span style={{ fontSize: '0.75rem' }}>No new alerts right now.</span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`notif-item ${item.read ? '' : 'unread'}`}
                        onClick={() => markAsRead(item.id)}
                      >
                        <div className="notif-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                          <Icon size={17} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="notif-title-row">
                            <strong>{item.title}</strong>
                            <span className="notif-time">{item.time}</span>
                          </div>
                          <p className="notif-message">{item.message}</p>
                        </div>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={(e) => clearNotification(item.id, e)}
                          title="Dismiss"
                          aria-label="Dismiss notification"
                          style={{ padding: '2px' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <span className="navbar-divider" />

        {user && (
          <div className="navbar-user">
            <Avatar src={user.avatar} name={user.name || 'User'} size={34} shape="circle" />
            <div className="navbar-user-text">
              <span className="navbar-user-name">{user.name}</span>
              <span className="navbar-user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
