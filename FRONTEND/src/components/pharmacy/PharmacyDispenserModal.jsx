import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { prescriptionService } from '../../services/api';
import { Modal } from '../common/Modal';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Pill,
  Clock,
  User,
  Stethoscope,
  ShieldCheck,
  RefreshCw,
  PackageCheck,
  FileCheck,
  ScanLine,
} from 'lucide-react';

export const PharmacyDispenserModal = ({ isOpen, onClose, defaultRxId = null }) => {
  const toast = useToast();

  const [qrInput, setQrInput] = useState(defaultRxId || '');
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [pharmacistName, setPharmacistName] = useState('Pharmacist Elena Vance');
  const [pharmacyNotes, setPharmacyNotes] = useState('Standard hospital blister packaging. Patient counseled on dosage.');
  const [checkedMeds, setCheckedMeds] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadRecentPrescriptions();
      if (defaultRxId) {
        setQrInput(defaultRxId);
        handleVerify(defaultRxId);
      }
    }
  }, [isOpen, defaultRxId]);

  const loadRecentPrescriptions = async () => {
    try {
      const res = await prescriptionService.getAll();
      if (res.success && res.data) {
        setRecentPrescriptions(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load recent prescriptions for pharmacy dispenser', err);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const query = codeToVerify || qrInput;
    if (!query || !query.trim()) {
      return toast.warning('Please enter a Prescription ID or scan a QR code');
    }

    try {
      setLoading(true);
      const res = await prescriptionService.verifyQr({ qrData: query.trim() });
      if (res.success && res.data) {
        setPrescription(res.data);
        // Initialize all meds as checked for convenience
        const initialChecked = {};
        res.data.medicines?.forEach((_, idx) => {
          initialChecked[idx] = true;
        });
        setCheckedMeds(initialChecked);
        toast.success(`Verified: ${res.data.prescriptionId} (${res.data.patient?.name})`);
      } else {
        toast.error(res.message || 'Prescription not found');
        setPrescription(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to verify prescription with hospital registry');
      setPrescription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMed = (index) => {
    setCheckedMeds((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDispense = async () => {
    if (!prescription) return;

    try {
      setDispensing(true);
      const res = await prescriptionService.dispense(prescription._id, {
        pharmacistName,
        pharmacyNotes,
      });

      if (res.success && res.data) {
        setPrescription(res.data);
        toast.success(`🎉 Medications successfully dispensed for ${res.data.prescriptionId}!`);
        loadRecentPrescriptions();
      } else {
        toast.error(res.message || 'Failed to dispense medications');
      }
    } catch (err) {
      toast.error(err.message || 'Error executing pharmacy dispensation');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="💊 Pharmacy QR Prescription Dispenser & Verification"
      maxWidth="920px"
    >
      <div>
        {/* Quick-Scan Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #042f2e 0%, #0f172a 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            padding: '1.25rem',
            color: '#ffffff',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ScanLine size={20} color="#2dd4bf" />
              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ccfbf1' }}>
                Scan or Enter Digital Prescription QR Code
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(20, 184, 166, 0.2)', color: '#2dd4bf', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '700' }}>
              ● Pharmacy Live Registry Connected
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <QrCode size={18} color="#14b8a6" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Scan QR or enter Prescription ID (e.g. RX-05001 or CAREPULSE-VERIFIED-RX-...)"
                style={{
                  paddingLeft: '2.5rem',
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(20, 184, 166, 0.4)',
                  color: '#ffffff',
                }}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ backgroundColor: '#0d9488', borderColor: '#0f766e', minWidth: '130px' }}
              onClick={() => handleVerify()}
              disabled={loading}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Verify RX</span>
            </button>
          </div>

          {/* Quick-Pills of recent prescriptions */}
          {recentPrescriptions.length > 0 && (
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>⚡ Quick Test:</span>
              {recentPrescriptions.map((rx) => (
                <button
                  key={rx._id}
                  type="button"
                  onClick={() => {
                    setQrInput(rx.prescriptionId);
                    handleVerify(rx.prescriptionId);
                  }}
                  style={{
                    backgroundColor: rx.dispenseStatus === 'Dispensed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: rx.dispenseStatus === 'Dispensed' ? '1px solid #10b981' : '1px solid #f59e0b',
                    color: rx.dispenseStatus === 'Dispensed' ? '#34d399' : '#fbbf24',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {rx.prescriptionId} ({rx.patient?.name}) • {rx.dispenseStatus || 'Pending'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Result & Fulfillment Area */}
        {prescription ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.25rem' }}>
            {/* Left: Patient info & Medication Checklist */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              {/* Status Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                    Prescription ID
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f766e' }}>
                    {prescription.prescriptionId}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: prescription.dispenseStatus === 'Dispensed' ? '#ecfdf5' : '#fffbeb',
                    color: prescription.dispenseStatus === 'Dispensed' ? '#059669' : '#d97706',
                    border: prescription.dispenseStatus === 'Dispensed' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                  }}
                >
                  {prescription.dispenseStatus === 'Dispensed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  <span>{prescription.dispenseStatus === 'Dispensed' ? 'DISPENSED & FULFILLED' : 'READY TO DISPENSE'}</span>
                </div>
              </div>

              {/* Patient Bar */}
              <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div><strong>Patient:</strong> {prescription.patient?.name} ({prescription.patient?.patientId})</div>
                <div><strong>Age/Gender:</strong> {prescription.patient?.age}y / {prescription.patient?.gender}</div>
                <div><strong>Attending Doctor:</strong> {prescription.doctor?.user?.name || 'Dr. Sarah Jenkins'}</div>
                <div><strong>Diagnosis:</strong> {prescription.diagnosis}</div>
              </div>

              {/* Allergies Warning */}
              {prescription.patient?.allergies?.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.6rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.8rem' }}>
                  <AlertTriangle size={16} />
                  <span><strong>Known Allergies:</strong> {prescription.patient.allergies.join(', ')}</span>
                </div>
              )}

              {/* Medicines Checklist */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pill size={14} color="#0d9488" />
                  <span>Medications to Dispense ({prescription.medicines?.length || 0}):</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {prescription.medicines?.map((m, idx) => {
                    const isChecked = !!checkedMeds[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleMed(idx)}
                        style={{
                          backgroundColor: isChecked ? '#f0fdfa' : '#ffffff',
                          border: isChecked ? '1px solid #5eead4' : '1px solid #e2e8f0',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMed(idx)}
                          style={{ marginTop: '3px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0d9488' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{m.name}</strong>
                            <span style={{ backgroundColor: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#334155' }}>
                              {m.dosage}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            Freq: <strong>{m.frequency}</strong> • Duration: <strong>{m.duration}</strong>
                          </div>
                          {m.instructions && (
                            <div style={{ fontSize: '0.7rem', color: '#0d9488', marginTop: '2px' }}>
                              📝 {m.instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Dispensing Controls & Official QR Proof */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent('CAREPULSE-VERIFIED-RX-' + prescription.prescriptionId + '-' + prescription.patient?.name)}`}
                    alt="Prescription QR Code"
                    style={{ width: '90px', height: '90px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '3px', backgroundColor: '#ffffff', margin: '0 auto' }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    Authentic Hospital Pharmacy Token
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dispensing Pharmacist</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pharmacistName}
                    onChange={(e) => setPharmacistName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pharmacy Dispensing Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={pharmacyNotes}
                    onChange={(e) => setPharmacyNotes(e.target.value)}
                    placeholder="Instructions given to patient..."
                  />
                </div>

                {prescription.dispenseStatus === 'Dispensed' && (
                  <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', color: '#065f46', marginBottom: '1rem' }}>
                    <div><strong>Dispensed On:</strong> {new Date(prescription.dispensedAt || Date.now()).toLocaleString()}</div>
                    <div><strong>Dispensed By:</strong> {prescription.dispensedBy}</div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    backgroundColor: prescription.dispenseStatus === 'Dispensed' ? '#059669' : '#0d9488',
                    borderColor: '#0f766e',
                  }}
                  onClick={handleDispense}
                  disabled={dispensing || prescription.dispenseStatus === 'Dispensed'}
                >
                  {dispensing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Dispensing Medications...
                    </>
                  ) : prescription.dispenseStatus === 'Dispensed' ? (
                    <>
                      <CheckCircle2 size={16} /> Prescription Already Dispensed
                    </>
                  ) : (
                    <>
                      <PackageCheck size={18} /> ✓ Confirm & Dispense Medications
                    </>
                  )}
                </button>
              </div>

              {/* Print Receipt Button */}
              <div style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> 🖨️ Print Pharmacy Dispense Slip
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            <Pill size={44} color="#14b8a6" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.35rem' }}>
              Hospital Pharmacy QR Dispenser & Verification Desk
            </h4>
            <p style={{ fontSize: '0.875rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: '1.5', color: '#475569' }}>
              When a doctor writes a prescription in <strong>Doctor Portal (E-Prescription Studio)</strong>, a tamper-proof digital <strong>QR Code</strong> is generated. Enter the <strong>Prescription ID</strong> (e.g. <code>RX-50001</code>) or click below to verify!
            </p>

            {/* 3 Step Workflow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', maxWidth: '640px', margin: '0 auto 1.5rem auto', textAlign: 'left' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490', marginBottom: '4px' }}>1. Doctor Prescribes</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Doctor issues RX in Clinical Studio with dosage & duration.</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490', marginBottom: '4px' }}>2. Patient Brings QR</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient shows QR code on mobile or printed summary.</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490', marginBottom: '4px' }}>3. Pharmacist Dispenses</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pharmacy scans QR, checks inventory & fulfills medicines.</div>
              </div>
            </div>

            {/* Instant 1-Click Sample Test Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: '#0d9488', borderColor: '#0f766e' }}
                onClick={() => {
                  setQrInput('RX-50001');
                  handleVerify('RX-50001');
                }}
              >
                ⚡ 1-Click Test: Load Sample RX-50001 (Alex Johnson)
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
