const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const MedicalFile = require('../models/MedicalFile');

// @desc    Upload single file to Cloudinary (image or pdf)
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const folder = req.body.folder || 'carepulse_hms';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // If patientId is provided, save record to MedicalFile database
    let medicalDoc = null;
    if (req.body.patientId) {
      medicalDoc = await MedicalFile.create({
        patient: req.body.patientId,
        doctor: req.body.doctorId || null,
        title: req.body.title || req.file.originalname,
        category: req.body.category || 'Lab Report',
        fileUrl: result.url,
        cloudinaryPublicId: result.public_id,
        fileSize: result.bytes || req.file.size,
        fileFormat: req.file.mimetype,
        notes: req.body.notes || '',
      });
    }

    res.status(201).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.public_id,
        format: result.format,
        medicalDoc,
      },
      message: 'File uploaded successfully to Cloudinary',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all medical files (with optional patient filter)
// @route   GET /api/upload/files
// @access  Private
const getMedicalFiles = async (req, res, next) => {
  try {
    const { patientId, category } = req.query;
    let query = {};

    if (patientId) query.patient = patientId;
    if (category) query.category = category;

    const files = await MedicalFile.find(query)
      .populate('patient', 'name patientId phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name department' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical file
// @route   DELETE /api/upload/files/:id
// @access  Private
const deleteMedicalFile = async (req, res, next) => {
  try {
    const file = await MedicalFile.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    if (file.cloudinaryPublicId) {
      await deleteFromCloudinary(file.cloudinaryPublicId);
    }

    await file.deleteOne();

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getMedicalFiles,
  deleteMedicalFile,
};
