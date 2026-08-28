const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Get all appointments with filters
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, date, department } = req.query;
    let query = {};

    // Role-based scoping if user is Doctor or Patient
    if (req.user && req.user.role === 'Doctor') {
      const doc = await Doctor.findOne({ user: req.user._id });
      if (doc) query.doctor = doc._id;
    } else if (req.user && req.user.role === 'Patient') {
      const pat = await Patient.findOne({ user: req.user._id });
      if (pat) query.patient = pat._id;
    }

    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (status) query.status = status;
    if (department) query.department = department;

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'patientId name age gender phone bloodGroup allergies')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .sort({ appointmentDate: -1, tokenNumber: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
const bookAppointment = async (req, res, next) => {
  try {
    let {
      patientId,
      doctorId,
      department,
      appointmentDate,
      timeSlot,
      type,
      reasonForVisit,
      symptoms,
    } = req.body;

    // If user is a Patient, automatically assign their patient ID
    if (req.user && req.user.role === 'Patient' && !patientId) {
      const pat = await Patient.findOne({ user: req.user._id });
      if (!pat) {
        return res.status(400).json({ success: false, message: 'Patient profile not found for this account' });
      }
      patientId = pat._id;
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appDate = new Date(appointmentDate);
    const startOfDay = new Date(new Date(appDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(appDate).setHours(23, 59, 59, 999));

    // Calculate queue token number for this doctor on this day
    const existingCount = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const tokenNumber = existingCount + 1;
    const totalAppointments = await Appointment.countDocuments();
    const appointmentNumber = `APT-${String(totalAppointments + 1001).padStart(5, '0')}`;

    const appointment = await Appointment.create({
      appointmentNumber,
      patient: patientId,
      doctor: doctorId,
      department: department || doctor.department,
      appointmentDate: appDate,
      timeSlot,
      tokenNumber,
      type: type || 'General Checkup',
      reasonForVisit,
      symptoms: symptoms || [],
      status: 'Scheduled',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name phone patientId')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      });

    res.status(201).json({
      success: true,
      data: populated,
      message: `Appointment booked successfully! Token #${tokenNumber}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status / notes
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const allowedUpdates = ['status', 'consultationNotes', 'paymentStatus', 'timeSlot', 'appointmentDate'];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        appointment[key] = req.body[key];
      }
    });

    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name avatar' },
      });

    res.json({
      success: true,
      data: updated,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's available slots for a specific date
// @route   GET /api/appointments/slots/:doctorId
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const allSlots = doctor.availableTimeSlots || [
      '09:00 AM - 10:00 AM',
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '02:00 PM - 03:00 PM',
      '03:00 PM - 04:00 PM',
      '04:00 PM - 05:00 PM',
    ];

    let bookedSlots = [];
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

      const booked = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'Cancelled' },
      }).select('timeSlot');

      bookedSlots = booked.map((b) => b.timeSlot);
    }

    const slotsWithStatus = allSlots.map((slot) => ({
      slot,
      isAvailable: !bookedSlots.includes(slot),
    }));

    res.json({
      success: true,
      data: slotsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  bookAppointment,
  updateAppointment,
  getAvailableSlots,
};
