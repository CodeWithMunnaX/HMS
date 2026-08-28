const express = require('express');
const router = express.Router();
const {
  getBeds,
  allocateBed,
  dischargeBed,
  getWardStats,
} = require('../controllers/bedController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/stats', protect, getWardStats);
router.get('/', protect, getBeds);
router.put('/:id/allocate', protect, authorize('Admin', 'Receptionist', 'Doctor'), allocateBed);
router.put('/:id/discharge', protect, authorize('Admin', 'Receptionist', 'Doctor'), dischargeBed);

module.exports = router;
