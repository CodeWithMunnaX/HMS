const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointment,
  getAvailableSlots,
} = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/slots/:doctorId', getAvailableSlots);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.post('/', protect, bookAppointment);
router.put('/:id', protect, updateAppointment);

module.exports = router;
