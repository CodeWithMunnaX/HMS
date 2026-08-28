import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { doctorService } from '../services/api';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import {
  Stethoscope,
  Plus,
  Star,
  Award,
  Clock,
  MapPin,
  Search,
  DollarSign,
  Calendar,
} from 'lucide-react';

export const Doctors = ({ setActiveTab }) => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);

  // Create Doctor Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    qualifications: 'MBBS, MD',
    experienceYears: 5,
    department: 'Cardiology',
    consultationFee: 75,
    roomNumber: 'OPD-101',
    biography: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, [deptFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (deptFilter) params.department = deptFilter;
      const res = await doctorService.getAll(params);
      if (res.success) {
        setDoctors(res.data);
        const depts = [...new Set(res.data.map((d) => d.department))];
        setDepartments(depts);
      }
    } catch (err) {
      toast.error('Failed to load doctors roster');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications.split(',').map((q) => q.trim()),
        experienceYears: Number(formData.experienceYears),
        consultationFee: Number(formData.consultationFee),
      };

      const res = await doctorService.create(payload);
      if (res.success) {
        toast.success(`Doctor profile for ${res.data.user?.name} created!`);
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          specialty: '',
          qualifications: 'MBBS, MD',
          experienceYears: 5,
          department: 'Cardiology',
          consultationFee: 75,
          roomNumber: 'OPD-101',
          biography: '',
        });
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create doctor');
    }
  };

  const filtered = doctors.filter((doc) => {
    const name = doc.user?.name || '';
    const spec = doc.specialty || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || spec.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Medical Specialists & Doctor Roster</h1>
          <p>Consulting physicians, surgeons, pediatricians, and clinical department heads.</p>
        </div>
        {isAdmin && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Specialist
            </button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by doctor name or medical specialty..."
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Card Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading specialists catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No doctors found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((doc) => (
            <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <Avatar
                  src={doc.user?.avatar}
                  name={doc.user?.name || 'Doctor'}
                  size={64}
                  shape="rounded"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                    {doc.user?.name}
                  </h3>
                  <div style={{ color: '#0891b2', fontSize: '0.8125rem', fontWeight: '600' }}>
                    {doc.specialty}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {doc.department} Department
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: '1.4', marginBottom: '1rem', flex: 1 }}>
                {doc.biography || 'Experienced healthcare practitioner dedicated to comprehensive patient care.'}
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                  <Award size={14} color="#0891b2" />
                  <span>{doc.experienceYears} Yrs Experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                  <Star size={14} color="#f59e0b" />
                  <span>{doc.rating || 4.9} / 5.0 Rating</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
                  <MapPin size={14} color="#64748b" />
                  <span>{doc.roomNumber}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: '700' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>₹</span>
                  <span>₹{doc.consultationFee} Fee</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setActiveTab && setActiveTab('appointments')}
                >
                  <Calendar size={14} /> Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Medical Specialist to Roster"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateDoctor}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Doctor Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Dr. Arthur Miller"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="doctor@carepulse.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Specialty *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Interventional Cardiology"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Oncology">Oncology</option>
                <option value="Emergency Care">Emergency Care</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Qualifications</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MBBS, MD, FACC"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room / Clinic Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. OPD Suite 204"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biography & Specialization Highlights</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Provide clinical background..."
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
