import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bedService, patientService, doctorService } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { CustomSelect } from '../components/common/CustomSelect';
import {
  BedDouble,
  Activity,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  RefreshCw,
  AlertTriangle,
  Flame,
  Zap,
  ShieldAlert,
  HeartPulse,
  LayoutGrid,
  MapPin,
  Stethoscope,
  X,
} from 'lucide-react';

export const WardsAndBeds = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const toast = useToast();

  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'floorplan'

  // Emergency Broadcast Code Alert State
  const [activeEmergencyCode, setActiveEmergencyCode] = useState(null);

  // Allocation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [allocationForm, setAllocationForm] = useState({
    patientId: '',
    doctorId: '',
    notes: '',
  });

  useEffect(() => {
    fetchBeds();
    fetchStats();
    fetchMetadata();
  }, [wardFilter]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const params = {};
      if (wardFilter) params.wardType = wardFilter;
      const res = await bedService.getAll(params);
      if (res.success) {
        setBeds(res.data);
      }
    } catch (err) {
      toast.error('Failed to load beds');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await bedService.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
      ]);
      if (patRes.success) setPatients(patRes.data);
      if (docRes.success) setDoctors(docRes.data);
    } catch (err) {
      console.warn(err);
    }
  };

  const openAllocateModal = (bed) => {
    setSelectedBed(bed);
    setIsModalOpen(true);
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocationForm.patientId) {
      return toast.warning('Please select a patient for admission');
    }

    try {
      const res = await bedService.allocate(selectedBed._id, allocationForm);
      if (res.success) {
        toast.success(res.message || 'Bed allocated successfully');
        setIsModalOpen(false);
        setAllocationForm({ patientId: '', doctorId: '', notes: '' });
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to allocate bed');
    }
  };

  const handleDischarge = async (bedId) => {
    if (!window.confirm('Confirm inpatient discharge and release bed for sanitation protocol?')) return;

    try {
      const res = await bedService.discharge(bedId);
      if (res.success) {
        toast.success(res.message || 'Patient discharged. Bed queued for sanitation.');
        fetchBeds();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to discharge bed');
    }
  };

  const triggerEmergencyCode = (codeType, label, color, description) => {
    setActiveEmergencyCode({
      type: codeType,
      label,
      color,
      description,
      triggeredAt: new Date().toLocaleTimeString(),
    });
    toast.error(`Hospital broadcast: ${label} activated`);
  };

  // Group beds by Ward for Floorplan view
  const wardsGrouped = beds.reduce((acc, bed) => {
    const ward = bed.wardType || 'General Ward';
    if (!acc[ward]) acc[ward] = [];
    acc[ward].push(bed);
    return acc;
  }, {});

  return (
    <div>
      {/* Emergency Code Blue / Red Broadcast Banner */}
      {activeEmergencyCode && (
        <div
          role="alert"
          style={{
            backgroundColor: activeEmergencyCode.color === 'blue' ? 'var(--info-50)' : 'var(--danger-50)',
            color: 'var(--slate-900)',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            border: `1px solid ${activeEmergencyCode.color === 'blue' ? 'var(--info-200)' : 'var(--danger-200)'}`,
            borderLeft: `5px solid ${activeEmergencyCode.color === 'blue' ? 'var(--info-600)' : 'var(--danger-600)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: activeEmergencyCode.color === 'blue' ? 'var(--info-600)' : 'var(--danger-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: activeEmergencyCode.color === 'blue' ? 'var(--info-700)' : 'var(--danger-700)',
                }}
              >
                {activeEmergencyCode.label} — {activeEmergencyCode.description}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                Activated at {activeEmergencyCode.triggeredAt} · Critical care and trauma physicians report to ICU / ER.
              </div>
            </div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setActiveEmergencyCode(null)}>
            <X size={14} /> Clear alert
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-hero">
        <div className="page-header">
          <div className="page-header-title">
            <span className="eyebrow">
              <BedDouble size={13} /> Inpatient care
            </span>
            <h1>Wards & Beds</h1>
            <p>Live bed occupancy across ICU, emergency, general and private wards — admit, discharge and track turnover.</p>
          </div>
          <div className="page-header-actions">
            {/* Emergency code buttons */}
            <button
              className="btn btn-info-soft btn-sm"
              onClick={() => triggerEmergencyCode('blue', 'CODE BLUE', 'blue', 'Cardiac Arrest / Resuscitation Protocol STAT')}
            >
              <HeartPulse size={14} /> Code Blue
            </button>
            <button
              className="btn btn-danger-soft btn-sm"
              onClick={() => triggerEmergencyCode('red', 'CODE RED', 'red', 'Mass Trauma / Critical ER Intake Protocol')}
            >
              <Flame size={14} /> Code Red
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                fetchBeds();
                fetchStats();
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <img
          className="page-hero-img"
          src="/images/private-room.webp"
          alt="Private inpatient room"
          loading="lazy"
        />
      </div>

      {/* Ward Metric Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total beds</span>
              <span className="stat-value">{stats.totalBeds}</span>
              <span className="stat-subtext">Across 4 facility floors</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
              <BedDouble size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Available</span>
              <span className="stat-value">{stats.availableBeds}</span>
              <span className="stat-subtext">Ready for patient assignment</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-600)' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Occupied</span>
              <span className="stat-value">{stats.occupiedBeds}</span>
              <span className="stat-subtext">{stats.occupancyRate}% Overall Occupancy</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-600)' }}>
              <Activity size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Sanitizing / turnover</span>
              <span className="stat-value">{stats.maintenanceBeds}</span>
              <span className="stat-subtext">Under clinical hygiene protocol</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--warning-50)', color: 'var(--warning-600)' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & View Toggle */}
      <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['', 'ICU', 'Emergency Room', 'General Ward', 'Private Deluxe'].map((type) => (
            <button
              key={type}
              className={`btn ${wardFilter === type ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setWardFilter(type)}
            >
              {type === '' ? 'All Wards' : type}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={14} /> Matrix Grid
          </button>
          <button
            className={`btn ${viewMode === 'floorplan' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setViewMode('floorplan')}
          >
            <MapPin size={14} /> Floorplan View
          </button>
        </div>
      </div>

      {/* Live Bed Matrix Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="app-loading-spinner" style={{ margin: '0 auto 0.75rem auto' }} />
          <p>Loading beds...</p>
        </div>
      ) : beds.length === 0 ? (
        <div className="card empty-state">No beds found for this ward.</div>
      ) : viewMode === 'floorplan' ? (
        /* Floorplan Grouped View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(wardsGrouped).map(([wardName, wardBeds]) => (
            <div key={wardName} className="card">
              <div className="card-header" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BedDouble size={18} color="var(--primary-600)" />
                  <h3 className="card-title">{wardName} Wing</h3>
                  <span className="tag tag-teal">{wardBeds.length} beds</span>
                </div>
                <span className="text-muted-sm" style={{ fontSize: '0.8rem' }}>
                  {wardBeds.filter((b) => b.status === 'Available').length} Ready • {wardBeds.filter((b) => b.status === 'Occupied').length} Admitted
                </span>
              </div>

              <div className="bed-grid">
                {wardBeds.map((bed) => renderBedCard(bed))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Standard Matrix Grid View */
        <div className="bed-grid">
          {beds.map((bed) => renderBedCard(bed))}
        </div>
      )}

      {/* Allocate Bed Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Admit Patient to Bed ${selectedBed?.bedNumber || ''} (${selectedBed?.wardType || ''})`}
        maxWidth="660px"
      >
        <form onSubmit={handleAllocateSubmit}>
          {/* Custom Searchable Inpatient Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <CustomSelect
              label="Select Inpatient for Admission"
              required
              placeholder="-- Search & Choose Inpatient --"
              searchPlaceholder="Type patient name, ID, or blood group..."
              options={patients}
              value={allocationForm.patientId}
              onChange={(val) => setAllocationForm({ ...allocationForm, patientId: val })}
              filterOption={(p, query) => {
                const name = p.name?.toLowerCase() || '';
                const pid = p.patientId?.toLowerCase() || '';
                const bg = p.bloodGroup?.toLowerCase() || '';
                const phone = p.phone?.toLowerCase() || '';
                return name.includes(query) || pid.includes(query) || bg.includes(query) || phone.includes(query);
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
                      flexShrink: 0,
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
                        ID: <strong>{p.patientId}</strong> • Age: {p.age}y • {p.gender}
                      </div>
                    </div>
                  </div>
                  <span className="tag tag-danger">{p.bloodGroup}</span>
                </div>
              )}
            />
          </div>

          {/* Custom Searchable Doctor Dropdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <CustomSelect
              label="Assign Attending Specialist Doctor"
              placeholder="-- Choose Attending Doctor (Optional) --"
              searchPlaceholder="Search doctor by name or specialty..."
              options={doctors}
              value={allocationForm.doctorId}
              onChange={(val) => setAllocationForm({ ...allocationForm, doctorId: val })}
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
                        {doc.specialty} • Room: {doc.roomNumber || 'OPD-101'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-700)', fontWeight: 600 }}>
                    ₹{doc.consultationFee} Fee
                  </span>
                </div>
              )}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Admission Clinical Notes / Triage Vitals</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Post-operative recovery, oxygen via nasal cannula 2L/min..."
              value={allocationForm.notes}
              onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '160px', justifyContent: 'center' }}>
              Confirm Admission
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );

  function renderBedCard(bed) {
    const isOccupied = bed.status === 'Occupied';
    const isAvailable = bed.status === 'Available';
    const isMaintenance = bed.status === 'Sanitizing / Maintenance';

    return (
      <div
        key={bed._id}
        className={`bed-card ${
          isOccupied ? 'occupied' : isAvailable ? 'available' : 'maintenance'
        }`}
      >
        <div className="bed-card-header">
          <span className="bed-number" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BedDouble size={17} color="var(--primary-600)" />
            <span>{bed.bedNumber}</span>
          </span>
          <StatusBadge status={bed.status} />
        </div>

        <div className="bed-meta">
          {bed.wardType} · {bed.floor} · Room {bed.roomNumber || '101'}
        </div>

        <div className="bed-rate">₹{bed.dailyRate} / day</div>

        {isOccupied && bed.currentPatient ? (
          <div className="bed-patient-info">
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>{bed.currentPatient.name}</span>
              <span className="tag tag-danger">{bed.currentPatient.bloodGroup}</span>
            </div>
            <div className="text-muted-sm" style={{ marginTop: '2px' }}>
              Patient ID: <strong>{bed.currentPatient.patientId}</strong> • Age: {bed.currentPatient.age}y
            </div>
            {bed.attendingDoctor && (
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Stethoscope size={11} /> Dr: {bed.attendingDoctor?.user?.name}
              </div>
            )}
            {bed.notes && (
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.35 }}>
                "{bed.notes}"
              </div>
            )}
          </div>
        ) : (
          <div className={`bed-status-note ${isAvailable ? 'available' : 'maintenance'}`}>
            {isAvailable ? 'Ready for admission' : 'Sanitation & linen turnover'}
          </div>
        )}

        {isStaff && (
          <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
            {isAvailable ? (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => openAllocateModal(bed)}
              >
                <UserCheck size={14} /> Admit Patient
              </button>
            ) : isOccupied ? (
              <button
                className="btn btn-danger-soft btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleDischarge(bed._id)}
              >
                Discharge Inpatient
              </button>
            ) : null}
          </div>
        )}
      </div>
    );
  }
};
