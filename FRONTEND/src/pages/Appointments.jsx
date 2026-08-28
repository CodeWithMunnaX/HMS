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
          <h1>Clinical Appointments</h1>
          <p>Schedule patient consultations, track live token queues, and manage doctor calendars.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by patient, doctor, or token #..."
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '180px' }}>
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
            <div style={{ width: '220px' }}>
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  Loading appointments...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No appointments found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ fontWeight: '800', color: '#0e7490', fontSize: '0.9375rem' }}>
                      Token #{app.tokenNumber}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.appointmentNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{app.patient?.name || 'Walk-in Patient'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {app.patient?.patientId} • {app.patient?.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{app.doctor?.user?.name || 'Doctor'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#0891b2' }}>{app.doctor?.specialty}</div>
                  </td>
                  <td>{app.department}</td>
                  <td>
                    <div>{new Date(app.appointmentDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.timeSlot}</div>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.reasonForVisit}>
                      {app.reasonForVisit}
                    </div>
                    {app.symptoms?.length > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
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
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', width: 'auto' }}
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
                        backgroundColor: '#0891b2',
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
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#0891b2', backgroundColor: '#ecfeff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      {p.patientId}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                      🩸 {p.bloodGroup}
                    </span>
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
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
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
                        <div style={{ fontWeight: '800', color: isSelected ? '#0891b2' : '#0f172a', fontSize: '0.875rem' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ID: <strong>{p.patientId}</strong> • Age: {p.age}y • Tel: {p.phone}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.725rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
                      🩸 {p.bloodGroup}
                    </span>
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
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>{doc.user?.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#0891b2', backgroundColor: '#ecfeff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      {doc.specialty}
                    </span>
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
                        <div style={{ fontWeight: '700', color: isSelected ? '#0891b2' : '#0f172a', fontSize: '0.875rem' }}>
                          {doc.user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {doc.specialty} • ₹{doc.consultationFee} Fee
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
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
                    backgroundColor: '#ecfeff',
                    border: '1px solid #a5f3fc',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={selectedDoc.user?.avatar || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150'}
                      alt={selectedDoc.user?.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0891b2' }}
                    />
                    <div>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>
                        {selectedDoc.user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#0e7490' }}>
                        {selectedDoc.specialty} • {selectedDoc.roomNumber || 'OPD-102'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Consultation Fee</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0891b2' }}>₹{selectedDoc.consultationFee}</div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Available Time Slots Section */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#0891b2" />
              <span>Available Consultation Time Slots *</span>
            </label>

            {loadingSlots ? (
              <div style={{ fontSize: '0.85rem', color: '#0891b2', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                Checking real-time doctor availability slots...
              </div>
            ) : !bookingForm.doctorId ? (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#475569',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                👉 Please choose an attending specialist above to generate available consultation slots.
              </div>
            ) : availableSlots.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#dc2626', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
                No slots available on this date. Please pick another consultation date.
              </div>
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
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(8, 145, 178, 0.25)' : 'none',
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

          {/* Category & Symptoms Row */}
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
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
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
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
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              ⚡ 1-Click Quick Symptoms:
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

          {/* Chief Reason for Visit */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
            }}
          >
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
              {submitting ? 'Booking Appointment...' : '✓ Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
