import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { uploadService, patientService } from '../services/api';
import { Modal } from '../components/common/Modal';
import { AiScanAnalyzerModal } from '../components/scans/AiScanAnalyzerModal';
import {
  FolderLock,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  Search,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Activity,
} from 'lucide-react';

export const MedicalFiles = () => {
  const { user, isPatient } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected file for zoom view
  const [viewFile, setViewFile] = useState(null);
  const [isAiAnalyzerOpen, setIsAiAnalyzerOpen] = useState(false);
  const [selectedScanUrl, setSelectedScanUrl] = useState(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Lab Report',
    patientId: '',
    notes: '',
  });

  useEffect(() => {
    fetchFiles();
    if (!isPatient) {
      fetchPatients();
    }
  }, [categoryFilter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const res = await uploadService.getFiles(params);
      if (res.success) {
        setFiles(res.data);
      }
    } catch (err) {
      toast.error('Failed to load medical files');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientService.getAll();
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm((prev) => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadForm.title) {
        setUploadForm((prev) => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return toast.warning('Please select a file to upload');
    }

    if (!isPatient && !uploadForm.patientId) {
      return toast.warning('Please select a patient for this document');
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title || selectedFile.name);
      formData.append('category', uploadForm.category);
      formData.append('notes', uploadForm.notes);

      // If user is patient, pass their ID or let backend resolve
      if (!isPatient && uploadForm.patientId) {
        formData.append('patientId', uploadForm.patientId);
      }

      const res = await uploadService.uploadFile(formData);
      if (res.success) {
        toast.success('Document uploaded to Cloudinary Secure Vault!');
        setSelectedFile(null);
        setUploadForm({ title: '', category: 'Lab Report', patientId: '', notes: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this medical file from cloud storage?')) {
      return;
    }

    try {
      const res = await uploadService.deleteFile(fileId);
      if (res.success) {
        toast.success('File deleted from cloud storage');
        fetchFiles();
      }
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const filtered = files.filter((f) => {
    const title = f.title || '';
    const patName = f.patient?.name || '';
    const term = search.toLowerCase();
    return title.toLowerCase().includes(term) || patName.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Cloudinary Medical File Vault & Diagnostic Scans</h1>
          <p>Secure cloud imaging storage for X-Rays, MRI scans, laboratory blood panels, and clinical pathology.</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setSelectedScanUrl(null);
              setIsAiAnalyzerOpen(true);
            }}
          >
            <Activity size={16} /> 🔬 Clinical Scan Diagnostic
          </button>
        </div>
      </div>

      {/* Upload Dropzone Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>
          Upload Medical Scans & Documents (Cloudinary SDK)
        </h3>

        <form onSubmit={handleUploadSubmit}>
          <div
            className="file-upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={38} color="#0891b2" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9375rem' }}>
              {selectedFile ? selectedFile.name : 'Click to browse or drag and drop scans here'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              Supports High-Res Medical JPEG, PNG, DICOM-converted, WebP, and PDF (Max 10MB)
            </div>
            {selectedFile && (
              <div style={{ marginTop: '0.5rem', color: '#059669', fontSize: '0.8125rem', fontWeight: '600' }}>
                ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Chest X-Ray PA View"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scan Category *</label>
              <select
                className="form-select"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              >
                <option value="Lab Report">Lab Report</option>
                <option value="X-Ray / MRI Scan">X-Ray / MRI Scan</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Prescription Copy">Prescription Copy</option>
                <option value="Insurance Doc">Insurance Doc</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {!isPatient && (
              <div className="form-group">
                <label className="form-label">Assign to Patient *</label>
                <select
                  className="form-select"
                  required
                  value={uploadForm.patientId}
                  onChange={(e) => setUploadForm({ ...uploadForm, patientId: e.target.value })}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Clinical Observations / Diagnostic Findings</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bilateral clear lung fields, no active infiltrates observed..."
              value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
              {uploading ? 'Streaming to Cloudinary...' : 'Upload to Cloud Storage'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by file title or patient..."
              className="form-input"
              style={{ paddingLeft: '2.2rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Lab Report">Lab Reports</option>
              <option value="X-Ray / MRI Scan">X-Ray / MRI Scans</option>
              <option value="Discharge Summary">Discharge Summaries</option>
              <option value="Prescription Copy">Prescriptions</option>
              <option value="Insurance Doc">Insurance Docs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medical Files Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading cloud files...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No medical files found. Use the uploader above to store documents to Cloudinary.
        </div>
      ) : (
        <div className="files-grid">
          {filtered.map((file) => (
            <div key={file._id} className="file-card">
              <div className="file-card-preview" onClick={() => setViewFile(file)} style={{ cursor: 'pointer' }}>
                {file.fileFormat?.includes('image') || file.fileUrl?.startsWith('data:image') ? (
                  <img src={file.fileUrl} alt={file.title} />
                ) : (
                  <div style={{ color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={40} color="#38bdf8" />
                    <span style={{ fontSize: '0.75rem' }}>PDF / Document</span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                  }}
                >
                  {file.category}
                </div>
              </div>

              <div className="file-card-details">
                <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Patient: <strong>{file.patient?.name || 'Assigned'}</strong> ({file.patient?.patientId})
                </div>
                {file.notes && (
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    {file.notes}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', gap: '0.4rem' }}>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setViewFile(file)}
                  >
                    <Eye size={13} /> View
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedScanUrl(file.fileUrl);
                      setIsAiAnalyzerOpen(true);
                    }}
                  >
                    <Activity size={13} color="#0891b2" /> 🔬 Analyze
                  </button>

                  <button
                    onClick={() => handleDelete(file._id)}
                    style={{ color: '#ef4444', padding: '0.4rem', cursor: 'pointer' }}
                    title="Delete file"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View File Zoom Modal */}
      <Modal
        isOpen={!!viewFile}
        onClose={() => setViewFile(null)}
        title={viewFile?.title || 'Medical Scan Viewer'}
        maxWidth="800px"
      >
        {viewFile && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: '#0f172a', padding: '1rem', borderRadius: '12px' }}>
              {viewFile.fileFormat?.includes('image') || viewFile.fileUrl?.startsWith('data:image') ? (
                <img
                  src={viewFile.fileUrl}
                  alt={viewFile.title}
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '6px' }}
                />
              ) : (
                <div style={{ padding: '3rem', color: '#ffffff' }}>
                  <FileText size={56} color="#38bdf8" style={{ margin: '0 auto 1rem auto' }} />
                  <p>Document file stored on Cloudinary.</p>
                  <a
                    href={viewFile.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '1rem', display: 'inline-flex' }}
                  >
                    <ExternalLink size={14} /> Open in New Tab
                  </a>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              <div><strong>Category:</strong> {viewFile.category}</div>
              <div><strong>Patient:</strong> {viewFile.patient?.name} ({viewFile.patient?.patientId})</div>
              {viewFile.notes && <div><strong>Observations:</strong> {viewFile.notes}</div>}
              <div><strong>Uploaded At:</strong> {new Date(viewFile.createdAt).toLocaleString()}</div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewFile(null)}>
                Close Viewer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Medical Scan Analyzer Modal */}
      <AiScanAnalyzerModal
        isOpen={isAiAnalyzerOpen}
        onClose={() => {
          setIsAiAnalyzerOpen(false);
          setSelectedScanUrl(null);
        }}
        defaultScanUrl={selectedScanUrl}
      />
    </div>
  );
};
