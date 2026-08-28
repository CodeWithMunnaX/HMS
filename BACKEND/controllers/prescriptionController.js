const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Get all prescriptions (filtered by doctor/patient)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.query;
    let query = {};

    if (req.user && req.user.role === 'Doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc) query.doctor = doc._id;
    } else if (req.user && req.user.role === 'Patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) query.patient = pat._id;
    }

    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'patientId name age gender phone bloodGroup allergies')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new digital prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor, Admin)
const createPrescription = async (req, res, next) => {
  try {
    let {
      appointmentId,
      patientId,
      doctorId,
      vitals,
      diagnosis,
      symptomsObserved,
      medicines,
      labTestsRecommended,
      dietaryAdvice,
      doctorNotes,
      followUpDate,
      attachments,
    } = req.body;

    // If doctor is creating it, auto-resolve their Doctor profile
    if (req.user && req.user.role === 'Doctor' && !doctorId) {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc) doctorId = doc._id;
    }

    const count = await Prescription.countDocuments();
    const prescriptionId = `RX-${String(count + 5001).padStart(5, '0')}`;

    const prescription = await Prescription.create({
      prescriptionId,
      appointment: appointmentId || null,
      patient: patientId,
      doctor: doctorId,
      vitals: vitals || {},
      diagnosis,
      symptomsObserved: symptomsObserved || [],
      medicines: medicines || [],
      labTestsRecommended: labTestsRecommended || [],
      dietaryAdvice: dietaryAdvice || 'Maintain regular diet and hydration.',
      doctorNotes: doctorNotes || '',
      followUpDate: followUpDate || null,
      attachments: attachments || [],
    });

    // If linked to an appointment, mark appointment as completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'Completed',
        consultationNotes: diagnosis,
      });
    }

    const populated = await Prescription.findById(prescription._id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Prescription created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and fetch prescription from scanned QR Code or Prescription ID
// @route   POST /api/prescriptions/verify-qr
// @access  Private (Pharmacy, Staff, Doctor, Admin)
const verifyQrPrescription = async (req, res, next) => {
  try {
    const { qrData, code } = req.body;
    const input = qrData || code || '';

    if (!input.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide QR code text or Prescription ID' });
    }

    // Extract prescription identifier (e.g. RX-05001 or RX-50001)
    const match = input.match(/RX-\d+/i);
    let prescription = null;

    if (match) {
      const rxId = match[0].toUpperCase();
      prescription = await Prescription.findOne({ prescriptionId: rxId })
        .populate('patient')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email phone avatar' },
        })
        .populate('appointment');
    }

    // Fallback: search by Mongo ID or exact string
    if (!prescription) {
      prescription = await Prescription.findOne({
        $or: [
          { prescriptionId: input.trim().toUpperCase() },
          { _id: input.length === 24 ? input : null },
        ],
      })
        .populate('patient')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name email phone avatar' },
        })
        .populate('appointment');
    }

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: `No matching prescription found for code: "${input}". Please verify the QR code.`,
      });
    }

    res.json({
      success: true,
      data: prescription,
      message: 'Prescription verified successfully with Hospital Registry',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispense medications for a prescription
// @route   POST /api/prescriptions/:id/dispense
// @access  Private (Pharmacy, Staff, Admin)
const dispensePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pharmacyNotes, pharmacistName } = req.body;

    const prescription = await Prescription.findById(id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' },
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.dispenseStatus = 'Dispensed';
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = pharmacistName || req.user?.name || 'CarePulse Central Pharmacy';
    if (pharmacyNotes) prescription.pharmacyNotes = pharmacyNotes;

    await prescription.save();

    res.json({
      success: true,
      data: prescription,
      message: `Medications for ${prescription.prescriptionId} marked as Dispensed by ${prescription.dispensedBy}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  verifyQrPrescription,
  dispensePrescription,
};
