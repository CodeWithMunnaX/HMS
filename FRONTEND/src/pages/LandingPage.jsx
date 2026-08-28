import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EcgWaveform } from '../components/common/EcgWaveform';
import { Modal } from '../components/common/Modal';
import { AiScanAnalyzerModal } from '../components/scans/AiScanAnalyzerModal';
import { SymptomTriageModal } from '../components/triage/SymptomTriageModal';
import { AmbulanceTrackerModal } from '../components/emergency/AmbulanceTrackerModal';
import { TelehealthRoomModal } from '../components/telehealth/TelehealthRoomModal';
import { PathologyReportGeneratorModal } from '../components/lab/PathologyReportGeneratorModal';
import { PharmacyDispenserModal } from '../components/pharmacy/PharmacyDispenserModal';

import {
  Activity,
  Stethoscope,
  Shield,
  HeartPulse,
  User,
  Lock,
  Mail,
  ArrowRight,
  Video,
  Microscope,
  Siren,
  BedDouble,
  Receipt,
  Calendar,
  Sparkles,
  CheckCircle2,
  Star,
  Clock,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  FileText,
  Bot,
  Zap,
  Layers,
  Award,
  ShieldCheck,
  Building2,
  Users,
  Eye,
  Pill,
} from 'lucide-react';

