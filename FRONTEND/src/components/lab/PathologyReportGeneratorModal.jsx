import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  FileText,
  Printer,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Microscope,
  Stethoscope,
  Sparkles,
  RefreshCw,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export const PathologyReportGeneratorModal = ({ isOpen, onClose, defaultPatient = null }) => {
  const toast = useToast();

  const [panelType, setPanelType] = useState('CBC');
  const [patientName, setPatientName] = useState(defaultPatient?.name || 'Alex Johnson');
  const [patientId, setPatientId] = useState(defaultPatient?.patientId || 'PAT-1001');
  const [ageGender, setAgeGender] = useState('34y / Male');
  const [referringDoctor, setReferringDoctor] = useState('Dr. Sarah Jenkins (Cardiology)');
  const [pathologistName, setPathologistName] = useState('Dr. Marcus Vance, MD (Chief Clinical Pathologist)');

  // Preset Lab Test Templates
  const labPanels = {
    CBC: {
      name: 'Complete Blood Count (CBC with Differential)',
      items: [
        { test: 'Hemoglobin (Hb)', value: '11.2', unit: 'g/dL', normalMin: 13.5, normalMax: 17.5, category: 'Hematology' },
        { test: 'Total Leukocyte Count (WBC)', value: '12800', unit: '/mcL', normalMin: 4500, normalMax: 11000, category: 'Hematology' },
        { test: 'Platelet Count', value: '145000', unit: '/mcL', normalMin: 150000, normalMax: 450000, category: 'Hematology' },
        { test: 'Red Blood Cell (RBC) Count', value: '4.1', unit: 'million/mcL', normalMin: 4.5, normalMax: 5.9, category: 'Hematology' },
        { test: 'Packed Cell Volume (Hematocrit)', value: '34.5', unit: '%', normalMin: 41.0, normalMax: 50.0, category: 'Hematology' },
        { test: 'Mean Corpuscular Volume (MCV)', value: '82.0', unit: 'fL', normalMin: 80.0, normalMax: 100.0, category: 'Hematology' },
      ],
      remarks: 'Microcytic mild anemia with reactive leukocytosis. Correlate with clinical inflammatory markers.',
    },
    LIPID: {
      name: 'Comprehensive Lipid & Cardiovascular Profile',
      items: [
        { test: 'Total Cholesterol', value: '242', unit: 'mg/dL', normalMin: 125, normalMax: 200, category: 'Biochemistry' },
        { test: 'Triglycerides', value: '198', unit: 'mg/dL', normalMin: 50, normalMax: 150, category: 'Biochemistry' },
        { test: 'HDL (Good Cholesterol)', value: '38', unit: 'mg/dL', normalMin: 40, normalMax: 60, category: 'Biochemistry' },
        { test: 'LDL (Bad Cholesterol)', value: '164', unit: 'mg/dL', normalMin: 0, normalMax: 100, category: 'Biochemistry' },
        { test: 'Fasting Blood Glucose', value: '118', unit: 'mg/dL', normalMin: 70, normalMax: 99, category: 'Biochemistry' },
        { test: 'HbA1c (Glycated Hemoglobin)', value: '6.2', unit: '%', normalMin: 4.0, normalMax: 5.6, category: 'Biochemistry' },
      ],
      remarks: 'Dyslipidemia with impaired fasting glycemia (Prediabetes stage). Dietary lifestyle modification recommended.',
    },
    LFT_KFT: {
      name: 'Hepatic Liver & Renal Function Panel (LFT/KFT)',
      items: [
        { test: 'Serum Creatinine', value: '1.05', unit: 'mg/dL', normalMin: 0.7, normalMax: 1.3, category: 'Renal' },
        { test: 'Blood Urea Nitrogen (BUN)', value: '16', unit: 'mg/dL', normalMin: 7, normalMax: 20, category: 'Renal' },
        { test: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', normalMin: 0.2, normalMax: 1.2, category: 'Hepatic' },
        { test: 'SGOT / AST', value: '32', unit: 'U/L', normalMin: 10, normalMax: 40, category: 'Hepatic' },
        { test: 'SGPT / ALT', value: '36', unit: 'U/L', normalMin: 7, normalMax: 56, category: 'Hepatic' },
        { test: 'Serum Albumin', value: '4.2', unit: 'g/dL', normalMin: 3.5, normalMax: 5.0, category: 'Hepatic' },
      ],
      remarks: 'Renal and hepatic biomarker parameters are completely within normal physiological limits.',
    },
  };

  const [currentTestItems, setCurrentTestItems] = useState(labPanels.CBC.items);
  const [reportRemarks, setReportRemarks] = useState(labPanels.CBC.remarks);

  const handleSwitchPanel = (panelKey) => {
    setPanelType(panelKey);
    setCurrentTestItems(labPanels[panelKey].items);
    setReportRemarks(labPanels[panelKey].remarks);
    toast.info(`Loaded ${labPanels[panelKey].name}`);
  };

  const handleItemValueChange = (index, newValue) => {
    const updated = [...currentTestItems];
    updated[index].value = newValue;
    setCurrentTestItems(updated);
  };

  const getItemStatus = (item) => {
    const num = parseFloat(item.value);
    if (isNaN(num)) return { label: 'NORMAL', color: '#059669', bg: '#ecfdf5' };
    if (num > item.normalMax) return { label: 'HIGH ▲', color: '#dc2626', bg: '#fef2f2' };
    if (num < item.normalMin) return { label: 'LOW ▼', color: '#0284c7', bg: '#f0f9ff' };
    return { label: 'NORMAL', color: '#059669', bg: '#ecfdf5' };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔬 Smart Pathology & Laboratory Report Generator"
      maxWidth="920px"
    >
      <div>
        {/* Quick Panel Switcher */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0891b2', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Microscope size={15} />
            <span>Select Clinical Pathology Panel:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
            {[
              { key: 'CBC', label: '1. Complete Blood Count (CBC)', sub: 'Hemoglobin, Platelets, WBC' },
              { key: 'LIPID', label: '2. Lipid & Diabetic Panel', sub: 'Cholesterol, HbA1c, Fasting Glucose' },
              { key: 'LFT_KFT', label: '3. Liver & Kidney Panel', sub: 'Creatinine, BUN, Bilirubin, SGPT' },
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                className={`btn ${panelType === p.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.6rem 0.85rem' }}
                onClick={() => handleSwitchPanel(p.key)}
              >
                <div style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.6875rem', opacity: 0.85 }}>{p.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Official Printable Pathology Document View */}
        <div
          className="rx-document"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0891b2', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f766e', letterSpacing: '-0.02em' }}>
                CarePulse Diagnostic Pathology Institute
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Accredited Clinical Pathology & Automated Biomarker Laboratory • ISO 15189 Certified
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490' }}>
                LAB REF: #LP-88429
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Patient Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              backgroundColor: '#f8fafc',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Patient Name:</span>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>{patientName}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Patient ID:</span>
              <div style={{ fontWeight: '600' }}>{patientId}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Age / Gender:</span>
              <div>{ageGender}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Referred By:</span>
              <div style={{ color: '#0891b2', fontWeight: '600' }}>{referringDoctor}</div>
            </div>
          </div>

          {/* Panel Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {labPanels[panelType].name}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Specimen: Venous Blood (EDTA / Serum)</span>
          </div>

          {/* Biomarkers Table */}
          <table className="custom-table" style={{ fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th>Test Parameter</th>
                <th>Observed Value</th>
                <th>Unit</th>
                <th>Biological Reference Range</th>
                <th>Diagnostic Flag</th>
              </tr>
            </thead>
            <tbody>
              {currentTestItems.map((item, idx) => {
                const status = getItemStatus(item);
                return (
                  <tr key={idx}>
                    <td>
                      <strong>{item.test}</strong>
                    </td>
                    <td style={{ width: '130px' }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          color: status.color,
                        }}
                        value={item.value}
                        onChange={(e) => handleItemValueChange(idx, e.target.value)}
                      />
                    </td>
                    <td style={{ color: '#64748b' }}>{item.unit}</td>
                    <td style={{ color: '#475569', fontWeight: '600' }}>
                      {item.normalMin} - {item.normalMax} {item.unit}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: status.bg,
                          color: status.color,
                          border: `1px solid ${status.color}33`,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Remarks */}
          <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              🔬 Pathologist Clinical Impression & Interpretations:
            </div>
            <textarea
              className="form-textarea"
              rows="2"
              value={reportRemarks}
              onChange={(e) => setReportRemarks(e.target.value)}
              style={{ fontSize: '0.8125rem' }}
            />
          </div>

          {/* Footer with QR Code and Pathologist Digital Seal */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('CAREPULSE-LAB-REPORT-VERIFIED-' + patientId + '-' + panelType)}`}
                alt="Verified Lab QR"
                style={{ width: '65px', height: '65px', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '2px' }}
              />
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase' }}>
                  Digitally Verified Biomarker Panel
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Laboratory Information System (LIS) Integrated
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  border: '2px solid #0d9488',
                  borderRadius: '8px',
                  padding: '0.35rem 0.75rem',
                  marginBottom: '0.35rem',
                  backgroundColor: 'rgba(13, 148, 136, 0.05)',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: '800', textTransform: 'uppercase' }}>
                  ✓ Validated by Clinical Pathologist
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>{pathologistName}</div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Laboratory License: LAB-9921-PATH • CarePulse Diagnostics</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.print();
              toast.success('Pathology report queued for printing!');
            }}
          >
            <Printer size={15} /> Print Official Pathology Report
          </button>
        </div>
      </div>
    </Modal>
  );
};
