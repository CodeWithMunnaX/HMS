import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  dashboardService,
  appointmentService,
  prescriptionService,
  billingService,
  uploadService,
  doctorService,
} from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { SymptomTriageModal } from '../../components/triage/SymptomTriageModal';
import { TelehealthRoomModal } from '../../components/telehealth/TelehealthRoomModal';
import { PathologyReportGeneratorModal } from '../../components/lab/PathologyReportGeneratorModal';
import {
  Video,
  Microscope,
  Stethoscope,
  HeartPulse,
  Calendar,
  FileCheck,
  Receipt,
  FolderLock,
  User,
  Plus,
  Printer,
  CreditCard,
  Eye,
  AlertTriangle,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Shield,
  Phone,
} from 'lucide-react';

export const PatientPortal = ({ subTab = 'overview', setSubTab }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentTab, setCurrentTab] = useState(subTab || 'overview');
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [scans, setScans] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    department: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '',
    type: 'General Checkup',
    reasonForVisit: '',
    symptoms: '',
  });

  // Print & Feature modals
  const [selectedRx, setSelectedRx] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewScan, setViewScan] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [telehealthDoc, setTelehealthDoc] = useState(null);
  const [isPathologyOpen, setIsPathologyOpen] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [dashRes, apptRes, rxRes, invRes, scanRes, docRes] = await Promise.all([
        dashboardService.getStats(),
        appointmentService.getAll(),
        prescriptionService.getAll(),
        billingService.getInvoices(),
        uploadService.getFiles(),
        doctorService.getAll(),
      ]);

      if (dashRes.success) setData(dashRes.data);
      if (apptRes.success) setAppointments(apptRes.data);
      if (rxRes.success) setPrescriptions(rxRes.data);
      if (invRes.success) setInvoices(invRes.data);
      if (scanRes.success) setScans(scanRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      console.error('Failed to load patient portal data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorPick = async (doc) => {
    setSelectedDoctor(doc);
    setBookingForm((prev) => ({
      ...prev,
      doctorId: doc._id,
      department: doc.department,
    }));
    loadSlots(doc._id, bookingForm.appointmentDate);
  };

  const loadSlots = async (docId, date) => {
    try {
      setLoadingSlots(true);
      const res = await appointmentService.getSlots(docId, date);
      if (res.success) {
        setAvailableSlots(res.data);
        const firstAvail = res.data.find((s) => s.isAvailable);
        if (firstAvail) {
          setBookingForm((prev) => ({ ...prev, timeSlot: firstAvail.slot }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.timeSlot || !bookingForm.reasonForVisit) {
      return toast.warning('Please complete all booking fields');
    }

    try {
      setSubmittingBooking(true);
      const payload = {
        ...bookingForm,
        symptoms: bookingForm.symptoms
          ? bookingForm.symptoms.split(',').map((s) => s.trim())
          : [],
      };

      const res = await appointmentService.book(payload);
      if (res.success) {
        toast.success(res.message || 'Consultation appointment confirmed!');
        setIsBookingOpen(false);
        setBookingForm({
          doctorId: '',
          department: '',
          appointmentDate: new Date().toISOString().split('T')[0],
          timeSlot: '',
          type: 'General Checkup',
          reasonForVisit: '',
          symptoms: '',
        });
        fetchPatientData();
      }
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const patientProfile = data?.patient || user?.patientProfile || {};
  const metrics = data?.metrics || {};

  return (
    <div>
      {/* Patient Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e7490 0%, #0369a1 50%, #0c4a6e 100%)',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(14, 116, 144, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt="Patient Avatar"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              objectFit: 'cover',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Patient Portal
              </span>
              <span style={{ opacity: 0.9, fontSize: '0.8125rem' }}>
                ID: <strong>{patientProfile.patientId || 'PAT-1001'}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: '0.25rem 0', color: '#ffffff' }}>
              Welcome, {user?.name}
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
              Blood Group: <strong style={{ color: '#fca5a5' }}>{patientProfile.bloodGroup || 'O+'}</strong> • Status: {patientProfile.admissionStatus || 'Outpatient'} • Insurance: {patientProfile.insuranceProvider || 'Self Pay'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              fontWeight: '700',
            }}
            onClick={() => setIsTriageOpen(true)}
          >
            <Stethoscope size={16} /> Smart Symptom Triage
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#0e7490', fontWeight: '700' }}
            onClick={() => setIsBookingOpen(true)}
          >
            <Calendar size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Patient Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '🏥 Health Overview', icon: HeartPulse },
          { id: 'appointments', label: '📅 My Appointments', icon: Calendar },
          { id: 'prescriptions', label: '💊 Prescriptions (EMR)', icon: FileCheck },
          { id: 'reports', label: '🔬 Lab Reports & Scans', icon: FolderLock },
          { id: 'billing', label: '💳 Invoices & Payments', icon: Receipt },
          { id: 'profile', label: '👤 Medical Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HEALTH OVERVIEW */}
      {currentTab === 'overview' && (
        <div>
          <div className="stats-grid">
            <StatCard
              label="Consultation Visits"
              value={appointments.length}
              subtext="Total hospital visits"
              icon={Calendar}
              color="teal"
            />
            <StatCard
              label="Active Prescriptions"
              value={prescriptions.length}
              subtext="Digital medications on file"
              icon={FileCheck}
              color="indigo"
            />
            <StatCard
              label="Outstanding Bills"
              value={`$${metrics.pendingBalance || 0}`}
              subtext={`${invoices.filter((i) => i.paymentStatus !== 'Paid').length} unpaid invoices`}
              icon={Receipt}
              color={metrics.pendingBalance > 0 ? 'rose' : 'emerald'}
            />
            <StatCard
              label="Diagnostic Scans"
              value={scans.length}
              subtext="X-Rays & lab files"
              icon={FolderLock}
              color="blue"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Upcoming Appointments */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">My Upcoming Visits</h2>
                  <p className="card-subtitle">Scheduled doctor consultations</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsBookingOpen(true)}>
                  Book New
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date / Slot</th>
                      <th>Token</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No upcoming appointments. Click Book New to schedule a consultation.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.doctor?.user?.name || 'Doctor'}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#0891b2' }}>{app.department}</div>
                          </td>
                          <td>
                            <div>{new Date(app.appointmentDate).toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.timeSlot}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#0e7490' }}>#{app.tokenNumber}</strong>
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
                <div>
                  <h2 className="card-title">My Prescriptions</h2>
                  <p className="card-subtitle">Digital dosage & doctor advice</p>
                </div>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>RX ID</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No prescriptions on record.
                        </td>
                      </tr>
                    ) : (
                      prescriptions.map((rx) => (
                        <tr key={rx._id}>
                          <td>
                            <strong style={{ color: '#0e7490' }}>{rx.prescriptionId}</strong>
                          </td>
                          <td>{rx.doctor?.user?.name}</td>
                          <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rx.diagnosis}
                          </td>
                          <td>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSelectedRx(rx)}
                            >
                              <Printer size={13} /> View RX
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
        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS */}
      {currentTab === 'appointments' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Appointment History & Upcoming Visits</h2>
              <p className="card-subtitle">Track queue tokens and consultation history</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)}>
              <Plus size={16} /> Book New Visit
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Specialist Doctor</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Token</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app._id}>
                    <td><strong>{app.appointmentNumber}</strong></td>
                    <td>
                      <strong>{app.doctor?.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#0891b2' }}>{app.department}</div>
                    </td>
                    <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
                    <td>{app.timeSlot}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: '#ecfeff',
                          color: '#0e7490',
                          fontWeight: '800',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                        }}
                      >
                        #{app.tokenNumber}
                      </span>
                    </td>
                    <td>{app.reasonForVisit}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#0d9488', borderColor: '#0f766e', fontSize: '0.75rem' }}
                        onClick={() => {
                          setTelehealthDoc(app.doctor?.user);
                          setIsTelehealthOpen(true);
                        }}
                        title="Join Virtual Video Consultation"
                      >
                        <Video size={13} /> Join Video
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRESCRIPTIONS */}
      {currentTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Official Digital Prescriptions</h2>
              <p className="card-subtitle">Review medications, dosages, dietary plans, and follow-up schedules</p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>RX Number</th>
                  <th>Attending Physician</th>
                  <th>Diagnosis</th>
                  <th>Medications Prescribed</th>
                  <th>Date Issued</th>
                  <th>Official Document</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx) => (
                  <tr key={rx._id}>
                    <td><strong style={{ color: '#0e7490' }}>{rx.prescriptionId}</strong></td>
                    <td>{rx.doctor?.user?.name}</td>
                    <td><strong>{rx.diagnosis}</strong></td>
                    <td>
                      {rx.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                    </td>
                    <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRx(rx)}>
                        <Printer size={13} /> View / Print RX
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LAB REPORTS & SCANS */}
      {currentTab === 'reports' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 className="card-title">My Diagnostic Scans & Laboratory Reports</h2>
              <p className="card-subtitle">Encrypted cloud imaging vault and pathology biomarker panels</p>
            </div>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#4338ca', borderColor: '#3730a3' }}
              onClick={() => setIsPathologyOpen(true)}
            >
              <Microscope size={16} /> 🔬 View / Generate Smart Lab Report
            </button>
          </div>

          <div className="files-grid">
            {scans.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No diagnostic scans uploaded yet.
              </div>
            ) : (
              scans.map((file) => (
                <div key={file._id} className="file-card">
                  <div className="file-card-preview" onClick={() => setViewScan(file)} style={{ cursor: 'pointer' }}>
                    <img src={file.fileUrl} alt={file.title} />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {file.category}
                    </div>
                  </div>

                  <div className="file-card-details">
                    <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>{file.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Date: {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                    {file.notes && <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{file.notes}</p>}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      style={{ marginTop: '0.75rem' }}
                      onClick={() => setViewScan(file)}
                    >
                      <Eye size={13} /> View Full Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BILLING & INVOICES */}
      {currentTab === 'billing' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Invoices & Payment Ledger</h2>
              <p className="card-subtitle">Itemized hospital charges and official tax receipts</p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Issue Date</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td><strong style={{ color: '#0e7490' }}>{inv.invoiceNumber}</strong></td>
                    <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                    <td><strong>₹{inv.totalAmount}</strong></td>
                    <td style={{ color: '#059669', fontWeight: '700' }}>₹{inv.paidAmount}</td>
                    <td style={{ color: inv.balanceAmount > 0 ? '#dc2626' : '#059669', fontWeight: '800' }}>
                      ₹{inv.balanceAmount}
                    </td>
                    <td>
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedInvoice(inv)}>
                        <Printer size={13} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: MEDICAL PROFILE */}
      {currentTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a' }}>
              Personal Demographics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div><strong>Full Name:</strong> {user?.name}</div>
              <div><strong>Patient ID:</strong> {patientProfile.patientId || 'PAT-1001'}</div>
              <div><strong>Age / Gender:</strong> {patientProfile.age || 34}y ({patientProfile.gender || 'Male'})</div>
              <div><strong>Blood Group:</strong> <span style={{ color: '#dc2626', fontWeight: '800' }}>{patientProfile.bloodGroup || 'O+'}</span></div>
              <div><strong>Contact Phone:</strong> {patientProfile.phone || user?.phone}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Address:</strong> {patientProfile.address || '42 Pine Valley Rd, Seattle, WA'}</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0e7490' }}>
              Emergency & Insurance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div>
                <strong>Emergency Contact:</strong> {patientProfile.emergencyContact?.name || 'Claire Johnson'} ({patientProfile.emergencyContact?.relation || 'Spouse'})
              </div>
              <div><strong>Emergency Phone:</strong> {patientProfile.emergencyContact?.phone || '+1 (555) 301-8822'}</div>
              <div><strong>Insurance Carrier:</strong> {patientProfile.insuranceProvider || 'BlueCross Health Guard'}</div>
              <div><strong>Policy Number:</strong> {patientProfile.policyNumber || 'BC-992182-01'}</div>
              <div>
                <strong>Reported Allergies:</strong>{' '}
                <span style={{ color: '#b45309', fontWeight: '700' }}>
                  {patientProfile.allergies?.join(', ') || 'Penicillin, Peanuts'}
                </span>
              </div>
              <div>
                <strong>Chronic Conditions:</strong>{' '}
                {patientProfile.chronicConditions?.join(', ') || 'Mild Asthma'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Specialist Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title="Book Specialist Doctor Consultation"
        maxWidth="760px"
      >
        <form onSubmit={handleBookingSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
              Step 1: Choose Specialist Doctor *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
              {doctors.map((doc) => {
                const isSelected = bookingForm.doctorId === doc._id;
                return (
                  <div
                    key={doc._id}
                    onClick={() => handleDoctorPick(doc)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #0891b2' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#ecfeff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{doc.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0891b2' }}>{doc.specialty}</div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: '700' }}>₹{doc.consultationFee} Fee</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                Step 2: Consultation Date *
              </label>
              <input
                type="date"
                className="form-input"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingForm.appointmentDate}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, appointmentDate: e.target.value });
                  if (bookingForm.doctorId) loadSlots(bookingForm.doctorId, e.target.value);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                Consultation Category
              </label>
              <select
                className="form-select"
                value={bookingForm.type}
                onChange={(e) => setBookingForm({ ...bookingForm, type: e.target.value })}
              >
                <option value="General Checkup">General Checkup</option>
                <option value="Specialist Consultation">Specialist Consultation</option>
                <option value="Follow-up">Follow-up Review</option>
                <option value="Emergency">Emergency Triage</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
              Step 3: Available Time Slot *
            </label>
            {loadingSlots ? (
              <p style={{ fontSize: '0.8125rem', color: '#0891b2' }}>Checking doctor availability...</p>
            ) : !bookingForm.doctorId ? (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                👉 Please choose a doctor above to view available time slots.
              </div>
            ) : availableSlots.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626' }}>No slots available on this date. Please pick another consultation date.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {availableSlots.map((s) => {
                  const isSelected = bookingForm.timeSlot === s.slot;
                  return (
                    <button
                      key={s.slot}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setBookingForm({ ...bookingForm, timeSlot: s.slot })}
                      style={{
                        padding: '0.55rem 0.6rem',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        border: isSelected ? '2px solid #0891b2' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#ecfeff' : s.isAvailable ? '#ffffff' : '#f1f5f9',
                        color: isSelected ? '#0e7490' : s.isAvailable ? '#0f172a' : '#94a3b8',
                        cursor: s.isAvailable ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span>{s.slot}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: '600' }}>
                        {s.isAvailable ? (isSelected ? '✓ Selected' : 'Available') : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Symptoms Preset Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              ⚡ 1-Click Quick Symptoms:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Headache & Migraine', 'Fever & Chills', 'Chest Discomfort', 'Knee & Joint Pain', 'Persistent Cough', 'Routine Checkup'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    const existing = bookingForm.reasonForVisit ? bookingForm.reasonForVisit + ', ' : '';
                    setBookingForm((prev) => ({
                      ...prev,
                      reasonForVisit: existing + chip,
                    }));
                  }}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '999px',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.725rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
              Reason for Consultation *
            </label>
            <textarea
              className="form-textarea"
              rows="2"
              required
              placeholder="Describe your health symptoms, pain level, or medical questions..."
              value={bookingForm.reasonForVisit}
              onChange={(e) => setBookingForm({ ...bookingForm, reasonForVisit: e.target.value })}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingBooking}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {submittingBooking ? 'Confirming Booking...' : '✓ Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RX Modal */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Official Medical Prescription"
        maxWidth="800px"
      >
        {selectedRx && (
          <div>
            <div className="rx-document">
              <div className="rx-header">
                <div>
                  <div className="rx-hospital-title">CarePulse Hospital</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>100 Clinical Way • Tel: +1 (555) 010-9000</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0e7490' }}>{selectedRx.prescriptionId}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(selectedRx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Diagnosis:</strong> <span>{selectedRx.diagnosis}</span>
              </div>

              <div className="rx-symbol">℞</div>

              <table className="rx-medicines-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines?.map((m, i) => (
                    <tr key={i}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                      <td>{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedRx.dietaryAdvice && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Dietary & Lifestyle Advice:</strong> {selectedRx.dietaryAdvice}
                </div>
              )}

              <div className="rx-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent('CAREPULSE-VERIFIED-RX-' + selectedRx.prescriptionId + '-' + (patientProfile?.name || 'Patient'))}`}
                    alt="Scannable RX QR Code"
                    style={{ width: '70px', height: '70px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase' }}>
                      Verified Digital RX
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', maxWidth: '160px', lineHeight: '1.2' }}>
                      Show QR code at hospital pharmacy to dispense medication.
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      border: '2px solid #0891b2',
                      borderRadius: '8px',
                      padding: '0.35rem 0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'rgba(8, 145, 178, 0.05)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: '#0891b2', fontWeight: '800', textTransform: 'uppercase' }}>
                      ✓ Digitally Signed & Sealed
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0f172a' }}>{selectedRx.doctor?.user?.name || 'Attending Physician'}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Authorized Medical Practitioner • CarePulse</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRx(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Official RX
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Official Hospital Billing Receipt"
        maxWidth="800px"
      >
        {selectedInvoice && (
          <div>
            <div className="invoice-sheet">
              <div className="rx-header">
                <div>
                  <div className="rx-hospital-title">CarePulse Hospital</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Tax Invoice Receipt</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0e7490', fontSize: '1.2rem' }}>{selectedInvoice.invoiceNumber}</div>
                  <StatusBadge status={selectedInvoice.paymentStatus} />
                </div>
              </div>

              <table className="custom-table" style={{ marginBottom: '1.5rem' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.description}</strong></td>
                      <td>{item.category}</td>
                      <td>₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-box">
                <div className="invoice-summary-row">
                  <span>Grand Total:</span>
                  <strong>₹{selectedInvoice.totalAmount}</strong>
                </div>
                <div className="invoice-summary-row" style={{ color: '#059669' }}>
                  <span>Paid:</span>
                  <strong>₹{selectedInvoice.paidAmount}</strong>
                </div>
                <div className="invoice-summary-row" style={{ color: selectedInvoice.balanceAmount > 0 ? '#dc2626' : '#059669' }}>
                  <span>Balance Due:</span>
                  <strong>₹{selectedInvoice.balanceAmount}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Scan Modal */}
      <Modal
        isOpen={!!viewScan}
        onClose={() => setViewScan(null)}
        title={viewScan?.title || 'Diagnostic Imaging Viewer'}
        maxWidth="750px"
      >
        {viewScan && (
          <div>
            <div style={{ textAlign: 'center', background: '#0f172a', padding: '1rem', borderRadius: '12px' }}>
              <img src={viewScan.fileUrl} alt={viewScan.title} style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Category:</strong> {viewScan.category}
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{viewScan.notes}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Smart Symptom Checker & Specialty Triage Modal */}
      <SymptomTriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onBookDepartment={(dept) => {
          setBookingForm((prev) => ({ ...prev, department: dept }));
          setIsBookingOpen(true);
        }}
      />

      {/* Telehealth Video Consultation Studio Modal */}
      <TelehealthRoomModal
        isOpen={isTelehealthOpen}
        onClose={() => {
          setIsTelehealthOpen(false);
          setTelehealthDoc(null);
        }}
        patient={user}
        doctor={telehealthDoc}
      />

      {/* Smart Pathology Lab Report Generator Modal */}
      <PathologyReportGeneratorModal
        isOpen={isPathologyOpen}
        onClose={() => setIsPathologyOpen(false)}
        defaultPatient={user}
      />
    </div>
  );
};
