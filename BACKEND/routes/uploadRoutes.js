const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadFile,
  getMedicalFiles,
  deleteMedicalFile,
} = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, upload.single('file'), uploadFile);
router.get('/files', protect, getMedicalFiles);
router.delete('/files/:id', protect, deleteMedicalFile);

module.exports = router;
