import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { ChatBot } from './components/common/ChatBot';

// Dedicated Role Portals
import { DoctorPortal } from './pages/doctor/DoctorPortal';
import { PatientPortal } from './pages/patient/PatientPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

// Auth & Landing Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import './styles/index.css';
import './styles/components.css';
import './styles/landing.css';
import './styles/portals.css';

// Pages available to each role, in sidebar order. URLs are /app/<tab>.
export const ROLE_TABS = {
  Admin: ['dashboard', 'appointments', 'patients', 'doctors', 'wards', 'prescriptions', 'billing', 'vault'],
  Receptionist: ['dashboard', 'appointments', 'patients', 'doctors', 'wards', 'prescriptions', 'billing', 'vault'],
  Doctor: ['overview', 'prescriptions', 'patients', 'scans'],
  Patient: ['overview', 'appointments', 'prescriptions', 'reports', 'billing', 'profile'],
};

const tabsForRole = (role) => ROLE_TABS[role] || ROLE_TABS.Admin;

// Small history-based router: keeps the URL in sync so Back/Refresh/shared links work
const usePath = () => {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === window.location.pathname) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  }, []);
  return [path, navigate];
};

const MainLayout = () => {
  const { user, loading, isDoctor, isPatient } = useAuth();
  const [path, navigate] = usePath();
  const [globalSearch, setGlobalSearch] = useState('');

  const appTab = path.startsWith('/app/') ? path.slice('/app/'.length).split('/')[0] : null;
  const allowedTabs = user ? tabsForRole(user.role) : [];
  const activeTab = allowedTabs.includes(appTab) ? appTab : allowedTabs[0];

  // Keep the URL valid for the current auth state
  useEffect(() => {
    if (loading) return;
    if (user && (!path.startsWith('/app/') || appTab !== activeTab)) {
      navigate(`/app/${activeTab}`, { replace: true });
    } else if (!user && path.startsWith('/app')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, path, appTab, activeTab, navigate]);

  const setActiveTab = useCallback((tab) => navigate(`/app/${tab}`), [navigate]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading CarePulse…</p>
      </div>
    );
  }

  // Unauthenticated: landing page, login or register based on the URL
  if (!user) {
    if (path === '/register') {
      return <Register onNavigateLogin={() => navigate('/login')} onNavigateHome={() => navigate('/')} />;
    }
    if (path === '/login' || path.startsWith('/app')) {
      return <Login onNavigateRegister={() => navigate('/register')} onNavigateHome={() => navigate('/')} />;
    }
    return <LandingPage onNavigateLogin={() => navigate('/login')} onNavigateRegister={() => navigate('/register')} />;
  }

  const renderActivePortal = () => {
    if (isDoctor) return <DoctorPortal subTab={activeTab} setSubTab={setActiveTab} />;
    if (isPatient) return <PatientPortal subTab={activeTab} setSubTab={setActiveTab} />;
    return <AdminPortal activeTab={activeTab} setActiveTab={setActiveTab} />;
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <RoleSwitcher />
        <Navbar onSearch={setGlobalSearch} searchQuery={globalSearch} />
        <main className="page-body">{renderActivePortal()}</main>
      </div>
      <ChatBot />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
