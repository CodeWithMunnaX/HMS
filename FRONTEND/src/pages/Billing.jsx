import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { billingService, patientService, doctorService } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Receipt,
  Plus,
  Printer,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';

export const Billing = () => {
  const { user, isStaff, isAdmin, isPatient } = useAuth();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Create Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    patientId: '',
    doctorId: '',
    items: [
      { category: 'Consultation', description: 'Clinical Consultation Fee', quantity: 1, unitPrice: 60 },
    ],
    discountPercent: 0,
    taxPercent: 5,
    paidAmount: 0,
    paymentMethod: 'Credit Card',
    notes: 'Thank you for choosing CarePulse Hospital.',
  });

  // Record Payment Modal
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    fetchInvoices();
    if (!isPatient) {
      fetchFinancialStats();
      fetchMetadata();
    }
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await billingService.getInvoices(params);
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const res = await billingService.getStats();
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

  const addItemRow = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { category: 'Lab Test', description: '', quantity: 1, unitPrice: 0 },
      ],
    }));
  };

  const removeItemRow = (index) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...invoiceForm.items];
    updated[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    setInvoiceForm((prev) => ({ ...prev, items: updated }));
  };

  // Calculations
  const subTotal = invoiceForm.items.reduce(
    (acc, curr) => acc + (curr.quantity || 0) * (curr.unitPrice || 0),
    0
  );
  const discountAmount = (subTotal * Number(invoiceForm.discountPercent)) / 100;
  const taxable = subTotal - discountAmount;
  const taxAmount = (taxable * Number(invoiceForm.taxPercent)) / 100;
  const computedTotal = Math.round((taxable + taxAmount) * 100) / 100;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceForm.patientId) {
      return toast.warning('Please select a patient for this invoice');
    }

    try {
      const res = await billingService.createInvoice(invoiceForm);
      if (res.success) {
        toast.success(`Invoice ${res.data.invoiceNumber} created!`);
        setIsCreateModalOpen(false);
        setInvoiceForm({
          patientId: '',
          doctorId: '',
          items: [{ category: 'Consultation', description: 'Clinical Consultation Fee', quantity: 1, unitPrice: 60 }],
          discountPercent: 0,
          taxPercent: 5,
          paidAmount: 0,
          paymentMethod: 'Credit Card',
          notes: 'Thank you for choosing CarePulse Hospital.',
        });
        fetchInvoices();
        fetchFinancialStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate invoice');
    }
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      return toast.warning('Please enter a valid payment amount');
    }

    try {
      const res = await billingService.recordPayment(payModalInvoice._id, {
        amount: Number(paymentAmount),
        paymentMethod,
      });
      if (res.success) {
        toast.success('Payment recorded successfully');
        setPayModalInvoice(null);
        setPaymentAmount('');
        fetchInvoices();
        fetchFinancialStats();
      }
    } catch (err) {
      toast.error(err.message || 'Payment recording failed');
    }
  };

  const filtered = invoices.filter((inv) => {
    const invNum = inv.invoiceNumber || '';
    const patName = inv.patient?.name || '';
    const term = search.toLowerCase();
    return invNum.toLowerCase().includes(term) || patName.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h1>Billing, Invoices & Financial Accounts</h1>
          <p>Itemized hospital invoicing, insurance claim adjustments, and transaction ledger.</p>
        </div>
        {(isStaff || isAdmin) && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        )}
      </div>

      {/* Financial Overview Metrics */}
      {!isPatient && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Realized Revenue</span>
              <span className="stat-value" style={{ color: '#059669' }}>
                ₹{stats.totalRevenue.toLocaleString()}
              </span>
              <span className="stat-subtext">Settled payments</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>₹</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Billed Receivables</span>
              <span className="stat-value">₹{stats.totalBilled.toLocaleString()}</span>
              <span className="stat-subtext">{stats.totalInvoices} Invoices Issued</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfeff', color: '#0e7490' }}>
              <Receipt size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Outstanding Balance</span>
              <span className="stat-value" style={{ color: '#dc2626' }}>
                ₹{stats.pendingBalance.toLocaleString()}
              </span>
              <span className="stat-subtext">{stats.breakdown?.unpaid || 0} Unpaid / Partial</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
              <Clock size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Settlement Rate</span>
              <span className="stat-value" style={{ color: '#0891b2' }}>
                {stats.totalBilled > 0
                  ? Math.round((stats.totalRevenue / stats.totalBilled) * 100)
                  : 100}
                %
              </span>
              <span className="stat-subtext">Cash & Insurance</span>
            </div>
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Invoice # (INV-2026-xxxxx) or Patient Name..."
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
              <option value="">All Payment States</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Date Issued</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th>Payment Status</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  Loading financial records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No invoices found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv._id}>
                  <td>
                    <strong style={{ color: '#0e7490' }}>{inv.invoiceNumber}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{inv.patient?.name || 'Patient'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.patient?.patientId}</div>
                  </td>
                  <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                  <td>
                    <strong style={{ fontSize: '0.9375rem' }}>₹{inv.totalAmount}</strong>
                  </td>
                  <td style={{ color: '#059669', fontWeight: '600' }}>₹{inv.paidAmount}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: '700',
                        color: inv.balanceAmount > 0 ? '#dc2626' : '#059669',
                      }}
                    >
                      ₹{inv.balanceAmount}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={inv.paymentStatus} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem' }}>{inv.paymentMethod}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <Printer size={13} /> View Receipt
                      </button>

                      {(isStaff || isAdmin) && inv.balanceAmount > 0 && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setPayModalInvoice(inv);
                            setPaymentAmount(inv.balanceAmount);
                          }}
                        >
                          <CreditCard size={13} /> Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Itemized Medical Invoice"
        maxWidth="780px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-select"
                required
                value={invoiceForm.patientId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, patientId: e.target.value })}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patientId}) - Insurance: {p.insuranceProvider}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Consulting Doctor</label>
              <select
                className="form-select"
                value={invoiceForm.doctorId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, doctorId: e.target.value })}
              >
                <option value="">-- Optional: Link Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0 0.5rem 0' }}>
            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0e7490' }}>
              Itemized Charges & Services
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItemRow}>
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          {invoiceForm.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 2.5fr 1fr 1fr auto',
                gap: '0.5rem',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <select
                className="form-select"
                value={item.category}
                onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
              >
                <option value="Consultation">Consultation</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Room / Bed">Room / Bed</option>
                <option value="Medicines">Medicines</option>
                <option value="Surgery / Procedure">Procedure</option>
                <option value="Nursing / Care">Nursing</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                className="form-input"
                required
                value={item.description}
                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                className="form-input"
                value={item.quantity}
                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Price (₹)"
                className="form-input"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
              />
              {invoiceForm.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  style={{ color: '#ef4444', padding: '0.4rem', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {/* Pricing & Calculations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div>
              <div className="form-group">
                <label className="form-label">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={invoiceForm.discountPercent}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, discountPercent: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount Paid Right Now (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={invoiceForm.paidAmount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paidAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={invoiceForm.paymentMethod}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                >
                  <option value="UPI / Online">UPI / Online</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Health Insurance">Health Insurance</option>
                </select>
              </div>
            </div>

            <div className="invoice-summary-box" style={{ margin: 0, width: '100%' }}>
              <div className="invoice-summary-row">
                <span>Subtotal:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row">
                <span>Discount ({invoiceForm.discountPercent}%):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row">
                <span>Tax ({invoiceForm.taxPercent}%):</span>
                <span>+₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row invoice-summary-total">
                <span>Grand Total:</span>
                <span>₹{computedTotal.toFixed(2)}</span>
              </div>
              <div className="invoice-summary-row" style={{ color: '#059669', fontWeight: '600' }}>
                <span>Paid Now:</span>
                <span>₹{Number(invoiceForm.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div
                className="invoice-summary-row"
                style={{
                  color: Math.max(0, computedTotal - Number(invoiceForm.paidAmount || 0)) > 0 ? '#dc2626' : '#059669',
                  fontWeight: '700',
                }}
              >
                <span>Balance Due:</span>
                <span>
                  ₹{Math.max(0, computedTotal - Number(invoiceForm.paidAmount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate & Save Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!payModalInvoice}
        onClose={() => setPayModalInvoice(null)}
        title={`Record Payment for ${payModalInvoice?.invoiceNumber || ''}`}
        maxWidth="480px"
      >
        {payModalInvoice && (
          <form onSubmit={handleRecordPaymentSubmit}>
            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div>Patient: <strong>{payModalInvoice.patient?.name}</strong></div>
              <div>Total Invoice: <strong>₹{payModalInvoice.totalAmount}</strong></div>
              <div style={{ color: '#dc2626' }}>
                Outstanding Balance: <strong>₹{payModalInvoice.balanceAmount}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount (₹) *</label>
              <input
                type="number"
                min="1"
                max={payModalInvoice.balanceAmount}
                step="any"
                required
                className="form-input"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI / Online">UPI / Online</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Health Insurance">Health Insurance</option>
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPayModalInvoice(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Payment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Official Printable Invoice Sheet Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Official Hospital Billing Receipt"
        maxWidth="800px"
      >
        {selectedInvoice && (
          <div>
            <div className="invoice-sheet">
              <div className="rx-header">
                <div>
                  <div className="rx-hospital-title">CarePulse Hospital</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    100 Clinical Way, Health District • GSTIN: 27AACCC8821R1Z8
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0e7490', fontSize: '1.25rem' }}>
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </div>
                  <StatusBadge status={selectedInvoice.paymentStatus} />
                </div>
              </div>

              <div className="rx-patient-bar">
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Billed To:</span>
                  <div style={{ fontWeight: '700' }}>{selectedInvoice.patient?.name}</div>
                  <div style={{ fontSize: '0.75rem' }}>{selectedInvoice.patient?.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID:</span>
                  <div>{selectedInvoice.patient?.patientId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Insurance:</span>
                  <div>{selectedInvoice.patient?.insuranceProvider || 'Self Pay'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Payment Mode:</span>
                  <div>{selectedInvoice.paymentMethod}</div>
                </div>
              </div>

              <table className="custom-table" style={{ marginBottom: '1.5rem' }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.description}</strong></td>
                      <td>{item.category}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.unitPrice}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-summary-box">
                <div className="invoice-summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedInvoice.subTotal}</span>
                </div>
                <div className="invoice-summary-row">
                  <span>Discount ({selectedInvoice.discountPercent}%):</span>
                  <span>
                    -₹
                    {((selectedInvoice.subTotal * selectedInvoice.discountPercent) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="invoice-summary-row">
                  <span>Tax ({selectedInvoice.taxPercent}%):</span>
                  <span>
                    +₹
                    {(
                      ((selectedInvoice.subTotal -
                        (selectedInvoice.subTotal * selectedInvoice.discountPercent) / 100) *
                        selectedInvoice.taxPercent) /
                      100
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="invoice-summary-row invoice-summary-total">
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoice.totalAmount}</span>
                </div>
                <div className="invoice-summary-row" style={{ color: '#059669', fontWeight: '700' }}>
                  <span>Total Paid:</span>
                  <span>₹{selectedInvoice.paidAmount}</span>
                </div>
                <div
                  className="invoice-summary-row"
                  style={{
                    color: selectedInvoice.balanceAmount > 0 ? '#dc2626' : '#059669',
                    fontWeight: '800',
                  }}
                >
                  <span>Balance Due:</span>
                  <span>₹{selectedInvoice.balanceAmount}</span>
                </div>
              </div>

              <div style={{ marginTop: '2rem', fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
                {selectedInvoice.notes} • Computer-generated legal tax invoice.
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} /> Print Hospital Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
