const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeMedicalScan } = require('../controllers/aiController');

// Multer in-memory storage for handling scan images
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// POST /api/ai/analyze-scan
router.post('/analyze-scan', upload.single('scanFile'), analyzeMedicalScan);

module.exports = router;
