import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { appointmentService, doctorService, patientService } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CustomSelect } from '../components/common/CustomSelect';
import {
  Calendar,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
  Tag,
  Search,
} from 'lucide-react';

export const Appointments = () => {
  const { user, isPatient, isDoctor } = useAuth();
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [search, setSearch] = useState('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    doctorId: '',
    department: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '',
    type: 'General Checkup',
    reasonForVisit: '',
    symptoms: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchMetadata();
  }, [statusFilter, doctorFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (doctorFilter) params.doctorId = doctorFilter;

      const res = await appointmentService.getAll(params);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        doctorService.getAll(),
        !isPatient ? patientService.getAll() : Promise.resolve({ data: [] }),
      ]);
      if (docRes.success) setDoctors(docRes.data);
      if (patRes.success) setPatients(patRes.data);
    } catch (err) {
      console.warn('Metadata fetch warning', err);
    }
  };

  // Load available time slots when doctor or date changes in booking modal
  useEffect(() => {
    if (bookingForm.doctorId && bookingForm.appointmentDate) {
      loadSlots(bookingForm.doctorId, bookingForm.appointmentDate);
    }
  }, [bookingForm.doctorId, bookingForm.appointmentDate]);

  const loadSlots = async (docId, date) => {
    try {
      setLoadingSlots(true);
      const res = await appointmentService.getSlots(docId, date);
      if (res.success) {
        setAvailableSlots(res.data);
        // Default to first available slot if current selected is invalid
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

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const selectedDoc = doctors.find((d) => d._id === docId);
    setBookingForm((prev) => ({
      ...prev,
      doctorId: docId,
      department: selectedDoc ? selectedDoc.department : '',
    }));
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const res = await appointmentService.update(appointmentId, { status: newStatus });
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.appointmentDate || !bookingForm.timeSlot || !bookingForm.reasonForVisit) {
      return toast.warning('Please fill in all required fields');
    }

    try {
      setSubmitting(true);
      const payload = {
        ...bookingForm,
        symptoms: bookingForm.symptoms
          ? bookingForm.symptoms.split(',').map((s) => s.trim())
          : [],
      };

      const res = await appointmentService.book(payload);
      if (res.success) {
        toast.success(res.message || 'Appointment confirmed!');
        setIsModalOpen(false);
        setBookingForm({
          patientId: '',
          doctorId: '',
          department: '',
          appointmentDate: new Date().toISOString().split('T')[0],
          timeSlot: '',
          type: 'General Checkup',
          reasonForVisit: '',
          symptoms: '',
        });
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter client-side search
  const filteredAppointments = appointments.filter((app) => {
    const patName = app.patient?.name || '';
    const docName = app.doctor?.user?.name || '';
    const aptNum = app.appointmentNumber || '';
    const term = search.toLowerCase();
    return patName.toLowerCase().includes(term) || docName.toLowerCase().includes(term) || aptNum.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Appointments</h1>
          <p>Schedule consultations, track the token queue and manage doctor calendars.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by patient, doctor, or token #..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {!isDoctor && (
          <div className="filter-select">
            <select
              className="form-select"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.user?.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Token / ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Schedule</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  Loading appointments...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">
                  No appointments found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="text-link">Token #{app.tokenNumber}</div>
                    <span className="text-muted-sm">{app.appointmentNumber}</span>
                  </td>
                  <td>
                    <div className="text-strong">{app.patient?.name || 'Walk-in Patient'}</div>
                    <div className="text-muted-sm">
                      {app.patient?.patientId} • {app.patient?.phone}
                    </div>
                  </td>
                  <td>
                    <div className="text-strong">{app.doctor?.user?.name || 'Doctor'}</div>
                    <div className="text-muted-sm">{app.doctor?.specialty}</div>
                  </td>
                  <td>{app.department}</td>
                  <td>
                    <div>{new Date(app.appointmentDate).toLocaleDateString()}</div>
                    <div className="text-muted-sm">{app.timeSlot}</div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.reasonForVisit}>
                      {app.reasonForVisit}
                    </div>
                    {app.symptoms?.length > 0 && (
                      <div className="text-muted-sm" style={{ marginTop: '2px' }}>
                        Symptoms: {app.symptoms.join(', ')}
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    {!isPatient && (
                      <select
                        className="form-select"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', width: 'auto', minWidth: '140px' }}
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Clinical Appointment"
        maxWidth="760px"
      >
        <form onSubmit={handleBookingSubmit}>
          {/* Patient Selector */}
          {!isPatient && (
            <div style={{ marginBottom: '1.25rem' }}>
              <CustomSelect
                label="Select Patient"
                required
                placeholder="-- Search & Choose Registered Patient --"
                searchPlaceholder="Search patient by name, ID, or phone..."
                options={patients}
                value={bookingForm.patientId}
                onChange={(val) => setBookingForm({ ...bookingForm, patientId: val })}
                filterOption={(p, query) => {
                  const name = p.name?.toLowerCase() || '';
                  const pid = p.patientId?.toLowerCase() || '';
                  const phone = p.phone?.toLowerCase() || '';
                  const bg = p.bloodGroup?.toLowerCase() || '';
                  return name.includes(query) || pid.includes(query) || phone.includes(query) || bg.includes(query);
                }}
                renderSelected={(p) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-600)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                      }}
                    >
                      {p.name?.charAt(0) || 'P'}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{p.name}</span>
                    <span className="tag tag-teal">{p.patientId}</span>
                    <span className="tag tag-danger">{p.bloodGroup}</span>
                  </div>
                )}
                renderOption={(p, isSelected) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--primary-600)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          flexShrink: 0,
                        }}
                      >
                        {p.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: isSelected ? 'var(--primary-700)' : 'var(--slate-900)', fontSize: '0.875rem' }}>
                          {p.name}
                        </div>
                        <div className="text-muted-sm">
                          ID: <strong>{p.patientId}</strong> • Age: {p.age}y • Tel: {p.phone}
                        </div>
                      </div>
                    </div>
                    <span className="tag tag-danger">{p.bloodGroup}</span>
                  </div>
                )}
              />
            </div>
          )}

          {/* Doctor & Date Row */}
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div>
              <CustomSelect
                label="Select Attending Doctor"
                required
                placeholder="-- Choose Doctor --"
                searchPlaceholder="Search doctor by name or specialty..."
                options={doctors}
                value={bookingForm.doctorId}
                onChange={(val) => {
                  setBookingForm((prev) => ({
                    ...prev,
                    doctorId: val,
                    department: doctors.find((d) => d._id === val)?.specialty || prev.department,
                  }));
                }}
                filterOption={(doc, query) => {
                  const name = doc.user?.name?.toLowerCase() || '';
                  const spec = doc.specialty?.toLowerCase() || '';
                  return name.includes(query) || spec.includes(query);
                }}
                renderSelected={(doc) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={doc.user?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100'}
                      alt=""
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.875rem' }}>{doc.user?.name}</span>
                    <span className="tag tag-teal">{doc.specialty}</span>
                  </div>
                )}
                renderOption={(doc, isSelected) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={doc.user?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100'}
                        alt=""
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: isSelected ? 'var(--primary-700)' : 'var(--slate-900)', fontSize: '0.875rem' }}>
                          {doc.user?.name}
                        </div>
                        <div className="text-muted-sm">
                          {doc.specialty} • ₹{doc.consultationFee} Fee
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Consultation Date *
              </label>
              <input
                type="date"
                className="form-input"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingForm.appointmentDate}
                onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
              />
            </div>
          </div>

          {/* Selected Doctor Summary Card */}
          {bookingForm.doctorId && (
            (() => {
              const selectedDoc = doctors.find((d) => d._id === bookingForm.doctorId);
              if (!selectedDoc) return null;
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    backgroundColor: 'var(--primary-50)',
                    border: '1px solid var(--primary-100)',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={selectedDoc.user?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150'}
                      alt={selectedDoc.user?.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 0 0 1px var(--primary-200)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                        {selectedDoc.user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>
                        {selectedDoc.specialty} • {selectedDoc.roomNumber || 'OPD-102'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted-sm" style={{ fontWeight: 600 }}>Consultation fee</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-700)' }}>₹{selectedDoc.consultationFee}</div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Available Time Slots Section */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="var(--primary-600)" />
              <span>Available Consultation Time Slots *</span>
            </label>

            {loadingSlots ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', padding: '1rem', backgroundColor: 'var(--slate-50)', borderRadius: '10px', textAlign: 'center' }}>
                Checking availability...
              </div>
            ) : !bookingForm.doctorId ? (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--slate-600)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px dashed var(--slate-300)',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                Choose a doctor above to see available time slots.
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: 'var(--danger-700)', padding: '0.75rem', backgroundColor: 'var(--danger-50)', border: '1px solid var(--danger-100)', borderRadius: '10px' }}>
                No slots available on this date. Please pick another consultation date.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: '0.5rem' }}>
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
                        border: isSelected ? '1px solid var(--primary-600)' : '1px solid var(--slate-200)',
                        backgroundColor: isSelected ? 'var(--primary-50)' : s.isAvailable ? '#ffffff' : 'var(--slate-100)',
                        color: isSelected ? 'var(--primary-700)' : s.isAvailable ? 'var(--slate-900)' : 'var(--slate-500)',
                        cursor: s.isAvailable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 2px rgba(8, 145, 178, 0.15)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <span>{s.slot}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: '600' }}>
                        {s.isAvailable ? (isSelected ? 'Selected' : 'Available') : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category & Symptoms Row */}
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                Appointment Category
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
                <option value="Vaccination">Vaccination / Immunization</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Key Symptoms
              </label>
              <input
                type="text"
                placeholder="e.g. Headache, Fever, Cough"
                className="form-input"
                value={bookingForm.symptoms}
                onChange={(e) => setBookingForm({ ...bookingForm, symptoms: e.target.value })}
              />
            </div>
          </div>

          {/* Quick Symptoms Preset Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="text-muted-sm" style={{ fontWeight: 600, marginBottom: '0.4rem' }}>
              Quick add symptoms
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Headache & Migraine', 'Fever & Chills', 'Chest Discomfort', 'Knee & Joint Pain', 'Persistent Cough', 'Routine Checkup'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    const existing = bookingForm.symptoms ? bookingForm.symptoms + ', ' : '';
                    setBookingForm((prev) => ({
                      ...prev,
                      symptoms: existing + chip,
                      reasonForVisit: prev.reasonForVisit ? prev.reasonForVisit : `Consultation for ${chip}`,
                    }));
                  }}
                  className="tag"
                  style={{ cursor: 'pointer', borderRadius: '999px', padding: '0.25rem 0.65rem', fontWeight: 600 }}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Chief Reason for Visit */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Chief Reason for Visit *
            </label>
            <textarea
              className="form-textarea"
              rows="3"
              required
              placeholder="Describe primary medical complaint, duration, and concerns..."
              value={bookingForm.reasonForVisit}
              onChange={(e) => setBookingForm({ ...bookingForm, reasonForVisit: e.target.value })}
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {submitting ? 'Booking Appointment...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
