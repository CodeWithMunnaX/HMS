const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      unique: true,
      required: true,
    },
    wardType: {
      type: String,
      enum: ['General Ward', 'Semi-Private', 'Private Deluxe', 'ICU', 'NICU', 'Emergency Room'],
      required: true,
    },
    floor: {
      type: String,
      default: '1st Floor',
    },
    roomNumber: {
      type: String,
      default: '101',
    },
    dailyRate: {
      type: Number,
      required: true,
      default: 150,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Sanitizing / Maintenance', 'Reserved'],
      default: 'Available',
    },
    currentPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    attendingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    admittedAt: {
      type: Date,
      default: null,
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

module.exports = mongoose.model('Bed', BedSchema);
