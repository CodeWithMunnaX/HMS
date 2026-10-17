import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dashboardService, appointmentService, prescriptionService, patientService, uploadService } from '../../services/api';
import { StatusBadge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { AiScanAnalyzerModal } from '../../components/scans/AiScanAnalyzerModal';
import { EcgWaveform } from '../../components/common/EcgWaveform';
import { TelehealthRoomModal } from '../../components/telehealth/TelehealthRoomModal';
import { PathologyReportGeneratorModal } from '../../components/lab/PathologyReportGeneratorModal';
import {
  Video,
  Microscope,
  Stethoscope,
  Clock,
  CheckCircle2,
  FileCheck,
  Calendar,
  User,
  Plus,
  Printer,
  Activity,
  AlertTriangle,
  FolderLock,
  Search,
  Eye,
  Trash2,
  Phone,
  Heart,
  Sparkles,
} from 'lucide-react';

export const DoctorPortal = ({ subTab = 'overview', setSubTab }) => {
  const { user } = useAuth();
  const toast = useToast();

  // The active page comes from the URL (/app/<tab>) via the sidebar
  const currentTab = subTab || 'overview';
  const setCurrentTab = (tab) => setSubTab?.(tab);
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Builder Modal
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isAiAnalyzerOpen, setIsAiAnalyzerOpen] = useState(false);
  const [aiScanSelected, setAiScanSelected] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);
  const [selectedRxForPrint, setSelectedRxForPrint] = useState(null);
  const [viewScanFile, setViewScanFile] = useState(null);
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [telehealthPatient, setTelehealthPatient] = useState(null);
  const [isPathologyOpen, setIsPathologyOpen] = useState(false);
  const [pathologyPatient, setPathologyPatient] = useState(null);

  const [rxForm, setRxForm] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    symptomsObserved: '',
    vitals: {
      bloodPressure: '120/80 mmHg',
      heartRate: '75 bpm',
      temperature: '98.6 °F',
      spO2: '99%',
      weight: '70 kg',
    },
    medicines: [
      { name: '', dosage: '500mg', frequency: '1-0-1 (After Food)', duration: '5 Days', instructions: 'Take with plenty of water' },
    ],
    labTestsRecommended: '',
    dietaryAdvice: 'Maintain light balanced meals, avoid excessive caffeine and sodium.',
    doctorNotes: '',
    followUpDate: '',
  });

  useEffect(() => {
    fetchDoctorData();
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [dashRes, apptRes, rxRes, patRes, scanRes] = await Promise.all([
        dashboardService.getStats(),
        appointmentService.getAll(),
        prescriptionService.getAll(),
        patientService.getAll(),
        uploadService.getFiles(),
      ]);

      if (dashRes.success) setData(dashRes.data);
      if (apptRes.success) setAppointments(apptRes.data);
      if (rxRes.success) setPrescriptions(rxRes.data);
      if (patRes.success) setPatients(patRes.data);
      if (scanRes.success) setScans(scanRes.data);
    } catch (err) {
      console.error('Failed to load doctor data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentService.update(appointmentId, { status: newStatus });
      if (res.success) {
        toast.success(`Patient marked as '${newStatus}'`);
        fetchDoctorData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openPrescribeForPatient = (app) => {
    setSelectedAppointment(app);
    setRxForm({
      patientId: app.patient?._id || '',
      appointmentId: app._id,
      diagnosis: '',
      symptomsObserved: app.symptoms?.join(', ') || '',
      vitals: {
        bloodPressure: '120/80 mmHg',
        heartRate: '75 bpm',
        temperature: '98.6 °F',
        spO2: '99%',
        weight: '70 kg',
      },
      medicines: [
        { name: '', dosage: '500mg', frequency: '1-0-1 (After Food)', duration: '5 Days', instructions: 'Take with plenty of water' },
      ],
      labTestsRecommended: '',
      dietaryAdvice: 'Maintain light balanced meals, avoid excessive caffeine and sodium.',
      doctorNotes: `Consultation note for ${app.patient?.name}`,
      followUpDate: '',
    });
    setIsRxModalOpen(true);
  };

  const addMedicineRow = () => {
    setRxForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: '' },
      ],
    }));
  };

  const removeMedicineRow = (index) => {
    setRxForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...rxForm.medicines];
    updated[index][field] = value;
    setRxForm((prev) => ({ ...prev, medicines: updated }));
  };

  const handleRxSubmit = async (e) => {
    e.preventDefault();
    if (!rxForm.diagnosis) {
      return toast.warning('Please enter a clinical diagnosis');
    }

    try {
      const payload = {
        ...rxForm,
        symptomsObserved: rxForm.symptomsObserved
          ? rxForm.symptomsObserved.split(',').map((s) => s.trim())
          : [],
        labTestsRecommended: rxForm.labTestsRecommended
          ? rxForm.labTestsRecommended.split(',').map((s) => s.trim())
          : [],
      };

      const res = await prescriptionService.create(payload);
      if (res.success) {
        toast.success(`E-Prescription #${res.data.prescriptionId} successfully issued!`);
        setIsRxModalOpen(false);
        fetchDoctorData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to issue prescription');
    }
  };

  const queue = data?.todayQueue || appointments;
  const metrics = data?.metrics || {};

  return (
    <div>
      {/* Doctor Header Banner */}
      <section className="portal-hero">
        <img className="portal-hero-photo" src="/images/care-team.webp" alt="" aria-hidden="true" />
        <div className="portal-hero-main">
          <img
            className="portal-hero-avatar"
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
            alt="Doctor avatar"
          />
          <div>
            <div className="portal-hero-meta">
              <span className="portal-status-pill">
                <span className="portal-live-dot" /> On duty
              </span>
              <span>Room OPD-204</span>
            </div>
            <h1 className="portal-hero-title">{user?.name}</h1>
            <p className="portal-hero-sub">
              {user?.department || 'Cardiology'} Specialist • Consultant Physician & Surgeon
            </p>
          </div>
        </div>

        <div className="portal-hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setRxForm((prev) => ({ ...prev, patientId: '', appointmentId: '' }));
              setIsRxModalOpen(true);
            }}
          >
            <Plus size={16} /> Write E-Prescription
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setTelehealthPatient(null);
              setIsTelehealthOpen(true);
            }}
          >
            <Video size={16} /> Video Consult
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPathologyPatient(null);
              setIsPathologyOpen(true);
            }}
          >
            <Microscope size={16} /> Lab Report
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setAiScanSelected(null);
              setIsAiAnalyzerOpen(true);
            }}
          >
            <Activity size={16} /> Scan Analyzer
          </button>
        </div>
      </section>

      {/* TAB 1: OVERVIEW & TODAY'S QUEUE */}
      {currentTab === 'overview' && (
        <div>
          {/* Real-time ICU & Cardiac Waveform Telemetry */}
          <EcgWaveform patientName="CarePulse OPD & Cardiac Telemetry Monitor" bpm={74} spO2={99} bp="120/80 mmHg" />

          <div className="stats-grid">
            <StatCard
              label="Today's Patient Queue"
              value={queue.length}
              subtext="Patients waiting/scheduled"
              icon={Clock}
              color="teal"
            />
            <StatCard
              label="Consultations Finished"
              value={queue.filter((q) => q.status === 'Completed').length}
              subtext="Prescriptions dispatched"
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              label="Total E-Prescriptions"
              value={prescriptions.length}
              subtext="Digital records issued"
              icon={FileCheck}
              color="indigo"
            />
            <StatCard
              label="Clinical Rating"
              value={`${metrics.rating || 4.9} ★`}
              subtext="Verified patient feedback"
              icon={Activity}
              color="amber"
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Live OPD Patient Queue (Today)</h2>
                <p className="card-subtitle">Call patients, record vitals, and issue digital prescriptions</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={fetchDoctorData}
              >
                Refresh Queue
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Token #</th>
                    <th>Patient Name</th>
                    <th>ID / Age / Blood</th>
                    <th>Time Slot</th>
                    <th>Reason / Symptoms</th>
                    <th>Status</th>
                    <th>Clinical Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                        No patients currently in your queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <span className="portal-token">#{app.tokenNumber}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--slate-900)' }}>{app.patient?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.patient?.phone}</div>
                        </td>
                        <td>
                          <div>{app.patient?.patientId}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {app.patient?.age}y ({app.patient?.gender}) • <strong>{app.patient?.bloodGroup}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{app.timeSlot}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {new Date(app.appointmentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{app.reasonForVisit}</div>
                          {app.symptoms?.length > 0 && (
                            <div className="portal-alert-text">
                              <AlertTriangle size={12} /> {app.symptoms.join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td>
                          <div className="portal-row-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setTelehealthPatient(app.patient);
                                setIsTelehealthOpen(true);
                              }}
                              title="Start Telehealth Video Consultation"
                            >
                              <Video size={13} /> Video
                            </button>

                            {app.status === 'Scheduled' || app.status === 'Confirmed' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleStatusUpdate(app._id, 'In Consultation')}
                              >
                                Call Patient
                              </button>
                            ) : null}

                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => openPrescribeForPatient(app)}
                            >
                              <FileCheck size={14} /> Prescribe
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRESCRIPTIONS STUDIO */}
      {currentTab === 'prescriptions' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">E-Prescription Studio</h2>
              <p className="card-subtitle">Official digital prescriptions issued by you</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setRxForm((prev) => ({ ...prev, patientId: '', appointmentId: '' }));
                setIsRxModalOpen(true);
              }}
            >
              <Plus size={16} /> New Prescription
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>RX Number</th>
                  <th>Patient Name</th>
                  <th>Diagnosis</th>
                  <th>Vitals Recorded</th>
                  <th>Medicines</th>
                  <th>Date Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                      No digital prescriptions issued yet.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr key={rx._id}>
                      <td>
                        <strong style={{ color: 'var(--primary-700)' }}>{rx.prescriptionId}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700' }}>{rx.patient?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{rx.patient?.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{rx.diagnosis}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                          BP: {rx.vitals?.bloodPressure || '-'} • HR: {rx.vitals?.heartRate || '-'}
                        </div>
                      </td>
                      <td>
                        <span className="portal-tag portal-tag-teal">
                          {rx.medicines?.length || 0} drugs
                        </span>
                      </td>
                      <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRxForPrint(rx)}
                        >
                          <Printer size={14} /> View / Print RX
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY PATIENTS */}
      {currentTab === 'patients' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Patient Records & Medical History</h2>
              <p className="card-subtitle">Review medical alerts, allergies, and clinical timelines</p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Allergies & Alerts</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="portal-empty-cell">
                      No patient records found.
                    </td>
                  </tr>
                )}
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong style={{ color: 'var(--primary-700)' }}>{p.patientId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{p.phone}</div>
                    </td>
                    <td>
                      {p.age} yrs ({p.gender})
                    </td>
                    <td>
                      <span className="portal-tag portal-tag-red">{p.bloodGroup}</span>
                    </td>
                    <td>
                      {p.allergies?.length > 0 ? (
                        <span className="portal-tag portal-tag-amber">
                          <AlertTriangle size={12} /> {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-500)', fontSize: '0.8125rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={p.admissionStatus} />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedPatientForHistory(p)}
                      >
                        <Activity size={14} /> Full History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DIAGNOSTIC SCANS & LAB VAULT */}
      {currentTab === 'scans' && (
        <div>
          <div className="card portal-section-head">
            <div>
              <h2 className="card-title">Patient Diagnostic Scans</h2>
              <p className="card-subtitle">
                Radiology imaging, X-rays, MRI scans and pathology reports.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setAiScanSelected(null);
                setIsAiAnalyzerOpen(true);
              }}
            >
              <Activity size={16} /> Clinical Scan Analyzer
            </button>
          </div>

          {scans.length === 0 && (
            <div className="card portal-empty-card">No diagnostic scans uploaded yet.</div>
          )}

          <div className="files-grid">
            {scans.map((file) => (
              <div key={file._id} className="file-card">
                <div
                  className="file-card-preview"
                  onClick={() => setViewScanFile(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={file.fileUrl} alt={file.title} />
                  <span className="portal-file-tag">{file.category}</span>
                </div>

                <div className="file-card-details">
                  <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--slate-900)' }}>
                    {file.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Patient: <strong>{file.patient?.name}</strong> ({file.patient?.patientId})
                  </div>
                  {file.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                      {file.notes}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.75rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewScanFile(file)}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setAiScanSelected(file.fileUrl);
                        setIsAiAnalyzerOpen(true);
                      }}
                    >
                      <Activity size={13} /> Analyze
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Builder Modal */}
      <Modal
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        title="Issue Official E-Prescription"
        maxWidth="820px"
      >
        <form onSubmit={handleRxSubmit}>
          <div className="form-group">
            <label className="form-label">Select Patient *</label>
            <select
              className="form-select"
              required
              value={rxForm.patientId}
              onChange={(e) => setRxForm({ ...rxForm, patientId: e.target.value })}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.patientId}) - Blood: {p.bloodGroup}
                </option>
              ))}
            </select>
          </div>

          {/* Smart Patient Allergy & Clinical Safety Guard */}
          {(() => {
            const selectedPat = patients.find((p) => p._id === rxForm.patientId);
            if (selectedPat && selectedPat.allergies?.length > 0) {
              return (
                <div className="portal-callout portal-callout-warning">
                  <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8125rem', color: '#92400e' }}>
                    <strong>Clinical Allergy Alert:</strong> Patient has documented hypersensitivity to{' '}
                    <span style={{ fontWeight: '800', textDecoration: 'underline' }}>
                      {selectedPat.allergies.join(', ')}
                    </span>
                    . Cross-verify medications to prevent adverse drug reactions.
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="form-group">
            <label className="form-label">Clinical Diagnosis *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Essential Hypertension, Bronchitis"
              value={rxForm.diagnosis}
              onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
            />
          </div>

          {/* Vitals */}
          <div className="portal-form-section">Patient vitals</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Pressure</label>
              <input
                type="text"
                className="form-input"
                value={rxForm.vitals.bloodPressure}
                onChange={(e) =>
                  setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, bloodPressure: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input
                type="text"
                className="form-input"
                value={rxForm.vitals.heartRate}
                onChange={(e) =>
                  setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, heartRate: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature</label>
              <input
                type="text"
                className="form-input"
                value={rxForm.vitals.temperature}
                onChange={(e) =>
                  setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, temperature: e.target.value } })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 Oxygen</label>
              <input
                type="text"
                className="form-input"
                value={rxForm.vitals.spO2}
                onChange={(e) =>
                  setRxForm({ ...rxForm, vitals: { ...rxForm.vitals, spO2: e.target.value } })
                }
              />
            </div>
          </div>

          {/* Medicines Dynamic Table */}
          <div className="portal-form-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Prescribed medications</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedicineRow}>
              <Plus size={14} /> Add Drug
            </button>
          </div>

          {rxForm.medicines.map((med, idx) => (
            <div key={idx} className="portal-med-row">
              <input
                type="text"
                placeholder="Drug Name"
                className="form-input"
                value={med.name}
                onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Dosage"
                className="form-input"
                value={med.dosage}
                onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
              />
              <input
                type="text"
                placeholder="Frequency (1-0-1)"
                className="form-input"
                value={med.frequency}
                onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
              />
              <input
                type="text"
                placeholder="Duration (5d)"
                className="form-input"
                value={med.duration}
                onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
              />
              <input
                type="text"
                placeholder="Instructions"
                className="form-input"
                value={med.instructions}
                onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
              />
              {rxForm.medicines.length > 1 && (
                <button
                  type="button"
                  className="portal-icon-btn portal-icon-btn-danger"
                  onClick={() => removeMedicineRow(idx)}
                  aria-label="Remove medicine"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Dietary & Lifestyle Advice</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={rxForm.dietaryAdvice}
              onChange={(e) => setRxForm({ ...rxForm, dietaryAdvice: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsRxModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue & Sign Prescription
            </button>
          </div>
        </form>
      </Modal>

      {/* RX Print View Modal */}
      <Modal
        isOpen={!!selectedRxForPrint}
        onClose={() => setSelectedRxForPrint(null)}
        title="Official Clinical Prescription"
        maxWidth="800px"
      >
        {selectedRxForPrint && (
          <div>
            <div className="rx-document">
              <div className="rx-header">
                <div>
                  <div className="rx-hospital-title">CarePulse Hospital & Medical Institute</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                    100 Clinical Way, Health District • Tel: +1 (555) 010-9000
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-700)' }}>{selectedRxForPrint.prescriptionId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Date: {new Date(selectedRxForPrint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="rx-patient-bar">
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Patient Name:</span>
                  <div style={{ fontWeight: '700' }}>{selectedRxForPrint.patient?.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Patient ID:</span>
                  <div>{selectedRxForPrint.patient?.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Age / Gender:</span>
                  <div>{selectedRxForPrint.patient?.age}y ({selectedRxForPrint.patient?.gender})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Blood Group:</span>
                  <div style={{ fontWeight: '700', color: '#dc2626' }}>{selectedRxForPrint.patient?.bloodGroup}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Diagnosis:</strong> <span style={{ color: 'var(--slate-900)' }}>{selectedRxForPrint.diagnosis}</span>
              </div>

              <div className="rx-symbol">℞</div>

              <div className="portal-table-scroll">
              <table className="rx-medicines-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRxForPrint.medicines?.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
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

              <div className="rx-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent('CAREPULSE-VERIFIED-RX-' + selectedRxForPrint.prescriptionId + '-' + selectedRxForPrint.patient?.name)}`}
                    alt="Scannable RX QR Code"
                    style={{ width: '70px', height: '70px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary-700)', textTransform: 'uppercase' }}>
                      Verified Digital RX
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)', maxWidth: '160px', lineHeight: '1.2' }}>
                      Scan QR code at hospital pharmacy to dispense medication.
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
                    <div style={{ fontWeight: '800', fontSize: '0.875rem', color: 'var(--slate-900)' }}>{user?.name}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>License ID: MED-8842-CA • CarePulse MD</div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRxForPrint(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Prescription
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Patient History Modal */}
      <Modal
        isOpen={!!selectedPatientForHistory}
        onClose={() => setSelectedPatientForHistory(null)}
        title={`Medical Record — ${selectedPatientForHistory?.name || ''}`}
        maxWidth="680px"
      >
        {selectedPatientForHistory && (
          <div>
            <dl className="portal-info-list" style={{ marginBottom: '1rem' }}>
              <div><dt>Patient ID</dt><dd>{selectedPatientForHistory.patientId}</dd></div>
              <div><dt>Age / Gender</dt><dd>{selectedPatientForHistory.age}y ({selectedPatientForHistory.gender})</dd></div>
              <div><dt>Blood group</dt><dd><span className="portal-tag portal-tag-red">{selectedPatientForHistory.bloodGroup}</span></dd></div>
              <div><dt>Known allergies</dt><dd>{selectedPatientForHistory.allergies?.join(', ') || 'None'}</dd></div>
              <div><dt>Chronic conditions</dt><dd>{selectedPatientForHistory.chronicConditions?.join(', ') || 'None'}</dd></div>
            </dl>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPatientForHistory(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Scan Modal */}
      <Modal
        isOpen={!!viewScanFile}
        onClose={() => setViewScanFile(null)}
        title={viewScanFile?.title || 'Radiology Scan Viewer'}
        maxWidth="750px"
      >
        {viewScanFile && (
          <div>
            <div className="portal-scan-viewer">
              <img
                src={viewScanFile.fileUrl}
                alt={viewScanFile.title}
                style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ color: 'var(--slate-900)' }}>
                <strong>Patient:</strong> {viewScanFile.patient?.name} ({viewScanFile.patient?.patientId})
              </div>
              {viewScanFile.notes && (
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>{viewScanFile.notes}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* AI Medical Scan Analyzer Modal */}
      <AiScanAnalyzerModal
        isOpen={isAiAnalyzerOpen}
        onClose={() => {
          setIsAiAnalyzerOpen(false);
          setAiScanSelected(null);
        }}
        defaultScanUrl={aiScanSelected}
      />

      {/* Telehealth Video Consultation Studio Modal */}
      <TelehealthRoomModal
        isOpen={isTelehealthOpen}
        onClose={() => {
          setIsTelehealthOpen(false);
          setTelehealthPatient(null);
        }}
        patient={telehealthPatient}
        doctor={user}
      />

      {/* Smart Pathology Lab Report Generator Modal */}
      <PathologyReportGeneratorModal
        isOpen={isPathologyOpen}
        onClose={() => {
          setIsPathologyOpen(false);
          setPathologyPatient(null);
        }}
        defaultPatient={pathologyPatient}
      />
    </div>
  );
};
