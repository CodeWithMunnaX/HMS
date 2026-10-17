import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { patientService } from '../services/api';
import { StatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import {
  UserPlus,
  Search,
  FileText,
  Activity,
  Phone,
  Shield,
  Heart,
  Calendar,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

export const Patients = () => {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    insuranceProvider: 'Self Pay',
    policyNumber: '',
  });

  // Patient History Drawer
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, [bloodGroupFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      const res = await patientService.getAll(params);
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone,
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions
          ? formData.chronicConditions.split(',').map((s) => s.trim())
          : [],
        insuranceProvider: formData.insuranceProvider,
        policyNumber: formData.policyNumber,
      };

      const res = await patientService.create(payload);
      if (res.success) {
        toast.success(`Patient registered! Assigned ID: ${res.data.patientId}`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          age: '',
          gender: 'Male',
          bloodGroup: 'O+',
          phone: '',
          email: '',
          address: '',
          emergencyContactName: '',
          emergencyContactRelation: '',
          emergencyContactPhone: '',
          allergies: '',
          chronicConditions: '',
          insuranceProvider: 'Self Pay',
          policyNumber: '',
        });
        fetchPatients();
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const viewHistory = async (patientId) => {
    try {
      setHistoryLoading(true);
      const res = await patientService.getHistory(patientId);
      if (res.success) {
        setSelectedPatientHistory(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch patient history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filtered = patients.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.patientId?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Patients</h1>
          <p>Patient records, allergy alerts, admission status and clinical history.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} /> Register New Patient
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by Patient Name, ID (PAT-xxxx), or Phone..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <select
            className="form-select"
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name & Contact</th>
              <th>Age / Gender</th>
              <th>Blood Group</th>
              <th>Allergies & Alerts</th>
              <th>Care Status</th>
              <th>Insurance</th>
              <th>Clinical Records</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  Loading patient records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  No patients found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong className="text-link">{p.patientId}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={p.name} size={36} shape="circle" />
                      <div>
                        <div className="text-strong">{p.name}</div>
                        <div className="text-muted-sm">{p.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.age} yrs • {p.gender}
                  </td>
                  <td>
                    <span className="tag tag-danger">{p.bloodGroup}</span>
                  </td>
                  <td>
                    {p.allergies?.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {p.allergies.map((a, idx) => (
                          <span key={idx} className="tag tag-warning">
                            <AlertTriangle size={11} /> {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-sm">None reported</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={p.admissionStatus} />
                    {p.currentBed && (
                      <div className="text-muted-sm" style={{ marginTop: '4px' }}>
                        Bed: {p.currentBed?.bedNumber} ({p.currentBed?.wardType})
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>{p.insuranceProvider}</div>
                    {p.policyNumber && (
                      <div className="text-muted-sm">{p.policyNumber}</div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => viewHistory(p._id)}
                    >
                      <Activity size={14} /> Medical History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Register New Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Patient Profile"
        maxWidth="720px"
      >
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Legal Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Eleanor Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                className="form-input"
                required
                min="0"
                max="125"
                placeholder="e.g. 35"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                className="form-select"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Primary Contact Phone *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Street address, City, State, ZIP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="section-title">Emergency contact & clinical alerts</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Emergency Contact Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Guardian / Spouse Name"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Spouse / Parent"
                value={formData.emergencyContactRelation}
                onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 999-9999"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Known Allergies (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Penicillin, Peanuts, Latex"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Chronic Conditions</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Diabetes, Hypertension, Asthma"
                value={formData.chronicConditions}
                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Insurance Provider</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BlueCross, Aetna, or Self Pay"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Policy / Member ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Policy # / Group #"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient Medical History Drawer / Modal */}
      <Modal
        isOpen={!!selectedPatientHistory}
        onClose={() => setSelectedPatientHistory(null)}
        title={`Medical Record Timeline — ${selectedPatientHistory?.patient?.name || ''}`}
        maxWidth="840px"
      >
        {selectedPatientHistory && (
          <div>
            <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
              <div>
                <span className="info-panel-label">Patient ID</span>
                <div style={{ fontWeight: 700 }}>{selectedPatientHistory.patient.patientId}</div>
              </div>
              <div>
                <span className="info-panel-label">Age / Gender</span>
                <div>{selectedPatientHistory.patient.age}y ({selectedPatientHistory.patient.gender})</div>
              </div>
              <div>
                <span className="info-panel-label">Blood Group</span>
                <div style={{ fontWeight: 700, color: 'var(--danger-600)' }}>{selectedPatientHistory.patient.bloodGroup}</div>
              </div>
              <div>
                <span className="info-panel-label">Emergency Contact</span>
                <div>
                  {selectedPatientHistory.patient.emergencyContact?.name || 'None'} (
                  {selectedPatientHistory.patient.emergencyContact?.relation || '-'})
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Prescriptions ({selectedPatientHistory.prescriptions?.length || 0})</h4>
            {selectedPatientHistory.prescriptions?.length === 0 ? (
              <p className="text-muted-sm" style={{ marginBottom: '1.5rem' }}>No prescriptions on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedPatientHistory.prescriptions.map((rx) => (
                  <div
                    key={rx._id}
                    style={{
                      border: '1px solid var(--slate-200)',
                      borderRadius: '10px',
                      padding: '0.875rem',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <strong className="text-link">{rx.prescriptionId}</strong>
                      <span className="text-muted-sm">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-900)' }}>Diagnosis: {rx.diagnosis}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                      Medicines: {rx.medicines?.map((m) => `${m.name} (${m.dosage} - ${m.frequency})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices */}
            <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Invoices ({selectedPatientHistory.invoices?.length || 0})</h4>
            {selectedPatientHistory.invoices?.length === 0 ? (
              <p className="text-muted-sm">No invoices recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedPatientHistory.invoices.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      border: '1px solid var(--slate-200)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <strong>{inv.invoiceNumber}</strong>
                      <div className="text-muted-sm">{new Date(inv.issueDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>₹{inv.totalAmount}</div>
                      <StatusBadge status={inv.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPatientHistory(null)}>
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
