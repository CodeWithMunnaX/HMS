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

  // The active page comes from the URL (/app/<tab>) via the sidebar
  const currentTab = subTab || 'overview';
  const setCurrentTab = (tab) => setSubTab?.(tab);
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
      <section className="portal-hero">
        <img className="portal-hero-photo" src="/images/private-room.webp" alt="" aria-hidden="true" />
        <div className="portal-hero-main">
          <img
            className="portal-hero-avatar"
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt="Patient avatar"
          />
          <div>
            <div className="portal-hero-meta">
              <span className="portal-status-pill">Patient</span>
              <span>
                ID <strong>{patientProfile.patientId || 'PAT-1001'}</strong>
              </span>
            </div>
            <h1 className="portal-hero-title">Welcome, {user?.name}</h1>
            <p className="portal-hero-sub">
              Blood group <strong style={{ color: 'var(--danger-600)' }}>{patientProfile.bloodGroup || 'O+'}</strong> •{' '}
              {patientProfile.admissionStatus || 'Outpatient'} • {patientProfile.insuranceProvider || 'Self Pay'}
            </p>
          </div>
        </div>

        <div className="portal-hero-actions">
          <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)}>
            <Calendar size={16} /> Book Appointment
          </button>
          <button className="btn btn-secondary" onClick={() => setIsTriageOpen(true)}>
            <Stethoscope size={16} /> Symptom Checker
          </button>
        </div>
      </section>

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
              value={`₹${metrics.pendingBalance || 0}`}
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

          <div className="portal-two-col">
            {/* Upcoming Appointments */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">My Upcoming Visits</h2>
                  <p className="card-subtitle">Scheduled doctor consultations</p>
                </div>
                <div className="portal-row-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('appointments')}>
                    View all
                  </button>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setIsBookingOpen(true)}>
                    <Plus size={14} /> Book
                  </button>
                </div>
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
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No upcoming appointments. Click Book New to schedule a consultation.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.doctor?.user?.name || 'Doctor'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>{app.department}</div>
                          </td>
                          <td>
                            <div>{new Date(app.appointmentDate).toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.timeSlot}</div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--primary-700)' }}>#{app.tokenNumber}</strong>
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
                <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('prescriptions')}>
                  View all
                </button>
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
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                          No prescriptions on record.
                        </td>
                      </tr>
                    ) : (
                      prescriptions.map((rx) => (
                        <tr key={rx._id}>
                          <td>
                            <strong style={{ color: 'var(--primary-700)' }}>{rx.prescriptionId}</strong>
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
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="8" className="portal-empty-cell">
                      No appointments yet. Book a visit to get started.
                    </td>
                  </tr>
                )}
                {appointments.map((app) => (
                  <tr key={app._id}>
                    <td><strong>{app.appointmentNumber}</strong></td>
                    <td>
                      <strong>{app.doctor?.user?.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>{app.department}</div>
                    </td>
                    <td>{new Date(app.appointmentDate).toLocaleDateString()}</td>
                    <td>{app.timeSlot}</td>
                    <td>
                      <span className="portal-token">#{app.tokenNumber}</span>
                    </td>
                    <td>{app.reasonForVisit}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
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
                {prescriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="portal-empty-cell">
                      No prescriptions on record.
                    </td>
                  </tr>
                )}
                {prescriptions.map((rx) => (
                  <tr key={rx._id}>
                    <td><strong style={{ color: 'var(--primary-700)' }}>{rx.prescriptionId}</strong></td>
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
          <div className="card portal-section-head">
            <div>
              <h2 className="card-title">My Diagnostic Scans & Laboratory Reports</h2>
              <p className="card-subtitle">Encrypted cloud imaging vault and pathology biomarker panels</p>
            </div>
            <button className="btn btn-primary" onClick={() => setIsPathologyOpen(true)}>
              <Microscope size={16} /> View Lab Report
            </button>
          </div>

          {scans.length === 0 && (
            <div className="card portal-empty-card">No diagnostic scans uploaded yet.</div>
          )}

          <div className="files-grid">
            {scans.length === 0 ? null : (
              scans.map((file) => (
                <div key={file._id} className="file-card">
                  <div className="file-card-preview" onClick={() => setViewScan(file)} style={{ cursor: 'pointer' }}>
                    <img src={file.fileUrl} alt={file.title} />
                    <span className="portal-file-tag">{file.category}</span>
                  </div>

                  <div className="file-card-details">
                    <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--slate-900)' }}>{file.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Date: {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                    {file.notes && <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>{file.notes}</p>}
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
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="portal-empty-cell">
                      No invoices yet.
                    </td>
                  </tr>
                )}
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td><strong style={{ color: 'var(--primary-700)' }}>{inv.invoiceNumber}</strong></td>
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
        <div className="portal-two-col">
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Personal Details</h2>
                <p className="card-subtitle">Your demographic and contact information</p>
              </div>
              <User size={18} color="var(--primary-600)" />
            </div>
            <dl className="portal-info-list">
              <div><dt>Full name</dt><dd>{user?.name}</dd></div>
              <div><dt>Patient ID</dt><dd>{patientProfile.patientId || 'PAT-1001'}</dd></div>
              <div><dt>Age / Gender</dt><dd>{patientProfile.age || 34}y ({patientProfile.gender || 'Male'})</dd></div>
              <div><dt>Blood group</dt><dd><span className="portal-tag portal-tag-red">{patientProfile.bloodGroup || 'O+'}</span></dd></div>
              <div><dt>Phone</dt><dd>{patientProfile.phone || user?.phone}</dd></div>
              <div><dt>Email</dt><dd>{user?.email}</dd></div>
              <div><dt>Address</dt><dd>{patientProfile.address || '42 Pine Valley Rd, Seattle, WA'}</dd></div>
            </dl>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Emergency & Insurance</h2>
                <p className="card-subtitle">Contacts, coverage and medical alerts</p>
              </div>
              <Shield size={18} color="var(--primary-600)" />
            </div>
            <dl className="portal-info-list">
              <div>
                <dt>Emergency contact</dt>
                <dd>{patientProfile.emergencyContact?.name || 'Claire Johnson'} ({patientProfile.emergencyContact?.relation || 'Spouse'})</dd>
              </div>
              <div><dt>Emergency phone</dt><dd>{patientProfile.emergencyContact?.phone || '+1 (555) 301-8822'}</dd></div>
              <div><dt>Insurance carrier</dt><dd>{patientProfile.insuranceProvider || 'BlueCross Health Guard'}</dd></div>
              <div><dt>Policy number</dt><dd>{patientProfile.policyNumber || 'BC-992182-01'}</dd></div>
              <div>
                <dt>Allergies</dt>
                <dd>
                  <span className="portal-tag portal-tag-amber">
                    <AlertTriangle size={12} /> {patientProfile.allergies?.join(', ') || 'Penicillin, Peanuts'}
                  </span>
                </dd>
              </div>
              <div><dt>Chronic conditions</dt><dd>{patientProfile.chronicConditions?.join(', ') || 'Mild Asthma'}</dd></div>
            </dl>
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
            <div className="portal-doctor-picker">
              {doctors.map((doc) => {
                const isSelected = bookingForm.doctorId === doc._id;
                return (
                  <button
                    type="button"
                    key={doc._id}
                    onClick={() => handleDoctorPick(doc)}
                    className={`clinical-option${isSelected ? ' is-selected' : ''}`}
                    style={{ alignItems: 'center' }}
                  >
                    <img
                      src={doc.user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100'}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--slate-900)' }}>{doc.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)' }}>{doc.specialty}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success-700)', fontWeight: '700' }}>₹{doc.consultationFee} fee</div>
                    </div>
                  </button>
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
              <p style={{ fontSize: '0.8125rem', color: 'var(--primary-600)' }}>Checking doctor availability...</p>
            ) : !bookingForm.doctorId ? (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--slate-600)',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                Choose a doctor above to see available time slots.
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
                        color: isSelected ? 'var(--primary-700)' : s.isAvailable ? 'var(--slate-900)' : 'var(--slate-500)',
                        cursor: s.isAvailable ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span>{s.slot}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: '600' }}>
                        {s.isAvailable ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Symptoms Preset Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="clinical-section-label">Quick add symptoms</div>
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
                  className="portal-chip"
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
              flexWrap: 'wrap',
              gap: '0.75rem',
              borderTop: '1px solid var(--slate-200)',
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
              {submittingBooking ? 'Confirming booking...' : 'Confirm Appointment'}
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
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>100 Clinical Way • Tel: +1 (555) 010-9000</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-700)' }}>{selectedRx.prescriptionId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{new Date(selectedRx.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Diagnosis:</strong> <span>{selectedRx.diagnosis}</span>
              </div>

              <div className="rx-symbol">℞</div>

              <div className="portal-table-scroll">
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
              </div>

              {selectedRx.dietaryAdvice && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  <strong>Dietary & Lifestyle Advice:</strong> {selectedRx.dietaryAdvice}
                </div>
              )}

              <div className="rx-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent('CAREPULSE-VERIFIED-RX-' + selectedRx.prescriptionId + '-' + (patientProfile?.name || 'Patient'))}`}
                    alt="Scannable RX QR Code"
                    style={{ width: '70px', height: '70px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                      Verified Digital RX
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', maxWidth: '160px', lineHeight: '1.2' }}>
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
                    <div style={{ fontSize: '0.65rem', color: 'var(--primary-600)', fontWeight: '800', textTransform: 'uppercase' }}>
                      ✓ Digitally Signed & Sealed
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '0.875rem', color: 'var(--slate-900)' }}>{selectedRx.doctor?.user?.name || 'Attending Physician'}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Authorized Medical Practitioner • CarePulse</div>
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
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Tax Invoice Receipt</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-700)', fontSize: '1.2rem' }}>{selectedInvoice.invoiceNumber}</div>
                  <StatusBadge status={selectedInvoice.paymentStatus} />
                </div>
              </div>

              <div className="portal-table-scroll" style={{ marginBottom: '1.5rem' }}>
              <table className="custom-table">
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
              </div>

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
            <div className="portal-scan-viewer">
              <img src={viewScan.fileUrl} alt={viewScan.title} style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ color: 'var(--slate-900)' }}>
                <strong>Category:</strong> {viewScan.category}
              </div>
              {viewScan.notes && (
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>{viewScan.notes}</p>
              )}
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
