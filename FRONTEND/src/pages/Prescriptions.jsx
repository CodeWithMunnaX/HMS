import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { prescriptionService, patientService, doctorService } from '../services/api';
import { Modal } from '../components/common/Modal';
import { PharmacyDispenserModal } from '../components/pharmacy/PharmacyDispenserModal';
import { PharmacyInventoryModal } from '../components/pharmacy/PharmacyInventoryModal';
import {
  FileText,
  Plus,
  Printer,
  Package,
  Trash2,
  Activity,
  Heart,
  Stethoscope,
  Search,
  QrCode,
  PackageCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const Prescriptions = () => {
  const { user, isDoctor, isAdmin, isPatient } = useAuth();
  const toast = useToast();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Builder & Pharmacy Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [selectedRxForDispense, setSelectedRxForDispense] = useState(null);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
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
    fetchPrescriptions();
    fetchMetadata();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await prescriptionService.getAll();
      if (res.success) {
        setPrescriptions(res.data);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        !isPatient ? patientService.getAll() : Promise.resolve({ data: [] }),
        doctorService.getAll(),
      ]);
      if (patRes.success) setPatients(patRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      console.warn(err);
    }
  };

  const addMedicineRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: '' },
      ],
    }));
  };

  const removeMedicineRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, medicines: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis) {
      return toast.warning('Please enter a clinical diagnosis');
    }

    try {
      const payload = {
        ...formData,
        symptomsObserved: formData.symptomsObserved
          ? formData.symptomsObserved.split(',').map((s) => s.trim())
          : [],
        labTestsRecommended: formData.labTestsRecommended
          ? formData.labTestsRecommended.split(',').map((s) => s.trim())
          : [],
      };

      const res = await prescriptionService.create(payload);
      if (res.success) {
        toast.success(`E-Prescription ${res.data.prescriptionId} issued!`);
        setIsModalOpen(false);
        setFormData({
          patientId: '',
          doctorId: '',
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
            { name: '', dosage: '500mg', frequency: '1-0-1 (After Food)', duration: '5 Days', instructions: '' },
          ],
          labTestsRecommended: '',
          dietaryAdvice: 'Maintain light balanced meals, avoid excessive caffeine and sodium.',
          doctorNotes: '',
          followUpDate: '',
        });
        fetchPrescriptions();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create prescription');
    }
  };

  const filtered = prescriptions.filter((rx) => {
    const rxId = rx.prescriptionId || '';
    const patName = rx.patient?.name || '';
    const diag = rx.diagnosis || '';
    const term = search.toLowerCase();
    return rxId.toLowerCase().includes(term) || patName.toLowerCase().includes(term) || diag.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Electronic Prescriptions & Clinical EMR</h1>
          <p>Digital medical prescriptions, vital signs monitoring, and pharmaceutical orders.</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{ backgroundColor: '#4338ca', color: '#ffffff', fontWeight: '700' }}
            onClick={() => setIsInventoryModalOpen(true)}
          >
            <Package size={16} /> 📦 Central Drug Inventory
          </button>
          <button
            className="btn"
            style={{ backgroundColor: '#0d9488', color: '#ffffff', fontWeight: '700' }}
            onClick={() => {
              setSelectedRxForDispense(null);
              setIsPharmacyModalOpen(true);
            }}
          >
            <QrCode size={16} /> 💊 Pharmacy QR Dispenser
          </button>
          {(isDoctor || isAdmin) && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> New E-Prescription
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by Prescription ID (RX-xxxxx), Patient Name, or Diagnosis..."
            className="form-input"
            style={{ paddingLeft: '2.2rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>RX Number</th>
              <th>Patient</th>
              <th>Attending Doctor</th>
              <th>Clinical Diagnosis</th>
              <th>Medicines</th>
              <th>Pharmacy Status</th>
              <th>Date Issued</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  Loading prescriptions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No digital prescriptions found.
                </td>
              </tr>
            ) : (
              filtered.map((rx) => (
                <tr key={rx._id}>
                  <td>
                    <strong style={{ color: '#0e7490' }}>{rx.prescriptionId}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{rx.patient?.name || 'Patient'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rx.patient?.patientId}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{rx.doctor?.user?.name || 'Doctor'}</div>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.8125rem' }}>
                      {rx.diagnosis}
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
                  <td>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: rx.dispenseStatus === 'Dispensed' ? '#ecfdf5' : '#fffbeb',
                        color: rx.dispenseStatus === 'Dispensed' ? '#059669' : '#d97706',
                        border: rx.dispenseStatus === 'Dispensed' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                      }}
                    >
                      {rx.dispenseStatus === 'Dispensed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {rx.dispenseStatus || 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setSelectedRx(rx)}
                        title="Print Official Prescription"
                      >
                        <Printer size={13} /> Print
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedRxForDispense(rx.prescriptionId);
                          setIsPharmacyModalOpen(true);
                        }}
                        title="Fulfill & Dispense at Pharmacy"
                      >
                        <QrCode size={13} color="#0d9488" /> Dispense
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Prescription Builder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Digital Prescription (E-Prescription)"
        maxWidth="820px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-select"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patientId}) - Blood: {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>

            {!isDoctor && (
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <select
                  className="form-select"
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.user?.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Primary Clinical Diagnosis *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Acute Pharyngitis, Pre-Hypertension Grade 1"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          {/* Patient Vitals Bar */}
          <div style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
            Patient Physical Vitals
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Pressure</label>
              <input
                type="text"
                className="form-input"
                value={formData.vitals.bloodPressure}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, bloodPressure: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Heart Rate</label>
              <input
                type="text"
                className="form-input"
                value={formData.vitals.heartRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, heartRate: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature</label>
              <input
                type="text"
                className="form-input"
                value={formData.vitals.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, temperature: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 Oxygen</label>
              <input
                type="text"
                className="form-input"
                value={formData.vitals.spO2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, spO2: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Medicines Dynamic Table */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 0.5rem 0' }}>
            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
              Prescribed Medications
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addMedicineRow}
            >
              <Plus size={14} /> Add Drug
            </button>
          </div>

          {formData.medicines.map((med, idx) => (
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
                placeholder="Medicine Name (e.g. Amoxicillin)"
                className="form-input"
                value={med.name}
                onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Dosage (500mg)"
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
                placeholder="Instructions (After meals)"
                className="form-input"
                value={med.instructions}
                onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
              />
              {formData.medicines.length > 1 && (
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

          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Recommended Diagnostic / Lab Tests</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete Blood Count (CBC), Lipid Profile"
                value={formData.labTestsRecommended}
                onChange={(e) => setFormData({ ...formData, labTestsRecommended: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dietary & Lifestyle Advice</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={formData.dietaryAdvice}
              onChange={(e) => setFormData({ ...formData, dietaryAdvice: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Prescription
            </button>
          </div>
        </form>
      </Modal>

      {/* View / Print Prescription Sheet Modal */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Official Clinical Prescription Document"
        maxWidth="800px"
      >
        {selectedRx && (
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
                  <div style={{ fontWeight: '800', color: '#0e7490' }}>{selectedRx.prescriptionId}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Date: {new Date(selectedRx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="rx-patient-bar">
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient Name:</span>
                  <div style={{ fontWeight: '700' }}>{selectedRx.patient?.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID:</span>
                  <div>{selectedRx.patient?.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Age / Gender:</span>
                  <div>{selectedRx.patient?.age}y ({selectedRx.patient?.gender})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Group:</span>
                  <div style={{ fontWeight: '700', color: '#dc2626' }}>{selectedRx.patient?.bloodGroup}</div>
                </div>
              </div>

              {selectedRx.vitals && (
                <div className="rx-vitals-bar">
                  <span><strong>BP:</strong> {selectedRx.vitals.bloodPressure || 'N/A'}</span>
                  <span><strong>Pulse:</strong> {selectedRx.vitals.heartRate || 'N/A'}</span>
                  <span><strong>Temp:</strong> {selectedRx.vitals.temperature || 'N/A'}</span>
                  <span><strong>SpO2:</strong> {selectedRx.vitals.spO2 || 'N/A'}</span>
                  <span><strong>Weight:</strong> {selectedRx.vitals.weight || 'N/A'}</span>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <strong>Diagnosis:</strong> <span style={{ color: '#0f172a' }}>{selectedRx.diagnosis}</span>
              </div>

              <div className="rx-symbol">℞</div>

              <table className="rx-medicines-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine & Formulation</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRx.medicines?.map((m, i) => (
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

              {selectedRx.labTestsRecommended?.length > 0 && (
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <strong>Recommended Lab Investigations:</strong>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                    {selectedRx.labTestsRecommended.map((test, i) => (
                      <li key={i}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRx.dietaryAdvice && (
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                  <strong>Dietary Advice:</strong> {selectedRx.dietaryAdvice}
                </div>
              )}

              <div className="rx-footer">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Follow-up Date: {selectedRx.followUpDate ? new Date(selectedRx.followUpDate).toLocaleDateString() : 'As needed'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ borderBottom: '1px solid #94a3b8', width: '180px', marginBottom: '0.25rem' }}></div>
                  <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                    {selectedRx.doctor?.user?.name || 'Attending Physician'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Medical Practitioner</div>
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

      {/* Pharmacy QR Dispenser Modal */}
      <PharmacyDispenserModal
        isOpen={isPharmacyModalOpen}
        onClose={() => {
          setIsPharmacyModalOpen(false);
          setSelectedRxForDispense(null);
          fetchPrescriptions();
        }}
        defaultRxId={selectedRxForDispense}
      />

      {/* Central Pharmacy Inventory Modal */}
      <PharmacyInventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />
    </div>
  );
};
