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
          <h1>Patient Directory & Electronic Medical Records</h1>
          <p>Comprehensive patient health records, allergy warnings, triage status, and clinical history.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} /> Register New Patient
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Patient Name, ID (PAT-xxxx), or Phone..."
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  Loading patient records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No patients found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong style={{ color: '#0e7490' }}>{p.patientId}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={p.name} size={36} shape="circle" />
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.age} yrs • {p.gender}
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {p.allergies.map((a, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#fffbeb',
                              color: '#b45309',
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              border: '1px solid #fef3c7',
                            }}
                          >
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None reported</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={p.admissionStatus} />
                    {p.currentBed && (
                      <div style={{ fontSize: '0.7rem', color: '#0891b2', marginTop: '2px' }}>
                        Bed: {p.currentBed?.bedNumber} ({p.currentBed?.wardType})
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '500' }}>{p.insuranceProvider}</div>
                    {p.policyNumber && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.policyNumber}</div>
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

          <div style={{ margin: '1rem 0 0.5rem 0', fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
            Emergency Contact & Clinical Alerts
          </div>

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
            <div
              style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID:</span>
                <div style={{ fontWeight: '700' }}>{selectedPatientHistory.patient.patientId}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Age / Gender:</span>
                <div>{selectedPatientHistory.patient.age}y ({selectedPatientHistory.patient.gender})</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Group:</span>
                <div style={{ fontWeight: '700', color: '#dc2626' }}>{selectedPatientHistory.patient.bloodGroup}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Emergency Contact:</span>
                <div>
                  {selectedPatientHistory.patient.emergencyContact?.name || 'None'} (
                  {selectedPatientHistory.patient.emergencyContact?.relation || '-'})
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <h4 style={{ marginBottom: '0.75rem', color: '#0e7490' }}>Digital Prescriptions ({selectedPatientHistory.prescriptions?.length || 0})</h4>
            {selectedPatientHistory.prescriptions?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>No prescriptions on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedPatientHistory.prescriptions.map((rx) => (
                  <div
                    key={rx._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.875rem',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: '#0e7490' }}>{rx.prescriptionId}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Diagnosis: {rx.diagnosis}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>
                      Medicines: {rx.medicines?.map((m) => `${m.name} (${m.dosage} - ${m.frequency})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices */}
            <h4 style={{ marginBottom: '0.75rem', color: '#0e7490' }}>Billing Invoices ({selectedPatientHistory.invoices?.length || 0})</h4>
            {selectedPatientHistory.invoices?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>No invoices recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedPatientHistory.invoices.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <strong>{inv.invoiceNumber}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(inv.issueDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700' }}>${inv.totalAmount}</div>
                      <StatusBadge status={inv.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
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
