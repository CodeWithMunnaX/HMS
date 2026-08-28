const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors with filters
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res, next) => {
  try {
    const { specialty, department, search } = req.query;
    let query = {};

    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    let doctors = await Doctor.find(query).populate('user', 'name email phone avatar status department');

    if (search) {
      doctors = doctors.filter((doc) => {
        const docName = doc.user?.name || '';
        const docSpec = doc.specialty || '';
        const docDept = doc.department || '';
        const term = search.toLowerCase();
        return (
          docName.toLowerCase().includes(term) ||
          docSpec.toLowerCase().includes(term) ||
          docDept.toLowerCase().includes(term)
        );
      });
    }

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar status department');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      avatar,
      avatarPublicId,
      specialty,
      qualifications,
      experienceYears,
      department,
      consultationFee,
      biography,
      roomNumber,
      availableDays,
      availableTimeSlots,
    } = req.body;

    // Create base user
    const user = await User.create({
      name,
      email,
      password: password || 'Doctor@123',
      role: 'Doctor',
      phone: phone || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      avatarPublicId: avatarPublicId || '',
      department: department || 'General Medicine',
    });

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialty,
      qualifications: qualifications || ['MBBS', 'MD'],
      experienceYears: experienceYears || 5,
      department: department || 'General Medicine',
      consultationFee: consultationFee || 60,
      biography: biography || '',
      roomNumber: roomNumber || 'OPD-101',
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableTimeSlots: availableTimeSlots || [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
      ],
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar department status');

    res.status(201).json({
      success: true,
      data: populatedDoctor,
      message: 'Doctor created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor details
// @route   PUT /api/doctors/:id
// @access  Private (Admin, Doctor)
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Update doctor specific fields
    const allowedFields = [
      'specialty',
      'qualifications',
      'experienceYears',
      'department',
      'consultationFee',
      'biography',
      'roomNumber',
      'availableDays',
      'availableTimeSlots',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    await doctor.save();

    // If name or phone or avatar provided, update user model
    if (req.body.name || req.body.phone || req.body.avatar) {
      await User.findByIdAndUpdate(doctor.user, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.phone && { phone: req.body.phone }),
        ...(req.body.avatar && { avatar: req.body.avatar }),
        ...(req.body.avatarPublicId && { avatarPublicId: req.body.avatarPublicId }),
      });
    }

    const updated = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar department status');

    res.json({
      success: true,
      data: updated,
      message: 'Doctor profile updated',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specialties & departments list
// @route   GET /api/doctors/meta/specialties
// @access  Public
const getSpecialties = async (req, res, next) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    const departments = await Doctor.distinct('department');
    res.json({
      success: true,
      data: {
        specialties,
        departments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getSpecialties,
};
