const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  verifyQrPrescription,
  dispensePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, getPrescriptions);
router.post('/verify-qr', protect, verifyQrPrescription);
router.post('/:id/dispense', protect, authorize('Admin', 'Doctor', 'Receptionist'), dispensePrescription);
router.get('/:id', protect, getPrescriptionById);
router.post('/', protect, authorize('Admin', 'Doctor'), createPrescription);

module.exports = router;
