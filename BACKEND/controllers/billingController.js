const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');

// @desc    Get all invoices with filters
// @route   GET /api/billing/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const { patientId, paymentStatus, search } = req.query;
    let query = {};

    if (req.user && req.user.role === 'Patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) query.patient = pat._id;
    }

    if (patientId) query.patient = patientId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    let invoices = await Invoice.find(query)
      .populate('patient', 'patientId name phone email address')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name department' },
      })
      .sort({ createdAt: -1 });

    if (search) {
      invoices = invoices.filter((inv) => {
        const invNum = inv.invoiceNumber || '';
        const patName = inv.patient?.name || '';
        const term = search.toLowerCase();
        return invNum.toLowerCase().includes(term) || patName.toLowerCase().includes(term);
      });
    }

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/billing/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new invoice
// @route   POST /api/billing/invoices
// @access  Private (Admin, Receptionist)
const createInvoice = async (req, res, next) => {
  try {
    const {
      patientId,
      doctorId,
      items,
      discountPercent = 0,
      taxPercent = 5,
      paidAmount = 0,
      paymentMethod = 'Pending',
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please add at least one line item to invoice' });
    }

    const calculatedItems = items.map((item) => ({
      description: item.description,
      category: item.category || 'Consultation',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const subTotal = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);
    const discount = (subTotal * Number(discountPercent)) / 100;
    const taxable = subTotal - discount;
    const tax = (taxable * Number(taxPercent)) / 100;
    const totalAmount = Math.round((taxable + tax) * 100) / 100;

    const numPaid = Number(paidAmount) || 0;
    const balanceAmount = Math.max(0, totalAmount - numPaid);

    let paymentStatus = 'Unpaid';
    if (numPaid >= totalAmount) {
      paymentStatus = 'Paid';
    } else if (numPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      patient: patientId,
      doctor: doctorId || null,
      items: calculatedItems,
      subTotal,
      discountPercent: Number(discountPercent),
      taxPercent: Number(taxPercent),
      totalAmount,
      paidAmount: numPaid,
      balanceAmount,
      paymentStatus,
      paymentMethod: numPaid > 0 ? paymentMethod : 'Pending',
      notes: notes || 'Thank you for choosing CarePulse Hospital.',
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Invoice generated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment for an invoice
// @route   PUT /api/billing/invoices/:id/pay
// @access  Private (Admin, Receptionist)
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const newPaidAmount = (invoice.paidAmount || 0) + Number(amount);
    invoice.paidAmount = newPaidAmount;
    invoice.balanceAmount = Math.max(0, invoice.totalAmount - newPaidAmount);

    if (invoice.balanceAmount === 0) {
      invoice.paymentStatus = 'Paid';
    } else {
      invoice.paymentStatus = 'Partially Paid';
    }

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    await invoice.save();

    res.json({
      success: true,
      data: invoice,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial summary analytics
// @route   GET /api/billing/stats
// @access  Private (Admin)
const getFinancialStats = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({});

    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const pendingBalance = invoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0);

    const paidCount = invoices.filter((i) => i.paymentStatus === 'Paid').length;
    const partialCount = invoices.filter((i) => i.paymentStatus === 'Partially Paid').length;
    const unpaidCount = invoices.filter((i) => i.paymentStatus === 'Unpaid').length;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBilled,
        pendingBalance,
        totalInvoices: invoices.length,
        breakdown: {
          paid: paidCount,
          partial: partialCount,
          unpaid: unpaidCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  getFinancialStats,
};
