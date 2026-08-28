const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'carepulse_hms_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (default Patient or by Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, specialty } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Patient',
      phone: phone || '',
      department: department || 'General',
    });

    // If registered as Patient, create associated Patient profile
    if (user.role === 'Patient') {
      const patientCount = await Patient.countDocuments();
      const patientId = `PAT-${String(patientCount + 101).padStart(4, '0')}`;
      await Patient.create({
        user: user._id,
        patientId: patientId,
        name: user.name,
        age: req.body.age || 30,
        gender: req.body.gender || 'Male',
        phone: user.phone || '555-0199',
        email: user.email,
        bloodGroup: req.body.bloodGroup || 'O+',
      });
    }

    // If registered as Doctor
    if (user.role === 'Doctor') {
      await Doctor.create({
        user: user._id,
        specialty: specialty || 'General Medicine',
        department: department || 'General Medicine',
        consultationFee: req.body.consultationFee || 60,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        token,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check user exists (include password for verification)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch linked role profile if doctor or patient
    let doctorProfile = null;
    let patientProfile = null;

    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'Patient') {
      patientProfile = await Patient.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        doctorProfile,
        patientProfile,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let doctorProfile = null;
    let patientProfile = null;

    if (user.role === 'Doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'Patient') {
      patientProfile = await Patient.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        department: user.department,
        doctorProfile,
        patientProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demo pre-configured accounts for 1-click login
// @route   GET /api/auth/demo-users
// @access  Public
const getDemoUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      email: {
        $in: [
          'admin@carepulse.com',
          'sarah.cardio@carepulse.com',
          'reception@carepulse.com',
          'alex.johnson@example.com',
        ],
      },
    }).select('name email role avatar department');

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & avatar
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.avatarPublicId) user.avatarPublicId = req.body.avatarPublicId;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        department: updatedUser.department,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getDemoUsers,
  updateProfile,
};
