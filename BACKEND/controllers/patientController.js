const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const MedicalFile = require('../models/MedicalFile');

// @desc    Get all patients with search & filter
// @route   GET /api/patients
// @access  Private (Admin, Doctor, Receptionist)
const getAllPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, admissionStatus } = req.query;
    let query = {};

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (admissionStatus) {
      query.admissionStatus = admissionStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query)
      .populate('currentBed', 'bedNumber wardType roomNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('currentBed', 'bedNumber wardType roomNumber dailyRate')
      .populate('user', 'avatar email');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist, Doctor)
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      allergies,
      chronicConditions,
      insuranceProvider,
      policyNumber,
      admissionStatus,
    } = req.body;

    const count = await Patient.countDocuments();
    const patientId = `PAT-${String(count + 101).padStart(4, '0')}`;

    const patient = await Patient.create({
      patientId,
      name,
      age,
      gender,
      bloodGroup: bloodGroup || 'Unknown',
      phone,
      email: email || '',
      address: address || 'Not specified',
      emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      insuranceProvider: insuranceProvider || 'Self Pay',
      policyNumber: policyNumber || '',
      admissionStatus: admissionStatus || 'Outpatient',
    });

    res.status(201).json({
      success: true,
      data: patient,
      message: 'Patient registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient record
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res, next) => {
  try {
    let patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: patient,
      message: 'Patient details updated',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete medical history timeline for a patient
// @route   GET /api/patients/:id/history
// @access  Private
const getPatientHistory = async (req, res, next) => {
  try {
    const patientId = req.params.id;

    const [patient, appointments, prescriptions, invoices, medicalFiles] = await Promise.all([
      Patient.findById(patientId),
      Appointment.find({ patient: patientId })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name avatar' },
        })
        .sort({ appointmentDate: -1 }),
      Prescription.find({ patient: patientId })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name avatar specialty' },
        })
        .sort({ createdAt: -1 }),
      Invoice.find({ patient: patientId }).sort({ issueDate: -1 }),
      MedicalFile.find({ patient: patientId }).sort({ createdAt: -1 }),
    ]);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: {
        patient,
        appointments,
        prescriptions,
        invoices,
        medicalFiles,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getPatientHistory,
};
