import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  ArrowRight,
  BedDouble,
  Bot,
  Calendar,
  CalendarCheck,
  ClipboardList,
  FileText,
  FolderLock,
  HeartPulse,
  Loader2,
  Menu,
  Pill,
  Receipt,
  Shield,
  Stethoscope,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'departments', label: 'Departments' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'demo', label: 'Demo' },
];

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Appointments',
    text: 'Book, reschedule and track OPD visits with live doctor availability.',
  },
  {
    icon: Users,
    title: 'Patient records',
    text: 'One profile per patient with demographics, history and visit timeline.',
  },
  {
    icon: Pill,
    title: 'E-prescriptions',
    text: 'Doctors write digital prescriptions with vitals, dosage and notes.',
  },
  {
    icon: BedDouble,
    title: 'Ward & bed management',
    text: 'See occupancy by ward, admit patients and free beds on discharge.',
  },
  {
    icon: Receipt,
    title: 'Billing',
    text: 'Itemised invoices for consultations, procedures and stays, with payment status.',
  },
  {
    icon: Bot,
    title: 'AI symptom triage',
    text: 'A chatbot assistant that suggests a likely department before booking.',
  },
  {
    icon: FolderLock,
    title: 'Medical file vault',
    text: 'Upload and organise lab reports, scans and documents per patient.',
  },
  {
    icon: Shield,
    title: 'Role-based portals',
    text: 'Separate workspaces for Admin, Doctor, Receptionist and Patient.',
  },
];

const DEPARTMENTS = [
  {
    img: '/images/operation-theatre.webp',
    alt: 'Surgical team operating in a modern operation theatre',
    title: 'Surgery & operation theatres',
    text: 'Schedule procedures and keep surgical notes with the patient record.',
  },
  {
    img: '/images/diagnostics-lab.webp',
    alt: 'Radiology staff reviewing scans at a diagnostics workstation',
    title: 'Diagnostics & radiology',
    text: 'Attach lab results and imaging reports to each visit.',
  },
  {
    img: '/images/private-room.webp',
    alt: 'Private inpatient room with a hospital bed',
    title: 'Inpatient wards',
    text: 'Track general wards and private rooms bed by bed.',
  },
  {
    img: '/images/emergency.webp',
    alt: 'Hospital staff moving equipment quickly down a corridor',
    title: 'Emergency care',
    text: 'Register walk-in emergencies quickly from the front desk.',
  },
  {
    img: '/images/icu-monitor.webp',
    alt: 'Patient monitor in an intensive care unit',
    title: 'Intensive care (ICU)',
    text: 'Manage critical-care beds alongside the rest of the hospital.',
  },
];

const STEPS = [
  {
    icon: Calendar,
    title: 'Book',
    text: 'Patients book online or at reception, optionally guided by the AI triage assistant.',
  },
  {
    icon: Stethoscope,
    title: 'Consult',
    text: "The doctor sees the visit in today's queue, reviews history and records findings.",
  },
  {
    icon: FileText,
    title: 'Prescription & billing',
    text: 'An e-prescription is issued and the invoice is generated for the visit.',
  },
];

const DEMO_ROLES = [
  {
    role: 'Admin',
    icon: Shield,
    email: 'munna@gmail.com',
    text: 'Hospital overview, staff, wards, billing and reports.',
  },
  {
    role: 'Doctor',
    icon: Stethoscope,
    email: 'sarah.cardio@carepulse.com',
    text: 'Consultation queue, patient history and e-prescriptions.',
  },
  {
    role: 'Receptionist',
    icon: ClipboardList,
    email: 'reception@carepulse.com',
    text: 'Patient registration, appointments and bed allocation.',
  },
  {
    role: 'Patient',
    icon: UserRound,
    email: 'alex.johnson@example.com',
    text: 'Book visits, view prescriptions, bills and medical files.',
  },
];

const STATS = [
  { value: '4', label: 'role-based portals' },
  { value: '8', label: 'hospital modules' },
  { value: '24/7', label: 'AI triage assistant' },
];

