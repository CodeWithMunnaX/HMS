const mongoose = require('mongoose');

const MedicineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g. "500mg"
  frequency: { type: String, required: true }, // e.g. "1-0-1 (After Food)"
  duration: { type: String, required: true }, // e.g. "5 Days"
  instructions: { type: String, default: 'Take with plenty of water' },
});

const VitalsSchema = new mongoose.Schema({
  bloodPressure: { type: String, default: '120/80 mmHg' },
  heartRate: { type: String, default: '72 bpm' },
  temperature: { type: String, default: '98.6 °F' },
  spO2: { type: String, default: '99%' },
  weight: { type: String, default: '70 kg' },
  height: { type: String, default: '175 cm' },
});

const PrescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
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
    vitals: {
      type: VitalsSchema,
      default: () => ({}),
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
    },
    symptomsObserved: {
      type: [String],
      default: [],
    },
    medicines: [MedicineItemSchema],
    labTestsRecommended: {
      type: [String],
      default: [],
    },
    dietaryAdvice: {
      type: String,
      default: 'Eat balanced meals, avoid oily foods and stay hydrated.',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    attachments: [
      {
        title: String,
        url: String,
        publicId: String,
      },
    ],
    dispenseStatus: {
      type: String,
      enum: ['Pending', 'Dispensed', 'Partially Dispensed'],
      default: 'Pending',
    },
    dispensedAt: {
      type: Date,
    },
    dispensedBy: {
      type: String,
      default: '',
    },
    pharmacyNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);
