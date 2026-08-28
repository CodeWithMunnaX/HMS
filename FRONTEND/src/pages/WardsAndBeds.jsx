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
    toast.error(`🚨 HOSPITAL BROADCAST: ${label} ACTIVATED!`);
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
          style={{
            backgroundColor: activeEmergencyCode.color === 'blue' ? '#1e3a8a' : '#991b1b',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            animation: 'pulse 1.5s infinite',
            border: '2px solid rgba(255,255,255,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={26} color="#ffffff" className="animate-bounce" />
            </div>
            <div>
              <div style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                🚨 {activeEmergencyCode.label} — {activeEmergencyCode.description}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                Activated at {activeEmergencyCode.triggeredAt} • All available Critical Care & Trauma Physicians report STAT to ICU / ER.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveEmergencyCode(null)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              border: 'none',
              color: '#ffffff',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <X size={14} /> Clear Alert
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <h1>Emergency Triage & Inpatient Ward Suite</h1>
          <p>Real-time inpatient tracking, ICU telemetry units, emergency triage admission, and bed turnover matrix.</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Emergency Code Buttons */}
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#1e40af', color: '#ffffff', fontWeight: '800' }}
            onClick={() => triggerEmergencyCode('blue', 'CODE BLUE', 'blue', 'Cardiac Arrest / Resuscitation Protocol STAT')}
          >
            🚨 Code Blue
          </button>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#b91c1c', color: '#ffffff', fontWeight: '800' }}
            onClick={() => triggerEmergencyCode('red', 'CODE RED', 'red', 'Mass Trauma / Critical ER Intake Protocol')}
          >
            🔴 Code Red
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchBeds();
              fetchStats();
            }}
          >
            <RefreshCw size={14} /> Refresh Grid
          </button>
        </div>
      </div>

      {/* Ward Metric Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Beds In Inventory</span>
              <span className="stat-value">{stats.totalBeds}</span>
              <span className="stat-subtext">Across 4 facility floors</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfeff', color: '#0e7490' }}>
              <BedDouble size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Available for Admission</span>
              <span className="stat-value" style={{ color: '#059669' }}>{stats.availableBeds}</span>
              <span className="stat-subtext">Ready for patient assignment</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Occupied Inpatients</span>
              <span className="stat-value" style={{ color: '#dc2626' }}>{stats.occupiedBeds}</span>
              <span className="stat-subtext">{stats.occupancyRate}% Overall Occupancy</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <Activity size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Sanitizing / Turnover</span>
              <span className="stat-value" style={{ color: '#d97706' }}>{stats.maintenanceBeds}</span>
              <span className="stat-subtext">Under clinical hygiene protocol</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
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
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <Activity size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#0891b2' }} />
          <p>Loading Ward Matrix & Live Bed Telemetry...</p>
        </div>
      ) : beds.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No beds found for this ward filter.
        </div>
      ) : viewMode === 'floorplan' ? (
        /* Floorplan Grouped View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(wardsGrouped).map(([wardName, wardBeds]) => (
            <div key={wardName} className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BedDouble size={20} color="#0891b2" />
                  <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem', margin: 0 }}>
                    {wardName} Wing
                  </h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#ecfeff', color: '#0e7490', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                    {wardBeds.length} Beds
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
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
                      backgroundColor: '#0891b2',
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
                        ID: <strong>{p.patientId}</strong> • Age: {p.age}y • {p.gender}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.725rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '999px', fontWeight: '800', flexShrink: 0 }}>
                    🩸 {p.bloodGroup}
                  </span>
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
                        {doc.specialty} • Room: {doc.roomNumber || 'OPD-101'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
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
              ✓ Confirm Admission
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
        style={{
          borderRadius: '16px',
          boxShadow: isOccupied ? '0 4px 14px rgba(220, 38, 38, 0.12)' : '0 4px 14px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div className="bed-card-header">
          <span className="bed-number" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BedDouble size={18} color="#0891b2" />
            <span>{bed.bedNumber}</span>
          </span>
          <StatusBadge status={bed.status} />
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {bed.wardType} • {bed.floor} (Room {bed.roomNumber || '101'})
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0e7490' }}>
          ₹{bed.dailyRate} / Day Rate
        </div>

        {isOccupied && bed.currentPatient ? (
          <div className="bed-patient-info" style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '0.75rem', border: '1px solid #fee2e2' }}>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{bed.currentPatient.name}</span>
              <span style={{ fontSize: '0.6875rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                {bed.currentPatient.bloodGroup}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              Patient ID: <strong>{bed.currentPatient.patientId}</strong> • Age: {bed.currentPatient.age}y
            </div>
            {bed.attendingDoctor && (
              <div style={{ fontSize: '0.7rem', color: '#0891b2', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Stethoscope size={11} /> Dr: {bed.attendingDoctor?.user?.name}
              </div>
            )}
            {bed.notes && (
              <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '4px', fontStyle: 'italic', lineHeight: '1.2' }}>
                "{bed.notes}"
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              fontSize: '0.75rem',
              color: isAvailable ? '#059669' : '#d97706',
              padding: '0.6rem',
              background: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {isAvailable ? '✓ Ready for Inpatient Admission' : '⚠️ Sanitation & Linen Turnover'}
          </div>
        )}

        {isStaff && (
          <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
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
                className="btn btn-danger btn-sm"
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