export const LandingPage = ({ onNavigateLogin, onNavigateRegister }) => {
  const { switchDemoRole } = useAuth();
  const toast = useToast();
  const [loadingRole, setLoadingRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDemoLogin = async (roleName) => {
    if (loadingRole) return;
    try {
      setLoadingRole(roleName);
      await switchDemoRole(roleName);
      toast.success(`Signed in to the ${roleName} demo`);
    } catch (err) {
      toast.error(err?.message || 'Could not sign in to the demo account. Please try again.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="cp-landing">
      {/* ---------------- Header ---------------- */}
      <header className={`cp-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="cp-container cp-header-inner">
          <a
            href="#top"
            className="cp-logo"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="cp-logo-mark">
              <Activity size={18} />
            </span>
            CarePulse
          </a>

          <nav className={`cp-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.id);
                }}
              >
                {link.label}
              </a>
            ))}
            <div className="cp-nav-mobile-actions">
              <button type="button" className="cp-btn cp-btn-outline" onClick={onNavigateLogin}>
                Sign in
              </button>
              <button type="button" className="cp-btn cp-btn-primary" onClick={() => scrollToSection('demo')}>
                Try live demo
              </button>
            </div>
          </nav>

          <div className="cp-header-actions">
            <button type="button" className="cp-btn cp-btn-ghost" onClick={onNavigateLogin}>
              Sign in
            </button>
            <button type="button" className="cp-btn cp-btn-primary" onClick={() => scrollToSection('demo')}>
              Try live demo
            </button>
          </div>

          <button
            type="button"
            className="cp-menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        {/* ---------------- Hero ---------------- */}
        <section className="cp-hero">
          <div className="cp-container cp-hero-grid">
            <div className="cp-hero-copy">
              <span className="cp-eyebrow">
                <HeartPulse size={14} /> Hospital management system
              </span>
              <h1>Run your hospital from one calm, connected workspace.</h1>
              <p className="cp-hero-sub">
                Appointments, patient records, prescriptions, wards and billing, with a dedicated portal for every
                role.
              </p>
              <div className="cp-hero-ctas">
                <button
                  type="button"
                  className="cp-btn cp-btn-primary cp-btn-lg"
                  onClick={() => scrollToSection('demo')}
                >
                  Try live demo <ArrowRight size={18} />
                </button>
                <button type="button" className="cp-btn cp-btn-outline cp-btn-lg" onClick={onNavigateRegister}>
                  Create account
                </button>
              </div>
              <ul className="cp-stats">
                {STATS.map((s) => (
                  <li key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cp-hero-media">
              <img
                src="/images/nurse.webp"
                alt="Nurse in uniform with a stethoscope on a hospital ward"
                width="1800"
                height="1013"
                fetchPriority="high"
              />
              <div className="cp-float-card">
                <span className="cp-float-icon">
                  <CalendarCheck size={18} />
                </span>
                <div>
                  <strong>Today: 12 appointments</strong>
                  <span>Sample data from the demo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="cp-section">
          <div className="cp-container">
            <div className="cp-section-head">
              <span className="cp-eyebrow">Features</span>
              <h2>Everything a hospital team handles day to day</h2>
              <p>Eight modules that share one patient record, so nobody re-enters the same details twice.</p>
            </div>
            <div className="cp-feature-grid">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="cp-card cp-feature">
                  <span className="cp-icon-tile">
                    <Icon size={20} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Departments ---------------- */}
        <section id="departments" className="cp-section cp-section-tint">
          <div className="cp-container">
            <div className="cp-section-head">
              <span className="cp-eyebrow">Departments</span>
              <h2>Built around how hospital departments work</h2>
              <p>From the front desk to the ICU, each area is managed in the same system.</p>
            </div>
            <div className="cp-dept-grid">
              {DEPARTMENTS.map((d) => (
                <article key={d.title} className="cp-card cp-dept">
                  <div className="cp-dept-img">
                    <img src={d.img} alt={d.alt} loading="lazy" />
                  </div>
                  <div className="cp-dept-body">
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how-it-works" className="cp-section">
          <div className="cp-container cp-how-grid">
            <div className="cp-how-media">
              <img
                src="/images/care-team.webp"
                alt="Doctor and nurse reviewing patient details on a tablet"
                loading="lazy"
              />
            </div>
            <div>
              <div className="cp-section-head cp-left">
                <span className="cp-eyebrow">How it works</span>
                <h2>From booking to billing in three steps</h2>
                <p>Every visit follows the same simple path, and each step is visible to the right people.</p>
              </div>
              <ol className="cp-steps">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="cp-step">
                    <span className="cp-step-num">{i + 1}</span>
                    <div>
                      <h3>
                        <Icon size={18} /> {title}
                      </h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------- Demo ---------------- */}
        <section id="demo" className="cp-section cp-section-tint">
          <div className="cp-container">
            <div className="cp-section-head">
              <span className="cp-eyebrow">Live demo</span>
              <h2>Explore any portal with one click</h2>
              <p>Each button signs you in to a seeded demo account. No sign-up needed.</p>
            </div>
            <div className="cp-demo-grid">
              {DEMO_ROLES.map(({ role, icon: Icon, email, text }) => {
                const isLoading = loadingRole === role;
                return (
                  <article key={role} className="cp-card cp-demo">
                    <span className="cp-icon-tile">
                      <Icon size={20} />
                    </span>
                    <h3>{role}</h3>
                    <p>{text}</p>
                    <div className="cp-demo-email" title={email}>
                      {email}
                    </div>
                    <button
                      type="button"
                      className="cp-btn cp-btn-primary cp-btn-block"
                      onClick={() => handleDemoLogin(role)}
                      disabled={Boolean(loadingRole)}
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="cp-spin" /> Signing in…
                        </>
                      ) : (
                        <>
                          Open {role} demo <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="cp-demo-note">
              One-click demo login. Prefer your own account?{' '}
              <button type="button" className="cp-link" onClick={onNavigateRegister}>
                Create one
              </button>{' '}
              or{' '}
              <button type="button" className="cp-link" onClick={onNavigateLogin}>
                sign in
              </button>
              .
            </p>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="cp-footer">
        <div className="cp-container cp-footer-inner">
          <span className="cp-logo cp-logo-sm">
            <span className="cp-logo-mark">
              <Activity size={14} />
            </span>
            CarePulse
          </span>
          <p>
            © {new Date().getFullYear()} CarePulse HMS · Built by{' '}
            <a href="https://codewithmunnax.com" target="_blank" rel="noopener noreferrer">
              CodeWithMunnaX
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
