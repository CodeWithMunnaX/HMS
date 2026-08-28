import React, { useState, useEffect } from 'react';
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

const MainLayout = () => {
  const { user, loading, isDoctor, isPatient } = useAuth();
  const [activeTab, setActiveTab] = useState('admin-dashboard');
  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'register'
  const [globalSearch, setGlobalSearch] = useState('');

  // Automatically sync default tab when role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'Doctor') {
        setActiveTab('doctor-overview');
      } else if (user.role === 'Patient') {
        setActiveTab('patient-overview');
      } else {
        setActiveTab('admin-dashboard');
      }
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1329', color: '#38bdf8' }}>
        <h2 style={{ fontWeight: '700', letterSpacing: '-0.02em' }}>Connecting to CarePulse Clinical Network...</h2>
      </div>
    );
  }

  // If unauthenticated, display Landing Page, Login, or Register
  if (!user) {
    if (authView === 'register') {
      return (
        <Register
          onNavigateLogin={() => setAuthView('login')}
          onNavigateHome={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'login') {
      return (
        <Login
          onNavigateRegister={() => setAuthView('register')}
          onNavigateHome={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onNavigateLogin={() => setAuthView('login')}
        onNavigateRegister={() => setAuthView('register')}
      />
    );
  }

  const renderActivePortal = () => {
    if (isDoctor) {
      return <DoctorPortal subTab={activeTab} setSubTab={setActiveTab} />;
    }
    if (isPatient) {
      return <PatientPortal subTab={activeTab} setSubTab={setActiveTab} />;
    }
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
