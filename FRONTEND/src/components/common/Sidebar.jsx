import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Stethoscope,
  FileText,
  BedDouble,
  Receipt,
  FolderLock,
  LogOut,
  Activity,
  HeartPulse,
  Clock,
  FileCheck,
  Shield,
  CreditCard,
  User,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isPatient, isDoctor } = useAuth();

  // Role-specific navigation definitions
  const doctorNav = [
    { id: 'doctor-overview', label: 'Clinical Dashboard', icon: LayoutDashboard },
    { id: 'doctor-queue', label: "Today's Patient Queue", icon: Clock },
    { id: 'doctor-prescriptions', label: 'E-Prescription Studio', icon: FileCheck },
    { id: 'doctor-patients', label: 'My Patients & EMR', icon: Users },
    { id: 'doctor-scans', label: 'Diagnostics & Scans', icon: FolderLock },
  ];

  const patientNav = [
    { id: 'patient-overview', label: 'My Health Overview', icon: HeartPulse },
    { id: 'patient-booking', label: 'Book Consultation', icon: CalendarCheck },
    { id: 'patient-prescriptions', label: 'My Prescriptions', icon: FileCheck },
    { id: 'patient-reports', label: 'Lab Reports & Scans', icon: FolderLock },
    { id: 'patient-billing', label: 'Invoices & Receipts', icon: Receipt },
    { id: 'patient-profile', label: 'My Medical Profile', icon: User },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Hospital Intelligence', icon: LayoutDashboard },
    { id: 'admin-appointments', label: 'OPD Appointments', icon: CalendarCheck },
    { id: 'admin-patients', label: 'Patient Registry', icon: Users },
    { id: 'admin-doctors', label: 'Doctors Roster', icon: Stethoscope },
    { id: 'admin-wards', label: 'Wards & Bed Matrix', icon: BedDouble },
    { id: 'admin-prescriptions', label: 'Prescriptions & Pharmacy', icon: FileCheck },
    { id: 'admin-billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'admin-vault', label: 'Cloud Medical Vault', icon: FolderLock },
  ];

  let currentNav = adminNav;
  let portalTitle = 'Admin Suite';
  let portalIcon = Activity;
  let badgeText = 'Hospital Ops';

  if (isDoctor) {
    currentNav = doctorNav;
    portalTitle = 'Doctor Portal';
    portalIcon = Stethoscope;
    badgeText = 'Clinical Desk';
  } else if (isPatient) {
    currentNav = patientNav;
    portalTitle = 'Patient Hub';
    portalIcon = HeartPulse;
    badgeText = 'Personal Health';
  }

  const PortalIconComponent = portalIcon;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <PortalIconComponent size={22} />
        </div>
        <div className="brand-text">
          <span className="brand-title">CarePulse</span>
          <span className="brand-badge">{badgeText}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">{portalTitle}</div>
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="nav-item-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
            alt="User avatar"
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-name">{user?.name || 'Guest User'}</div>
            <div className="user-role-tag">{user?.role || 'Visitor'} • {user?.department || 'Care'}</div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            style={{ color: '#94a3b8', padding: '0.4rem', cursor: 'pointer' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
