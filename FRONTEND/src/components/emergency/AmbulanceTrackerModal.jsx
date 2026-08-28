import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  Siren,
  MapPin,
  Clock,
  Phone,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Plus,
  Send,
  Navigation,
  Shield,
  Zap,
} from 'lucide-react';

export const AmbulanceTrackerModal = ({ isOpen, onClose }) => {
  const toast = useToast();

  const [fleet, setFleet] = useState([
    {
      id: 'AMB-01',
      unitName: 'Critical Care ICU Unit Alpha',
      driver: 'Paramedic Marcus Bell',
      phone: '+1 (555) 911-0101',
      status: 'On Mission',
      location: '4th Avenue & Grand Plaza',
      eta: '4 mins',
      patientOnBoard: 'John Carter (Acute Coronary Syndrome)',
      equipment: 'Ventilator, Defibrillator, Advanced Cardiac Life Support',
    },
    {
      id: 'AMB-02',
      unitName: 'Rapid Response Trauma Unit Bravo',
      driver: 'Paramedic Lisa Chen, EMT-P',
      phone: '+1 (555) 911-0102',
      status: 'En Route',
      location: 'Expressway Exit 14 - Mile 28',
      eta: '7 mins',
      patientOnBoard: 'Multiple Trauma (Motor Vehicle Collision)',
      equipment: 'Trauma Splints, Oxygen System, Hemostatic Dressings',
    },
    {
      id: 'AMB-03',
      unitName: 'Mobile Ambulance Unit Charlie',
      driver: 'Paramedic Robert Vance',
      phone: '+1 (555) 911-0103',
      status: 'Available at Base',
      location: 'CarePulse Central ER Bay 1',
      eta: 'Standby',
      patientOnBoard: 'None (Ready for Immediate Dispatch)',
      equipment: 'Standard BLS Kit, Suction Unit, Stretcher',
    },
    {
      id: 'AMB-04',
      unitName: 'Pediatric & Neonatal Transport Delta',
      driver: 'Paramedic Sarah Connor, RN',
      phone: '+1 (555) 911-0104',
      status: 'Available at Base',
      location: 'CarePulse Central ER Bay 2',
      eta: 'Standby',
      patientOnBoard: 'None (Ready for Dispatch)',
      equipment: 'Neonatal Transport Incubator, Pediatric Monitor',
    },
  ]);

  const [dispatchForm, setDispatchForm] = useState({
    unitId: 'AMB-03',
    patientName: '',
    pickupLocation: '',
    emergencyType: 'Cardiac Emergency',
    priority: 'CODE RED - STAT',
  });

  const handleDispatch = (e) => {
    e.preventDefault();
    if (!dispatchForm.patientName || !dispatchForm.pickupLocation) {
      return toast.warning('Please enter patient name and pickup location');
    }

    setFleet((prev) =>
      prev.map((unit) => {
        if (unit.id === dispatchForm.unitId) {
          return {
            ...unit,
            status: 'Dispatched En Route',
            location: dispatchForm.pickupLocation,
            eta: '5 mins',
            patientOnBoard: `${dispatchForm.patientName} (${dispatchForm.emergencyType})`,
          };
        }
        return unit;
      })
    );

    toast.error(`🚨 AMBULANCE DISPATCHED: ${dispatchForm.unitId} rolling to ${dispatchForm.pickupLocation}!`);
    setDispatchForm({
      unitId: 'AMB-04',
      patientName: '',
      pickupLocation: '',
      emergencyType: 'Cardiac Emergency',
      priority: 'CODE RED - STAT',
    });
  };

  const getStatusStyle = (status) => {
    if (status.includes('On Mission') || status.includes('Dispatched')) {
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
    }
    if (status.includes('En Route')) {
      return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
    }
    return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚑 Emergency Ambulance Fleet & GPS Dispatch Radar"
      maxWidth="980px"
    >
      <div>
        {/* Live Dispatch Radar Map Simulation */}
        <div
          style={{
            position: 'relative',
            height: '180px',
            borderRadius: '16px',
            backgroundColor: '#040d21',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 0 30px rgba(6, 182, 212, 0.1)',
          }}
        >
          {/* Animated GPS Radar Circles */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              transform: 'translate(-50%, -50%)',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              transform: 'translate(-50%, -50%)',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              border: '1px dashed rgba(6, 182, 212, 0.3)',
              pointerEvents: 'none',
            }}
          />

          {/* Radar Scanner Sweep Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              width: '130px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #22d3ee)',
              transformOrigin: '0 0',
              animation: 'spin 4s linear infinite',
              pointerEvents: 'none',
            }}
          />

          {/* Radar Header */}
          <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#67e8f9', letterSpacing: '0.08em' }}>
                Live GPS Telemetry Active
              </span>
            </div>
            <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#ffffff' }}>
              Emergency Fleet Radar • 4 Active Units
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Average Metropolitan Hospital Transit Time: <strong>5.4 Minutes</strong>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '1rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Available Units</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>
                {fleet.filter((f) => f.status.includes('Available')).length}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Active In Transit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#f59e0b' }}>
                {fleet.filter((f) => !f.status.includes('Available')).length}
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Grid & Dispatch Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '1.25rem' }}>
          {/* Left: Active Fleet Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
            {fleet.map((unit) => {
              const statusStyle = getStatusStyle(unit.status);
              return (
                <div
                  key={unit.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Siren size={16} color="#0891b2" />
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{unit.unitName}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({unit.id})</span>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      ● {unit.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.35rem' }}>
                    <div><strong>Paramedic:</strong> {unit.driver}</div>
                    <div><strong>Contact:</strong> {unit.phone}</div>
                    <div><strong>Current Location:</strong> {unit.location}</div>
                    <div><strong>ETA to Hospital:</strong> <span style={{ color: '#0891b2', fontWeight: '800' }}>{unit.eta}</span></div>
                  </div>

                  {unit.patientOnBoard && (
                    <div style={{ fontSize: '0.7rem', color: '#0f172a', backgroundColor: '#f8fafc', padding: '0.35rem 0.5rem', borderRadius: '6px', marginTop: '0.4rem', border: '1px solid #f1f5f9' }}>
                      <strong>Patient / Mission:</strong> {unit.patientOnBoard}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Rapid Dispatch Form */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="#dc2626" />
              <span>Rapid Emergency Dispatch</span>
            </div>

            <form onSubmit={handleDispatch}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Available Unit</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8125rem' }}
                  value={dispatchForm.unitId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, unitId: e.target.value })}
                >
                  {fleet.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} - {f.unitName} ({f.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Patient Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Robert Smith"
                  style={{ fontSize: '0.8125rem' }}
                  value={dispatchForm.patientName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, patientName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Pickup GPS Location / Address *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 52 Oakridge Blvd, Sector 9"
                  style={{ fontSize: '0.8125rem' }}
                  value={dispatchForm.pickupLocation}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, pickupLocation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Emergency Triage Type</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8125rem' }}
                  value={dispatchForm.emergencyType}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, emergencyType: e.target.value })}
                >
                  <option value="Cardiac Emergency">Cardiac Emergency / STEMI</option>
                  <option value="Severe Trauma / MVC">Severe Trauma / Accident</option>
                  <option value="Acute Stroke / Neurological">Acute Stroke / Neurological</option>
                  <option value="Respiratory Failure">Respiratory Failure / Asthma</option>
                  <option value="Maternity Emergency">Maternity Emergency / Labor</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-danger"
                style={{ width: '100%', padding: '0.75rem', fontWeight: '800', justifyContent: 'center' }}
              >
                <Siren size={16} /> 🚨 Dispatch Ambulance Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};
