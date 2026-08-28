import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { aiService } from '../../services/api';
import { Modal } from '../common/Modal';
import {
  UploadCloud,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Eye,
  RefreshCw,
  FolderOpen,
  Stethoscope,
  Microscope,
  FileText,
} from 'lucide-react';

export const AiScanAnalyzerModal = ({ isOpen, onClose, defaultScanUrl = null, patient = null }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Preset Sample Medical Scans for 1-Click Instant Testing
  const sampleScans = [
    {
      name: 'Sample 1: Chest Radiograph (Pneumonia)',
      category: 'Chest X-Ray (PA / Lateral View)',
      notes: '45-year-old male with persistent productive cough, mild fever, and localized right lower lobe crackles.',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Chest_Xray_PA_3-8-2010.png/600px-Chest_Xray_PA_3-8-2010.png',
    },
    {
      name: 'Sample 2: Orthopedic Skeletal X-Ray',
      category: 'Orthopedic Skeletal X-Ray (Limb / Joint)',
      notes: '28-year-old patient with acute wrist pain and swelling following sports injury fall onto outstretched hand.',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Colles_fracture_AP_and_lateral.jpg/600px-Colles_fracture_AP_and_lateral.jpg',
    },
    {
      name: 'Sample 3: Cranial CT Diagnostic Scan',
      category: 'Brain CT / Cranial Diagnostic Imaging',
      notes: '62-year-old presenting with acute headache, transient disorientation, and mild facial asymmetry.',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Ct-scan_of_brain.jpg/600px-Ct-scan_of_brain.jpg',
    },
  ];

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(defaultScanUrl || sampleScans[0].url);
  const [scanCategory, setScanCategory] = useState(sampleScans[0].category);
  const [clinicalNotes, setClinicalNotes] = useState(sampleScans[0].notes);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (defaultScanUrl) {
      setPreviewUrl(defaultScanUrl);
      setSelectedFile(null);
      setReportData(null);
    } else if (!previewUrl) {
      setPreviewUrl(sampleScans[0].url);
      setScanCategory(sampleScans[0].category);
      setClinicalNotes(sampleScans[0].notes);
    }
  }, [defaultScanUrl, isOpen]);

  const handlePickSample = (sample) => {
    setSelectedFile(null);
    setPreviewUrl(sample.url);
    setScanCategory(sample.category);
    setClinicalNotes(sample.notes);
    setReportData(null);
    toast.info(`Loaded ${sample.name}`);
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setReportData(null);
      toast.success(`Loaded file: ${file.name}`);
    } else {
      toast.warning('Please select a valid image file (JPG, PNG, WebP)');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!previewUrl && !selectedFile) {
      return toast.warning('Please upload an image or choose one of the sample scans');
    }

    try {
      setAnalyzing(true);
      let res;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('scanFile', selectedFile);
        formData.append('scanCategory', scanCategory);
        formData.append('clinicalNotes', clinicalNotes);
        if (patient?._id) formData.append('patientId', patient._id);

        res = await aiService.analyzeScan(formData);
      } else {
        res = await aiService.analyzeScanJson({
          fileUrl: previewUrl,
          scanCategory,
          clinicalNotes,
          patientId: patient?._id || null,
        });
      }

      if (res.success && res.data?.report) {
        setReportData(res.data.report);
        toast.success('Clinical Diagnostic Evaluation completed successfully!');
      } else {
        toast.error(res.message || 'Analysis failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete Diagnostic Scan Analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyFindingsToClipboard = () => {
    if (!reportData) return;
    const text = `CLINICAL DIAGNOSTIC SCAN REPORT
Modality: ${reportData.modality}
Status: ${reportData.severity} (Confidence: ${reportData.confidenceScore})
Primary Diagnostic Impression: ${reportData.primaryImpression}

Key Radiological Findings:
${reportData.keyFindings?.map((f) => `• ${f}`).join('\n')}

Recommended Clinical Steps:
${reportData.recommendedActions?.map((a) => `• ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success('Clinical report copied to clipboard!');
  };

  const getSeverityStyle = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s.includes('critical')) {
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
    }
    if (s.includes('moderate')) {
      return { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
    }
    if (s.includes('mild')) {
      return { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' };
    }
    return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔬 Clinical Diagnostic Scan Analyzer"
      maxWidth="940px"
    >
      <div>
        {/* Hidden File Input Triggered by Click */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Sample Scan Pickers */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#0e7490',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Microscope size={14} color="#0891b2" />
            <span>Preset Clinical Diagnostic Studies:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {sampleScans.map((s, idx) => {
              const isSelected = previewUrl === s.url && !selectedFile;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickSample(s)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? '700' : '600',
                    textAlign: 'left',
                    backgroundColor: isSelected ? '#ecfeff' : '#ffffff',
                    border: isSelected ? '2px solid #0891b2' : '1px solid #e2e8f0',
                    color: isSelected ? '#0e7490' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(8, 145, 178, 0.2)' : 'none',
                  }}
                >
                  <Activity size={14} color={isSelected ? '#0891b2' : '#64748b'} />
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Upload & Controls + Live Preview & Diagnostic Results */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Image Viewer & Inputs */}
          <div>
            {/* Clickable & Draggable Scan Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                position: 'relative',
                height: '240px',
                borderRadius: '16px',
                backgroundColor: '#0b1329',
                border: isDragOver ? '2px solid #0891b2' : '2px dashed rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Click to choose a file from your computer or drag & drop"
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Medical Diagnostic Scan"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  {analyzing && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(14, 116, 144, 0.55)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <Activity size={42} className="animate-spin" style={{ marginBottom: '0.75rem', color: '#67e8f9' }} />
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                        Analyzing Clinical Scan...
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '4px' }}>
                        Evaluating anatomical structures & tissue markers
                      </div>
                    </div>
                  )}
                  {/* Click to change badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      pointerEvents: 'none',
                    }}
                  >
                    📁 Click to select file
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', pointerEvents: 'none' }}>
                  <UploadCloud size={44} style={{ margin: '0 auto 0.5rem auto', color: '#0891b2' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
                    Click here to upload medical scan
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                    or drag and drop JPG, PNG, X-Ray
                  </p>
                </div>
              )}
            </div>

            {/* Direct Clickable Button to Open File Dialog */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FolderOpen size={14} /> 📁 Upload Patient Scan (X-Ray, CT, MRI)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Imaging Modality</label>
              <select
                className="form-select"
                value={scanCategory}
                onChange={(e) => setScanCategory(e.target.value)}
              >
                <option value="Chest X-Ray (PA / Lateral View)">Chest X-Ray (PA / Lateral View)</option>
                <option value="Orthopedic Skeletal X-Ray (Limb / Joint)">Orthopedic Skeletal X-Ray (Limb / Joint)</option>
                <option value="Brain CT / Cranial Diagnostic Imaging">Brain CT / Cranial Diagnostic Imaging</option>
                <option value="Spine MRI / Musculoskeletal">Spine MRI / Musculoskeletal</option>
                <option value="Abdominal Ultrasound / Sonogram">Abdominal Ultrasound / Sonogram</option>
                <option value="Dermatology / Skin Lesion Imaging">Dermatology / Skin Lesion Imaging</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Context & Symptoms</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter patient symptoms or reason for study..."
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Processing Diagnostic Analysis...
                </>
              ) : (
                <>
                  <Microscope size={18} /> Run Diagnostic Analysis
                </>
              )}
            </button>
          </div>

          {/* Right Column: Clinical Analysis Report */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '540px',
              overflowY: 'auto',
            }}
          >
            {reportData ? (
              <div>
                {/* Header with Severity Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                      Diagnostic Impression
                    </span>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                      {reportData.modality}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      backgroundColor: getSeverityStyle(reportData.severity).bg,
                      color: getSeverityStyle(reportData.severity).text,
                      border: `1px solid ${getSeverityStyle(reportData.severity).border}`,
                    }}
                  >
                    ● {reportData.severity}
                  </span>
                </div>

                {/* Primary Impression */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    🩺 Clinical Finding Summary:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: '600', lineHeight: '1.4' }}>
                    {reportData.primaryImpression}
                  </div>
                </div>

                {/* Key Radiological Findings */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    🔍 Key Anatomical Findings:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {reportData.keyFindings?.map((finding, i) => (
                      <li key={i}>{finding}</li>
                    ))}
                  </ul>
                </div>

                {/* Differential Diagnoses */}
                {reportData.differentialDiagnoses?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      📋 Differential Diagnoses:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {reportData.differentialDiagnoses.map((d, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#0e7490',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    ✅ Recommended Clinical Next Steps:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#047857', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {reportData.recommendedActions?.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={copyFindingsToClipboard}
                  >
                    <Copy size={13} /> Copy Findings
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => window.print()}
                  >
                    <Printer size={13} /> Print Diagnostic Report
                  </button>
                </div>

                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
                  ⚠️ {reportData.disclaimer}
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  textAlign: 'center',
                  padding: '2rem 1rem',
                }}
              >
                <FileSearch size={48} style={{ color: '#0891b2', marginBottom: '0.75rem', opacity: 0.6 }} />
                <h4 style={{ color: '#334155', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Clinical Radiology Diagnostic Center
                </h4>
                <p style={{ fontSize: '0.8125rem', maxWidth: '300px', lineHeight: '1.4' }}>
                  The chest radiograph is loaded on the left. Click <strong>Run Diagnostic Analysis</strong> to evaluate!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
