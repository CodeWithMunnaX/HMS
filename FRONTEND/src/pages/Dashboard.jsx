import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { AmbulanceTrackerModal } from '../components/emergency/AmbulanceTrackerModal';
import { PharmacyInventoryModal } from '../components/pharmacy/PharmacyInventoryModal';
import {
  Siren,
  Package,
  Users,
  Stethoscope,
  Calendar,
  BedDouble,
  DollarSign,
  TrendingUp,
  Clock,
  FileCheck,
  HeartPulse,
  Receipt,
  PlusCircle,
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="app-loading-spinner" style={{ margin: '0 auto 1rem auto' }} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // DOCTOR DASHBOARD VIEW
  if (user?.role === 'Doctor') {
    const queue = data?.todayQueue || [];
    const metrics = data?.metrics || {};

    return (
      <div>
        <div className="page-header">
          <div className="page-header-title">
            <h1>Doctor Portal — {user?.name}</h1>
            <p>Welcome back. Here is your consultation queue and clinical schedule for today.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setActiveTab('prescriptions')}>
              <PlusCircle size={16} /> New E-Prescription
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            label="Today's Patient Queue"
            value={metrics.todayCount || queue.length}
            subtext="Assigned consultations"
            icon={Clock}
            color="teal"
          />
          <StatCard
            label="Completed Today"
            value={metrics.completedAppointments || 0}
            subtext="Consultations finished"
            icon={FileCheck}
            color="emerald"
          />
          <StatCard
            label="Total Prescriptions Issued"
            value={metrics.prescriptionsCount || 0}
            subtext="Digital EMR records"
            icon={FileCheck}
            color="indigo"
          />
          <StatCard
            label="Doctor Rating"
            value={`${metrics.rating || 4.9} ★`}
            subtext={`${metrics.experienceYears || 10} Years Clinical Exp`}
            icon={TrendingUp}
            color="amber"
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Live Patient Queue (Today)</h2>
              <p className="card-subtitle">Patients scheduled for today's consultation sessions</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
              View Full Schedule
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Patient Name</th>
                  <th>ID / Age / Gender</th>
                  <th>Time Slot</th>
                  <th>Reason / Symptoms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      No appointments in queue for today.
                    </td>
                  </tr>
                ) : (
                  queue.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong className="text-link">
                          #{app.tokenNumber}
                        </strong>
                      </td>
                      <td>
                        <strong>{app.patient?.name || 'Walk-in Patient'}</strong>
                        <div className="text-muted-sm">{app.patient?.phone}</div>
                      </td>
                      <td>
                        {app.patient?.patientId || 'PAT-TEMP'} • {app.patient?.age}y ({app.patient?.gender})
                      </td>
                      <td>{app.timeSlot}</td>
                      <td>{app.reasonForVisit}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setActiveTab('prescriptions')}
                        >
                          Prescribe
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // PATIENT DASHBOARD VIEW
  if (user?.role === 'Patient') {
    const metrics = data?.metrics || {};
    const appointments = data?.myAppointments || [];
    const prescriptions = data?.myPrescriptions || [];

    return (
      <div>
        <div className="page-header">
          <div className="page-header-title">
            <h1>Patient Health Hub — {user?.name}</h1>
            <p>Track your upcoming appointments, prescriptions, and medical reports in one place.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setActiveTab('appointments')}>
              <Calendar size={16} /> Book Appointment
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard
            label="Total Visits"
            value={metrics.totalVisits || appointments.length}
            subtext="Consultation history"
            icon={Calendar}
            color="teal"
          />
          <StatCard
            label="Active Prescriptions"
            value={metrics.activePrescriptions || prescriptions.length}
            subtext="Medical prescriptions on file"
            icon={FileCheck}
            color="indigo"
          />
          <StatCard
            label="Pending Invoices"
            value={metrics.pendingBillsCount || 0}
            subtext={`₹${metrics.pendingBalance || 0} outstanding balance`}
            icon={Receipt}
            color={metrics.pendingBillsCount > 0 ? 'rose' : 'emerald'}
          />
          <StatCard
            label="Medical Scans & Docs"
            value="Secure Cloud"
            subtext="Cloudinary Encrypted"
            icon={HeartPulse}
            color="blue"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1.25rem' }}>
          {/* Upcoming appointments */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Recent Appointments</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
                Book New
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="table-empty">
                        No appointments found. Click Book New to schedule a consultation.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.doctor?.user?.name || 'Specialist'}</strong>
                          <div className="text-muted-sm">{app.department}</div>
                        </td>
                        <td>
                          {new Date(app.appointmentDate).toLocaleDateString()}
                          <div className="text-muted-sm">{app.timeSlot}</div>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Prescriptions */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">My Prescriptions</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('prescriptions')}>
                View Details
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Prescription #</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="table-empty">
                        No digital prescriptions recorded.
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((rx) => (
                      <tr key={rx._id}>
                        <td>
                          <strong>{rx.prescriptionId}</strong>
                        </td>
                        <td>{rx.doctor?.user?.name || 'Attending Doctor'}</td>
                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rx.diagnosis}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN / RECEPTIONIST EXECUTIVE DASHBOARD VIEW
  const metrics = data?.metrics || {};
  const recentAppointments = data?.recentAppointments || [];

  return (
    <div>
      {/* Welcome banner with reception photo */}
      <div className="hospital-hero-card">
        <img
          className="hospital-hero-bg"
          src="/images/procedure-room.webp"
          alt="Clean, well-lit hospital procedure room"
          loading="lazy"
        />
        <div className="hospital-hero-overlay" />
        <div className="hospital-hero-content">
          <div className="hospital-hero-text">
            <span className="eyebrow">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</span>
            <h2>CarePulse Medical Institute</h2>
            <p>
              OPD consultations, inpatient wards, diagnostics and billing — all in one place.
            </p>
            <div className="hospital-hero-chips">
              <span className="hero-chip">
                <span className="hero-chip-dot" />
                ER & Trauma open 24/7
              </span>
              <span className="hero-chip">
                <Stethoscope size={13} /> {metrics.totalDoctors || 0} specialists on duty
              </span>
              <span className="hero-chip">
                <BedDouble size={13} /> {metrics.occupiedBeds || 0} / {metrics.totalBeds || 0} beds occupied
              </span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('appointments')}>
            <Calendar size={16} /> Schedule OPD Visit
          </button>
        </div>
      </div>

      <div className="page-header">
        <div className="page-header-title">
          <h1>Operations Dashboard</h1>
          <p>Live OPD queue, inpatient occupancy and financial metrics.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-danger-soft" onClick={() => setIsAmbulanceModalOpen(true)}>
            <Siren size={16} /> Ambulance Radar
          </button>
          <button className="btn btn-secondary" onClick={() => setIsInventoryModalOpen(true)}>
            <Package size={16} /> Drug Inventory
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('patients')}>
            <Users size={16} /> Register Patient
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('appointments')}>
            <Calendar size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Light live-status strip */}
      <div className="status-strip">
        <div className="status-strip-item">
          <div className="status-strip-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
            <HeartPulse size={17} />
          </div>
          <div>
            <div className="status-strip-label">Central ICU telemetry</div>
            <div className="status-strip-value">72 bpm · SpO₂ 99%</div>
          </div>
        </div>
        <div className="status-strip-item">
          <div className="status-strip-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <BedDouble size={17} />
          </div>
          <div>
            <div className="status-strip-label">Bed occupancy</div>
            <div className="status-strip-value">{metrics.occupancyRate || 0}%</div>
          </div>
        </div>
        <div className="status-strip-item">
          <div className="status-strip-icon" style={{ background: 'var(--info-50)', color: 'var(--info-600)' }}>
            <Clock size={17} />
          </div>
          <div>
            <div className="status-strip-label">Recent appointments</div>
            <div className="status-strip-value">{recentAppointments.length}</div>
          </div>
        </div>
        <div className="status-strip-item">
          <div className="status-strip-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
            <Receipt size={17} />
          </div>
          <div>
            <div className="status-strip-label">Pending collections</div>
            <div className="status-strip-value">₹{(metrics.pendingRevenue || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Registered Patients"
          value={metrics.totalPatients || 0}
          subtext="OPD & IPD Combined"
          icon={Users}
          color="teal"
        />
        <StatCard
          label="Active Doctors"
          value={metrics.totalDoctors || 0}
          subtext="Across 6 departments"
          icon={Stethoscope}
          color="indigo"
        />
        <StatCard
          label="Inpatient Bed Occupancy"
          value={`${metrics.occupancyRate || 0}%`}
          subtext={`${metrics.occupiedBeds || 0} of ${metrics.totalBeds || 0} Beds Occupied`}
          icon={BedDouble}
          color="rose"
        />
        <StatCard
          label="Total Hospital Revenue"
          value={`₹${(metrics.totalRevenue || 0).toLocaleString()}`}
          subtext={`₹${(metrics.pendingRevenue || 0).toLocaleString()} pending collections`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Appointments</h2>
            <p className="card-subtitle">Latest bookings across all departments</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
            View all
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
                <th>Doctor / Specialty</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No recent appointments found.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.appointmentNumber}</strong>
                    </td>
                    <td>
                      <strong>{app.patient?.name || 'Walk-in'}</strong>
                      <div className="text-muted-sm">{app.patient?.patientId}</div>
                    </td>
                    <td>
                      <strong>{app.doctor?.user?.name || 'Specialist'}</strong>
                      <div className="text-muted-sm">{app.department}</div>
                    </td>
                    <td>
                      {new Date(app.appointmentDate).toLocaleDateString()}
                      <div className="text-muted-sm">{app.timeSlot}</div>
                    </td>
                    <td>{app.type}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Ambulance Fleet & GPS Dispatch Radar Modal */}
      <AmbulanceTrackerModal
        isOpen={isAmbulanceModalOpen}
        onClose={() => setIsAmbulanceModalOpen(false)}
      />

      {/* Central Pharmacy Inventory Modal */}
      <PharmacyInventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />
    </div>
  );
};
