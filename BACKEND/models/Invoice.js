const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Consultation', 'Lab Test', 'Room / Bed', 'Medicines', 'Surgery / Procedure', 'Nursing / Care', 'Other'],
    default: 'Consultation',
  },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    items: [InvoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    taxPercent: {
      type: Number,
      default: 5,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Unpaid'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI / Online', 'Health Insurance', 'Pending'],
      default: 'Pending',
    },
    insuranceClaimDetails: {
      provider: String,
      claimId: String,
      approvedAmount: Number,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    notes: {
      type: String,
      default: 'Thank you for choosing CarePulse Hospital.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Invoice', InvoiceSchema);
