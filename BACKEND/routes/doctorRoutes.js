const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getSpecialties,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/meta/specialties', getSpecialties);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, authorize('Admin'), createDoctor);
router.put('/:id', protect, authorize('Admin', 'Doctor'), updateDoctor);

module.exports = router;
