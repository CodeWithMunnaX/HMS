const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  getFinancialStats,
} = require('../controllers/billingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/stats', protect, authorize('Admin', 'Receptionist'), getFinancialStats);
router.get('/invoices', protect, getInvoices);
router.get('/invoices/:id', protect, getInvoiceById);
router.post('/invoices', protect, authorize('Admin', 'Receptionist'), createInvoice);
router.put('/invoices/:id/pay', protect, authorize('Admin', 'Receptionist'), recordPayment);

module.exports = router;
