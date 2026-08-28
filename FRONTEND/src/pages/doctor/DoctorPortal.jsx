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

  const [currentTab, setCurrentTab] = useState(subTab || 'overview');
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
      <div
        style={{
          background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0f172a 100%)',
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
            src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
            alt="Doctor Avatar"
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
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                ● Active On Duty
              </span>
              <span style={{ opacity: 0.85, fontSize: '0.8125rem' }}>Room: OPD-204</span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: '0.25rem 0', color: '#ffffff' }}>
              {user?.name}
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
              {user?.department || 'Cardiology'} Specialist • Consultant Physician & Surgeon
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
            onClick={() => {
              setTelehealthPatient(null);
              setIsTelehealthOpen(true);
            }}
          >
            <Video size={16} /> Telehealth Video Consult
          </button>
          <button
            className="btn"
            style={{
              backgroundColor: '#4338ca',
              color: '#ffffff',
              fontWeight: '700',
            }}
            onClick={() => {
              setPathologyPatient(null);
              setIsPathologyOpen(true);
            }}
          >
            <Microscope size={16} /> Smart Lab Report
          </button>
          <button
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              color: '#ffffff',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            onClick={() => {
              setAiScanSelected(null);
              setIsAiAnalyzerOpen(true);
            }}
          >
            <Activity size={16} /> Clinical Scan Analyzer
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#0e7490', fontWeight: '700' }}
            onClick={() => {
              setRxForm((prev) => ({ ...prev, patientId: '', appointmentId: '' }));
              setIsRxModalOpen(true);
            }}
          >
            <Plus size={16} /> Write E-Prescription
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Doctor */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: "📋 Today's Queue & Dashboard", icon: Clock },
          { id: 'prescriptions', label: '℞ E-Prescriptions Studio', icon: FileCheck },
          { id: 'patients', label: '👥 My Patients & History', icon: User },
          { id: 'scans', label: '🔬 Diagnostic Scans & Vault', icon: FolderLock },
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
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No patients currently in your queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: '#ecfeff',
                              color: '#0e7490',
                              fontWeight: '800',
                              fontSize: '1rem',
                            }}
                          >
                            #{app.tokenNumber}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{app.patient?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.patient?.phone}</div>
                        </td>
                        <td>
                          <div>{app.patient?.patientId}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {app.patient?.age}y ({app.patient?.gender}) • <strong>{app.patient?.bloodGroup}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{app.timeSlot}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(app.appointmentDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{app.reasonForVisit}</div>
                          {app.symptoms?.length > 0 && (
                            <div style={{ fontSize: '0.725rem', color: '#dc2626', marginTop: '2px' }}>
                              ⚠️ {app.symptoms.join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                              onClick={() => {
                                setTelehealthPatient(app.patient);
                                setIsTelehealthOpen(true);
                              }}
                              title="Start Telehealth Video Consultation"
                            >
                              <Video size={13} /> Video Call
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
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No digital prescriptions issued yet.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx) => (
                    <tr key={rx._id}>
                      <td>
                        <strong style={{ color: '#0e7490' }}>{rx.prescriptionId}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700' }}>{rx.patient?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rx.patient?.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{rx.diagnosis}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                          BP: {rx.vitals?.bloodPressure || '-'} • HR: {rx.vitals?.heartRate || '-'}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: '#ecfeff',
                            color: '#0e7490',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                          }}
                        >
                          {rx.medicines?.length || 0} Drugs
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
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong style={{ color: '#0e7490' }}>{p.patientId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.phone}</div>
                    </td>
                    <td>
                      {p.age} yrs ({p.gender})
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                        }}
                      >
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td>
                      {p.allergies?.length > 0 ? (
                        <span style={{ color: '#b45309', fontWeight: '600', fontSize: '0.75rem' }}>
                          ⚠️ {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>None</span>
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
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                Patient Diagnostic Scans (Cloudinary Vault)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                High-resolution radiology imaging, X-Rays, MRI scans, and pathology reports.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setAiScanSelected(null);
                setIsAiAnalyzerOpen(true);
              }}
            >
              <Activity size={16} /> 🔬 Clinical Scan Analyzer
            </button>
          </div>

          <div className="files-grid">
            {scans.map((file) => (
              <div key={file._id} className="file-card">
                <div
                  className="file-card-preview"
                  onClick={() => setViewScanFile(file)}
                  style={{ cursor: 'pointer' }}
                >
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
                  <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a' }}>
                    {file.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Patient: <strong>{file.patient?.name}</strong> ({file.patient?.patientId})
                  </div>
                  {file.notes && (
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
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
                      <Activity size={13} /> 🔬 Analyze
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
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <AlertTriangle size={20} color="#d97706" />
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
          <div style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
            Patient Physical Vitals
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 0.5rem 0' }}>
            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
              Prescribed Medications
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedicineRow}>
              <Plus size={14} /> Add Drug
            </button>
          </div>

          {rxForm.medicines.map((med, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1.5fr 1fr 2fr auto',
                gap: '0.5rem',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
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
                  onClick={() => removeMedicineRow(idx)}
                  style={{ color: '#ef4444', padding: '0.4rem', cursor: 'pointer' }}
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
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    100 Clinical Way, Health District • Tel: +1 (555) 010-9000
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0e7490' }}>{selectedRxForPrint.prescriptionId}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Date: {new Date(selectedRxForPrint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="rx-patient-bar">
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient Name:</span>
                  <div style={{ fontWeight: '700' }}>{selectedRxForPrint.patient?.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID:</span>
                  <div>{selectedRxForPrint.patient?.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Age / Gender:</span>
                  <div>{selectedRxForPrint.patient?.age}y ({selectedRxForPrint.patient?.gender})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Group:</span>
                  <div style={{ fontWeight: '700', color: '#dc2626' }}>{selectedRxForPrint.patient?.bloodGroup}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Diagnosis:</strong> <span style={{ color: '#0f172a' }}>{selectedRxForPrint.diagnosis}</span>
              </div>

              <div className="rx-symbol">℞</div>

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

              <div className="rx-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent('CAREPULSE-VERIFIED-RX-' + selectedRxForPrint.prescriptionId + '-' + selectedRxForPrint.patient?.name)}`}
                    alt="Scannable RX QR Code"
                    style={{ width: '70px', height: '70px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '2px' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase' }}>
                      Verified Digital RX
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748b', maxWidth: '160px', lineHeight: '1.2' }}>
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
                    <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0f172a' }}>{user?.name}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>License ID: MED-8842-CA • CarePulse MD</div>
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
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <div><strong>Patient ID:</strong> {selectedPatientForHistory.patientId}</div>
              <div><strong>Age / Gender:</strong> {selectedPatientForHistory.age}y ({selectedPatientForHistory.gender})</div>
              <div><strong>Blood Group:</strong> <span style={{ color: '#dc2626', fontWeight: '700' }}>{selectedPatientForHistory.bloodGroup}</span></div>
              <div><strong>Known Allergies:</strong> {selectedPatientForHistory.allergies?.join(', ') || 'None'}</div>
              <div><strong>Chronic Conditions:</strong> {selectedPatientForHistory.chronicConditions?.join(', ') || 'None'}</div>
            </div>

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
            <div style={{ textAlign: 'center', background: '#0f172a', padding: '1rem', borderRadius: '12px' }}>
              <img
                src={viewScanFile.fileUrl}
                alt={viewScanFile.title}
                style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <strong>Patient:</strong> {viewScanFile.patient?.name} ({viewScanFile.patient?.patientId})
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{viewScanFile.notes}</p>
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
