const mongoose = require('mongoose');

const MedicalFileSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Lab Report', 'X-Ray / MRI Scan', 'Discharge Summary', 'Prescription Copy', 'Insurance Doc', 'Other'],
      default: 'Lab Report',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileFormat: {
      type: String,
      default: 'image/jpeg',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalFile', MedicalFileSchema);
