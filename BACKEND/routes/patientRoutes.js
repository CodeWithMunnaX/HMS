const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getPatientHistory,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, authorize('Admin', 'Doctor', 'Receptionist'), getAllPatients);
router.get('/:id', protect, getPatientById);
router.get('/:id/history', protect, getPatientHistory);
router.post('/', protect, authorize('Admin', 'Doctor', 'Receptionist'), createPatient);
router.put('/:id', protect, authorize('Admin', 'Doctor', 'Receptionist'), updatePatient);

module.exports = router;
