const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS', 'MD'],
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 50,
    },
    biography: {
      type: String,
      default: 'Experienced medical specialist dedicated to evidence-based healthcare and patient wellness.',
    },
    roomNumber: {
      type: String,
      default: 'OPD-101',
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableTimeSlots: {
      type: [String],
      default: [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
      ],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalPatientsTreated: {
      type: Number,
      default: 120,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
