const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['General Checkup', 'Follow-up', 'Emergency', 'Specialist Consultation', 'Vaccination'],
      default: 'General Checkup',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Please provide reason for visit'],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    consultationNotes: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Waived'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