export const LandingPage = ({ onNavigateLogin, onNavigateRegister }) => {
  const { login, switchDemoRole } = useAuth();
  const toast = useToast();

  // Interactive Live Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiScanModalOpen, setIsAiScanModalOpen] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [isTelehealthModalOpen, setIsTelehealthModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);

  // Auth Form State inside Modal
  const [authRole, setAuthRole] = useState('patient'); // 'patient', 'doctor', 'admin'
  const [email, setEmail] = useState('alex.johnson@example.com');
  const [password, setPassword] = useState('Patient@123');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const portalConfigs = {
    patient: {
      title: 'Patient Health Hub',
      badge: '👤 Patient Sign In',
      color: '#0891b2',
      defaultEmail: 'alex.johnson@example.com',
      defaultPass: 'Patient@123',
      role: 'Patient',
      desc: 'Access your personal health records, digital prescriptions, lab reports, and book OPD visits.',
    },
    doctor: {
      title: 'Doctor Clinical Suite',
      badge: '👨‍⚕️ Doctor Sign In',
      color: '#0284c7',
      defaultEmail: 'sarah.cardio@carepulse.com',
      defaultPass: 'Doctor@123',
      role: 'Doctor',
      desc: 'Review your live OPD queue, write digital E-Prescriptions with vitals, and view patient EMR.',
    },
    admin: {
      title: 'Hospital Admin & Ops',
      badge: '🛡️ Operations Suite',
      color: '#0e7490',
      defaultEmail: 'munna@gmail.com',
      defaultPass: 'munna@gmail.com',
      role: 'Admin',
      desc: 'Executive revenue analytics, inpatient bed matrix, doctor roster, and itemized billing ledger.',
    },
  };

  const handlePortalChange = (roleKey) => {
    setAuthRole(roleKey);
    const cfg = portalConfigs[roleKey];
    setEmail(cfg.defaultEmail);
    setPassword(cfg.defaultPass);
  };

  const handle1ClickLaunch = async (roleName) => {
    try {
      setAuthSubmitting(true);
      await switchDemoRole(roleName);
      toast.success(`Welcome to CarePulse ${roleName} Portal!`);
    } catch (err) {
      toast.error('Failed to log in with demo credentials');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning('Please provide both email and password');
    }

    try {
      setAuthSubmitting(true);
      await login(email, password);
      toast.success('Successfully authenticated to CarePulse!');
      setIsAuthModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const specialties = [
    {
      name: 'Cardiology & Heart Care',
      icon: HeartPulse,
      doctors: '8 Specialists',
      desc: 'Comprehensive cardiovascular diagnostics, 24/7 cath lab, ECG telemetry, and coronary care.',
      accent: '#06b6d4',
    },
    {
      name: 'Neurology & Brain Health',
      icon: Activity,
      doctors: '6 Specialists',
      desc: 'Advanced neuro-imaging, stroke management, EEG monitoring, and neuro-rehabilitation.',
      accent: '#3b82f6',
    },
    {
      name: 'Orthopedics & Joint Care',
      icon: Layers,
      doctors: '7 Specialists',
      desc: 'Joint replacement, trauma care, arthroscopy, and robotic-assisted spine surgery.',
      accent: '#10b981',
    },
    {
      name: 'Pediatrics & Neonatal ICU',
      icon: Sparkles,
      doctors: '5 Specialists',
      desc: 'Dedicated child wellness, newborn ICU level III, developmental pediatrics, and immunization.',
      accent: '#f59e0b',
    },
    {
      name: 'Emergency & Critical Care',
      icon: Siren,
      doctors: '12 Emergency MDs',
      desc: 'Level-1 Trauma center, rapid cardiac arrest response, and 24/7 dedicated triage bay.',
      accent: '#ef4444',
    },
    {
      name: 'Pathology & Diagnostic Imaging',
      icon: Microscope,
      doctors: '6 Pathologists',
      desc: 'Automated biochemical analysers, high-resolution MRI, CT scans, and ultrasound.',
      accent: '#8b5cf6',
    },
    {
      name: 'Pulmonology & Respiratory',
      icon: Stethoscope,
      doctors: '4 Specialists',
      desc: 'Advanced pulmonary function testing, bronchoscopy, allergy clinic, and asthma management.',
      accent: '#0891b2',
    },
    {
      name: 'Oncology & Chemotherapy',
      icon: Award,
      doctors: '5 Oncologists',
      desc: 'Precision targeted cancer therapy, day-care chemotherapy infusion, and surgical oncology.',
      accent: '#ec4899',
    },
  ];

  const featuredDoctors = [
    {
      name: 'Dr. Sarah Jenkins, MD',
      specialty: 'Cardiology & Heart Failure',
      qualifications: 'MD (Harvard), FACC',
      experience: '16+ Years Experience',
      rating: '4.95',
      fee: '$120 / Visit',
      avatar: 'SJ',
    },
    {
      name: 'Dr. Marcus Vance, MD, FACS',
      specialty: 'Chief Surgical Director',
      qualifications: 'MD (Johns Hopkins), FACS',
      experience: '22+ Years Experience',
      rating: '4.98',
      fee: '$180 / Visit',
      avatar: 'MV',
    },
    {
      name: 'Dr. Emily Chen, MD',
      specialty: 'Neurology & Stroke Lead',
      qualifications: 'MD, PhD (Stanford)',
      experience: '14+ Years Experience',
      rating: '4.92',
      fee: '$135 / Visit',
      avatar: 'EC',
    },
    {
      name: 'Dr. Robert Davis, MS',
      specialty: 'Orthopedic & Trauma Surgery',
      qualifications: 'MS Ortho, FAAOS',
      experience: '18+ Years Experience',
      rating: '4.94',
      fee: '$130 / Visit',
      avatar: 'RD',
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-mesh-bg" />

      <div className="landing-content-wrap">
        {/* Top Emergency Bar */}
        <div className="landing-top-bar">
          <div className="top-bar-left">
            <span className="emergency-pill">
              <span className="emergency-pulse-dot" />
              🚨 24/7 Emergency Trauma & Ambulance: +1 (800) 438-CARE
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
              Live OPD Queue: Active & Processing Tokens
            </span>
          </div>
          <div className="top-bar-right">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Instant 1-Click Portals:</span>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handle1ClickLaunch('Patient')}
            >
              👤 Patient
            </button>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handle1ClickLaunch('Doctor')}
            >
              👨‍⚕️ Doctor
            </button>
            <button
              type="button"
              className="quick-demo-pill"
              onClick={() => handle1ClickLaunch('Admin')}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Sticky Glass Navbar */}
        <header className="landing-nav">
          <div className="landing-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-logo">
              <Activity size={24} />
            </div>
            <div className="landing-brand-text">
              <div className="landing-brand-title">
                CarePulse <span style={{ color: '#38bdf8', fontWeight: '400', fontSize: '0.9rem' }}>HMS</span>
              </div>
              <div className="landing-brand-sub">Clinical Network</div>
            </div>
          </div>

          <nav className="landing-nav-links">
            <span className="landing-nav-link" onClick={() => scrollToSection('overview')}>
              Overview
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('portals')}>
              Portals
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('modules')}>
              AI & Tech Suite
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('specialties')}>
              Specialties
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('specialists')}>
              Specialists
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection('workflow')}>
              Care Workflow
            </span>
          </nav>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User size={15} /> Sign In
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handle1ClickLaunch('Patient')}
            >
              <Zap size={15} /> 1-Click Demo
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="landing-hero" id="overview">
          <div className="hero-badge">
            <Sparkles size={15} />
            <span>ISO 9001:2015 & HIPAA COMPLIANT SMART CLINICAL ECOSYSTEM</span>
          </div>

          <h1 className="hero-title">
            Next-Generation <span className="hero-title-gradient">Hospital Care</span> & Intelligent Clinical Operations
          </h1>

          <p className="hero-subtitle">
            Uniting deep AI diagnostic scan analysis, live inpatient ICU bed telemetry, encrypted telehealth video rooms,
            and real-time digital E-prescriptions in a synchronized medical management platform.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => scrollToSection('portals')}
            >
              🚀 Explore 1-Click Portals <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsTelehealthModalOpen(true)}
            >
              <Video size={18} color="#38bdf8" /> Virtual OPD Telehealth
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => setIsTriageModalOpen(true)}
            >
              <Bot size={18} color="#34d399" /> 24/7 AI Symptom Triage
            </button>
          </div>

          {/* Hero HUD Glass Cards */}
          <div className="hero-hud-grid">
            {/* HUD 1: Animated ECG Pulse */}
            <div className="hero-hud-card">
              <div className="hud-card-header">
                <span className="hud-title">Real-Time Vitals Telemetry</span>
                <div className="hud-icon-wrap">
                  <HeartPulse size={18} />
                </div>
              </div>
              <div className="hud-val-main">
                72 <span className="hud-val-unit">BPM</span>
              </div>
              <div style={{ margin: '0.6rem 0 0.4rem 0', height: '36px' }}>
                <EcgWaveform bpm={72} isAlert={false} height={36} color="#38bdf8" />
              </div>
              <div className="hud-subtext">
                <CheckCircle2 size={13} color="#10b981" /> Normal Sinus Rhythm (SpO2 99%)
              </div>
            </div>

            {/* HUD 2: Bed Capacity */}
            <div className="hero-hud-card">
              <div className="hud-card-header">
                <span className="hud-title">Inpatient Ward Matrix</span>
                <div className="hud-icon-wrap" style={{ color: '#10b981' }}>
                  <BedDouble size={18} />
                </div>
              </div>
              <div className="hud-val-main">
                88% <span className="hud-val-unit">Occupancy</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', margin: '0.75rem 0' }}>
                <div style={{ flex: 9, height: 6, background: '#ef4444', borderRadius: 3 }} title="ICU 94%" />
                <div style={{ flex: 8, height: 6, background: '#0891b2', borderRadius: 3 }} title="General 82%" />
                <div style={{ flex: 3, height: 6, background: '#10b981', borderRadius: 3 }} title="Deluxe Ready" />
              </div>
              <div className="hud-subtext">
                <Clock size={13} color="#38bdf8" /> 12 Emergency Beds Sanitized & Ready
              </div>
            </div>

            {/* HUD 3: AI Diagnostic Accuracy */}
            <div className="hero-hud-card">
              <div className="hud-card-header">
                <span className="hud-title">AI Diagnostic Precision</span>
                <div className="hud-icon-wrap" style={{ color: '#8b5cf6' }}>
                  <Microscope size={18} />
                </div>
              </div>
              <div className="hud-val-main">
                99.4% <span className="hud-val-unit">Accuracy</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.65rem', lineHeight: 1.4 }}>
                Multi-Organ Computer Vision (X-Ray, CT, Bone Fractures)
              </div>
              <div className="hud-subtext" style={{ marginTop: '0.65rem' }}>
                <CheckCircle2 size={13} color="#8b5cf6" /> Sub-second Anomaly Heatmap
              </div>
            </div>

            {/* HUD 4: OPD Live Token Queue */}
            <div className="hero-hud-card">
              <div className="hud-card-header">
                <span className="hud-title">Live OPD Queue</span>
                <div className="hud-icon-wrap" style={{ color: '#f59e0b' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div className="hud-val-main">
                Token #08 <span className="hud-val-unit">Now Serving</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.65rem' }}>
                Dr. Sarah Jenkins (Cardiology OPD - Room 302)
              </div>
              <div className="hud-subtext" style={{ marginTop: '0.65rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                Avg Wait Time: &lt; 8 Mins
              </div>
            </div>
          </div>
        </section>

        {/* Live Vitals Ribbon */}
        <section className="landing-vitals-ribbon">
          <div className="vitals-ribbon-inner">
            <div className="vital-stat-box">
              <div className="vital-stat-number">45+</div>
              <div className="vital-stat-label">Specialist Surgeons & MDs</div>
            </div>
            <div className="vital-stat-box">
              <div className="vital-stat-number">25,000+</div>
              <div className="vital-stat-label">Electronic Medical Records</div>
            </div>
            <div className="vital-stat-box">
              <div className="vital-stat-number">99.8%</div>
              <div className="vital-stat-label">Diagnostic Scan Accuracy</div>
            </div>
            <div className="vital-stat-box">
              <div className="vital-stat-number">&lt; 4 Mins</div>
              <div className="vital-stat-label">Emergency Ambulance ETA</div>
            </div>
            <div className="vital-stat-box">
              <div className="vital-stat-number">100%</div>
              <div className="vital-stat-label">Cloud Encrypted Vault</div>
            </div>
          </div>
        </section>

        {/* 3 Dedicated Portal Launchpads */}
        <section className="landing-section" id="portals">
          <div className="section-header-center">
            <div className="section-tag">
              <ShieldCheck size={14} /> Multi-Role RBAC Portals
            </div>
            <h2 className="section-title">Launch Your Dedicated Medical Portal</h2>
            <p className="section-subtitle">
              Choose your role below for instant 1-click access into customized clinical workspaces, or sign in with your verified credentials.
            </p>
          </div>

          <div className="portals-showcase-grid">
            {/* Portal 1: Patient Health Hub */}
            <div className="portal-launch-card">
              <div className="portal-card-top">
                <div className="portal-icon-box" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                  <HeartPulse size={28} />
                </div>
                <h3 className="portal-card-title">Patient Health Hub</h3>
                <p className="portal-card-desc">
                  Self-service portal for appointments, digital prescription wallet, and encrypted diagnostic scan records.
                </p>

                <ul className="portal-feature-list">
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> 1-Click Online OPD Consultation Booking
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Active Digital Prescriptions & Dosage Timers
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Cloud Laboratory & Diagnostic Scan Vault
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> 24/7 AI Medical Symptom Triage Checker
                  </li>
                </ul>

                <div className="portal-demo-creds">
                  Demo User: <span>alex.johnson@example.com</span> / <span>Patient@123</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-portal-launch btn btn-primary"
                disabled={authSubmitting}
                onClick={() => handle1ClickLaunch('Patient')}
              >
                <Zap size={16} /> Launch Patient Portal (1-Click)
              </button>
            </div>

            {/* Portal 2: Doctor Clinical Suite (Featured) */}
            <div className="portal-launch-card featured">
              <div className="portal-card-top">
                <div className="portal-icon-box" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}>
                  <Stethoscope size={28} />
                </div>
                <h3 className="portal-card-title">Doctor Clinical Suite</h3>
                <p className="portal-card-desc">
                  Complete outpatient management suite with live token queues, vitals logging, and digital RX studio.
                </p>

                <ul className="portal-feature-list">
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Real-Time OPD Patient Queue & Token Calls
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Digital RX Builder with Multi-Drug Schedules
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Longitudinal Patient EMR History & Allergies
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Integrated WebRTC Telehealth Video Rooms
                  </li>
                </ul>

                <div className="portal-demo-creds">
                  Demo Doctor: <span>sarah.cardio@carepulse.com</span> / <span>Doctor@123</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-portal-launch btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                disabled={authSubmitting}
                onClick={() => handle1ClickLaunch('Doctor')}
              >
                <Zap size={16} /> Launch Doctor Suite (1-Click)
              </button>
            </div>

            {/* Portal 3: Hospital Admin & Reception */}
            <div className="portal-launch-card">
              <div className="portal-card-top">
                <div className="portal-icon-box" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)' }}>
                  <Shield size={28} />
                </div>
                <h3 className="portal-card-title">Hospital Admin & Ops</h3>
                <p className="portal-card-desc">
                  Executive governance dashboard for bed matrix, doctor rosters, revenue analytics, and billing invoices.
                </p>

                <ul className="portal-feature-list">
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Executive Financial Ledger & Revenue Analytics
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Inpatient ICU, Emergency & Deluxe Bed Allocator
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Itemized Billing Generator & Tax Invoices
                  </li>
                  <li className="portal-feature-item">
                    <CheckCircle2 size={16} /> Pharmacy Dispenser & Stock Inventory Alerts
                  </li>
                </ul>

                <div className="portal-demo-creds">
                  Demo Admin: <span>munna@gmail.com</span> / <span>munna@gmail.com</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-portal-launch btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)' }}
                disabled={authSubmitting}
                onClick={() => handle1ClickLaunch('Admin')}
              >
                <Zap size={16} /> Launch Admin Suite (1-Click)
              </button>
            </div>
          </div>
        </section>

        {/* Clinical Modules & Technology Bento Grid */}
        <section className="landing-section" id="modules" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="section-header-center">
            <div className="section-tag">
              <Sparkles size={14} /> Intelligence & Operations
            </div>
            <h2 className="section-title">Comprehensive Hospital Technology Suite</h2>
            <p className="section-subtitle">
              Click any module below to launch an interactive live test preview directly inside your browser.
            </p>
          </div>

          <div className="modules-bento-grid">
            {/* Module 1: AI Scan Analyzer */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
                  <Microscope size={22} />
                </div>
                <h3 className="module-card-title">AI Diagnostic Scan Analyzer</h3>
                <p className="module-card-desc">
                  Neural computer vision scanner that evaluates chest X-Rays for pneumonia, brain CT scans, and bone fractures with confidence scoring.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                onClick={() => setIsAiScanModalOpen(true)}
              >
                <Eye size={14} /> Try Live Scan Analyzer &rarr;
              </button>
            </div>

            {/* Module 2: Symptom Triage */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Bot size={22} />
                </div>
                <h3 className="module-card-title">24/7 AI Symptom Triage</h3>
                <p className="module-card-desc">
                  Interactive clinical symptom checker calculating urgency level (Emergency, Urgent, Routine) and routing to the right specialty doctor.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' }}
                onClick={() => setIsTriageModalOpen(true)}
              >
                <Bot size={14} /> Test Symptom Triage &rarr;
              </button>
            </div>

            {/* Module 3: Virtual Telehealth */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Video size={22} />
                </div>
                <h3 className="module-card-title">HD Virtual OPD Telehealth</h3>
                <p className="module-card-desc">
                  Encrypted clinical video consultation rooms featuring real-time doctor prescription scratchpads and patient vitals overlay.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                style={{ color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.25)' }}
                onClick={() => setIsTelehealthModalOpen(true)}
              >
                <Video size={14} /> Launch Telehealth Demo &rarr;
              </button>
            </div>

            {/* Module 4: Ambulance GPS Tracker */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                  <Siren size={22} />
                </div>
                <h3 className="module-card-title">Emergency Ambulance GPS</h3>
                <p className="module-card-desc">
                  Real-time emergency fleet dispatch tracker with simulated live GPS routes, paramedic radio link, and emergency room alerts.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)' }}
                onClick={() => setIsAmbulanceModalOpen(true)}
              >
                <Siren size={14} /> Track Ambulance Fleet &rarr;
              </button>
            </div>

            {/* Module 5: Pathology Lab Report Studio */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                  <FileText size={22} />
                </div>
                <h3 className="module-card-title">Automated Pathology Studio</h3>
                <p className="module-card-desc">
                  Biochemical laboratory report generator (Complete Blood Count, Lipid Profile, Liver Panel) with automatic abnormal value detection.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                style={{ color: '#a78bfa', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.25)' }}
                onClick={() => setIsLabModalOpen(true)}
              >
                <Microscope size={14} /> Generate Lab Report &rarr;
              </button>
            </div>

            {/* Module 6: Pharmacy Dispenser */}
            <div className="module-card">
              <div>
                <div className="module-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Pill size={22} />
                </div>
                <h3 className="module-card-title">Pharmacy Dispenser & Stock</h3>
                <p className="module-card-desc">
                  Digital pharmacy dispenser verifying prescription dosages, batch numbers, inventory levels, and contraindication alerts.
                </p>
              </div>
              <button
                type="button"
                className="module-interactive-trigger"
                style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' }}
                onClick={() => setIsPharmacyModalOpen(true)}
              >
                <Pill size={14} /> Open Pharmacy Dispenser &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* Clinical Specialties Directory */}
        <section className="landing-section" id="specialties">
          <div className="section-header-center">
            <div className="section-tag">
              <Building2 size={14} /> World-Class Care
            </div>
            <h2 className="section-title">Specialized Clinical Departments</h2>
            <p className="section-subtitle">
              CarePulse houses leading clinical centers of excellence equipped with advanced surgical suites and 24/7 care.
            </p>
          </div>

          <div className="specialties-grid">
            {specialties.map((spec, idx) => {
              const SpecIcon = spec.icon;
              return (
                <div key={idx} className="specialty-card">
                  <div className="specialty-header">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${spec.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: spec.accent }}>
                      <SpecIcon size={20} />
                    </div>
                    <span style={{ fontSize: '0.725rem', fontWeight: '700', color: spec.accent, background: `${spec.accent}15`, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                      {spec.doctors}
                    </span>
                  </div>
                  <h4 className="specialty-name">{spec.name}</h4>
                  <p className="specialty-desc">{spec.desc}</p>
                  <div className="specialty-footer">
                    <span>OPD Mon - Sat</span>
                    <button
                      type="button"
                      style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={() => handle1ClickLaunch('Patient')}
                    >
                      Book OPD &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Specialist Doctors Showcase */}
        <section className="landing-section" id="specialists" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div className="section-header-center">
            <div className="section-tag">
              <Users size={14} /> Leading Medical Faculty
            </div>
            <h2 className="section-title">Meet Our Senior Specialist Doctors</h2>
            <p className="section-subtitle">
              Board-certified physicians and surgeons delivering evidence-based compassionate clinical care.
            </p>
          </div>

          <div className="doctors-preview-grid">
            {featuredDoctors.map((doc, idx) => (
              <div key={idx} className="doctor-preview-card">
                <div className="doctor-avatar-circle">{doc.avatar}</div>
                <h4 className="doctor-name">{doc.name}</h4>
                <div className="doctor-specialty-badge">{doc.specialty}</div>
                <div style={{ fontSize: '0.785rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  {doc.qualifications} • {doc.experience}
                </div>
                <div className="doctor-rating-row">
                  <Star size={14} fill="#fbbf24" />
                  <span>{doc.rating} / 5.0 (300+ Consultations)</span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  style={{ width: '100%', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#38bdf8' }}
                  onClick={() => handle1ClickLaunch('Patient')}
                >
                  <Calendar size={14} /> Book Consultation ({doc.fee})
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Patient Care Workflow */}
        <section className="landing-section" id="workflow">
          <div className="section-header-center">
            <div className="section-tag">
              <Activity size={14} /> Seamless Healthcare
            </div>
            <h2 className="section-title">The CarePulse Patient Journey</h2>
            <p className="section-subtitle">
              Experience end-to-end digital hospital workflows designed for maximum transparency and speed.
            </p>
          </div>

          <div className="journey-roadmap">
            <div className="journey-step-card">
              <div className="journey-step-number">01</div>
              <h4 className="journey-step-title">Online OPD Booking</h4>
              <p className="journey-step-desc">
                Select your specialty doctor, pick a convenient time slot, and receive your instant digital queue token.
              </p>
            </div>

            <div className="journey-step-card">
              <div className="journey-step-number">02</div>
              <h4 className="journey-step-title">Clinical Consultation</h4>
              <p className="journey-step-desc">
                Attend in-person or launch an encrypted HD telehealth video consultation with live doctor notes.
              </p>
            </div>

            <div className="journey-step-card">
              <div className="journey-step-number">03</div>
              <h4 className="journey-step-title">Digital E-Prescription</h4>
              <p className="journey-step-desc">
                Receive standardized electronic prescriptions complete with vital signs, drug dosages, and meal timings.
              </p>
            </div>

            <div className="journey-step-card">
              <div className="journey-step-number">04</div>
              <h4 className="journey-step-title">Diagnostic Vault</h4>
              <p className="journey-step-desc">
                Access AI-analyzed X-Rays, automated pathology lab reports, and itemized billing receipts in your cloud wallet.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Trauma & Hotline Banner */}
        <section style={{ maxWidth: 1440, margin: '0 auto', padding: '0 2.5rem' }}>
          <div className="emergency-banner-card">
            <div className="emergency-banner-text">
              <h3>
                <Siren size={30} color="#f87171" /> 24/7 Level-1 Emergency Trauma Center
              </h3>
              <p>
                Our rapid emergency dispatch team and acute care resuscitation bay are fully staffed around the clock.
                Call our dedicated hotline for immediate ambulance dispatch or critical admission.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-emergency-action"
                onClick={() => setIsAmbulanceModalOpen(true)}
              >
                <Siren size={18} /> Track Emergency Ambulances
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '0.9rem 1.5rem' }}
                onClick={() => setIsTriageModalOpen(true)}
              >
                <Phone size={18} /> +1 (800) 438-CARE
              </button>
            </div>
          </div>
        </section>

        {/* Modern Hospital Footer */}
        <footer className="landing-footer">
          <div className="footer-inner">
            <div className="footer-brand-col">
              <div className="landing-nav-brand">
                <div className="landing-brand-logo">
                  <Activity size={24} />
                </div>
                <div className="landing-brand-text">
                  <div className="landing-brand-title">
                    CarePulse <span style={{ color: '#38bdf8', fontWeight: '400', fontSize: '0.9rem' }}>HMS</span>
                  </div>
                  <div className="landing-brand-sub">Clinical Network</div>
                </div>
              </div>
              <p>
                CarePulse Hospital Management System delivers enterprise-grade clinical operations, AI diagnostic computer vision,
                inpatient bed management, and role-based access for healthcare providers worldwide.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <span className="badge badge-teal">ISO 9001:2015</span>
                <span className="badge badge-teal">HIPAA Compliant</span>
                <span className="badge badge-teal">HL7/FHIR Ready</span>
              </div>
            </div>

            <div>
              <h5 className="footer-col-title">Portal Workspaces</h5>
              <ul className="footer-links">
                <li><span onClick={() => handle1ClickLaunch('Patient')}>Patient Health Hub</span></li>
                <li><span onClick={() => handle1ClickLaunch('Doctor')}>Doctor Clinical Suite</span></li>
                <li><span onClick={() => handle1ClickLaunch('Admin')}>Chief Admin Portal</span></li>
                <li><span onClick={() => handle1ClickLaunch('Admin')}>Ward & Bed Allocator</span></li>
                <li><span onClick={() => handle1ClickLaunch('Admin')}>Billing & Invoicing</span></li>
              </ul>
            </div>

            <div>
              <h5 className="footer-col-title">AI & Intelligence</h5>
              <ul className="footer-links">
                <li><span onClick={() => setIsAiScanModalOpen(true)}>AI Diagnostic Scan Analyzer</span></li>
                <li><span onClick={() => setIsTriageModalOpen(true)}>24/7 AI Symptom Triage</span></li>
                <li><span onClick={() => setIsTelehealthModalOpen(true)}>Virtual HD Telehealth Room</span></li>
                <li><span onClick={() => setIsAmbulanceModalOpen(true)}>Ambulance GPS Dispatch</span></li>
                <li><span onClick={() => setIsLabModalOpen(true)}>Automated Pathology Studio</span></li>
              </ul>
            </div>

            <div>
              <h5 className="footer-col-title">Hospital Information</h5>
              <ul className="footer-links">
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <MapPin size={14} color="#38bdf8" /> 742 Evergreen Healthcare Ave, Boston, MA
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <Phone size={14} color="#38bdf8" /> 24/7 Helpline: +1 (800) 438-CARE
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                  <Mail size={14} color="#38bdf8" /> clinical-helpdesk@carepulse.com
                </li>
                <li><span onClick={() => setIsAuthModalOpen(true)}>Staff / Doctor Portal Sign In</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>&copy; {new Date().getFullYear()} CarePulse Clinical Network Inc. All Rights Reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Privacy Policy</span>
              <span>Terms of Clinical Service</span>
              <span>HIPAA Compliance Notice</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Integrated Auth Modal (Sign In / Fast Demo Switcher) */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign In to CarePulse Clinical Network"
        maxWidth="520px"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem', textAlign: 'center' }}>
            Select your clinical portal or use instant 1-click authentication:
          </p>

          <div className="auth-portal-selector-bar">
            <button
              type="button"
              className={`auth-portal-tab-btn ${authRole === 'patient' ? 'active' : ''}`}
              style={{ color: authRole === 'patient' ? '#0891b2' : '#64748b' }}
              onClick={() => handlePortalChange('patient')}
            >
              <HeartPulse size={16} /> Patient
            </button>
            <button
              type="button"
              className={`auth-portal-tab-btn ${authRole === 'doctor' ? 'active' : ''}`}
              style={{ color: authRole === 'doctor' ? '#0284c7' : '#64748b' }}
              onClick={() => handlePortalChange('doctor')}
            >
              <Stethoscope size={16} /> Doctor
            </button>
            <button
              type="button"
              className={`auth-portal-tab-btn ${authRole === 'admin' ? 'active' : ''}`}
              style={{ color: authRole === 'admin' ? '#0e7490' : '#64748b' }}
              onClick={() => handlePortalChange('admin')}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0f172a' }}>
                {portalConfigs[authRole].title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {portalConfigs[authRole].desc}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={authSubmitting}
              onClick={() => handle1ClickLaunch(portalConfigs[authRole].role)}
            >
              ⚡ 1-Click
            </button>
          </div>

          <form onSubmit={handleAuthSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
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
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
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
              disabled={authSubmitting}
            >
              {authSubmitting ? 'Authenticating...' : `Sign In to ${portalConfigs[authRole].title}`}
            </button>
          </form>

          {authRole === 'patient' && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: '#64748b' }}>
              New patient?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  if (onNavigateRegister) onNavigateRegister();
                }}
                style={{ color: '#0891b2', fontWeight: '800', cursor: 'pointer' }}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Interactive AI Scan Analyzer Preview */}
      <AiScanAnalyzerModal
        isOpen={isAiScanModalOpen}
        onClose={() => setIsAiScanModalOpen(false)}
      />

      {/* Interactive Symptom Triage Modal */}
      <SymptomTriageModal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        onBookDepartment={() => {
          setIsTriageModalOpen(false);
          handle1ClickLaunch('Patient');
        }}
      />

      {/* Interactive Ambulance GPS Modal */}
      <AmbulanceTrackerModal
        isOpen={isAmbulanceModalOpen}
        onClose={() => setIsAmbulanceModalOpen(false)}
      />

      {/* Interactive Telehealth Room Modal */}
      <TelehealthRoomModal
        isOpen={isTelehealthModalOpen}
        onClose={() => setIsTelehealthModalOpen(false)}
        appointment={{
          _id: 'demo-telehealth-01',
          patientId: { name: 'Alex Johnson', age: 28, gender: 'Male', bloodGroup: 'O+' },
          doctorId: { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology' },
          reason: 'Routine Cardiac Follow-Up & ECG Telemetry Review',
        }}
      />

      {/* Interactive Pathology Report Generator Modal */}
      <PathologyReportGeneratorModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        patient={{ _id: 'demo-p1', name: 'Alex Johnson', age: 28, gender: 'Male', bloodGroup: 'O+' }}
      />

      {/* Interactive Pharmacy Dispenser Modal */}
      <PharmacyDispenserModal
        isOpen={isPharmacyModalOpen}
        onClose={() => setIsPharmacyModalOpen(false)}
        prescription={{
          _id: 'rx-demo-01',
          patientId: { name: 'Alex Johnson', age: 28, gender: 'Male' },
          doctorId: { name: 'Dr. Sarah Jenkins' },
          medicines: [
            { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 Days' },
            { name: 'Metoprolol Succinate', dosage: '50mg', frequency: 'Once daily morning', duration: '30 Days' },
          ],
        }}
      />
    </div>
  );
};

