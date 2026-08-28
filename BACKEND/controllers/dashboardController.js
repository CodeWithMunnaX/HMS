const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');

// @desc    Get dashboard metrics tailored by role
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user?.role || 'Admin';

    // Start of today and end of today
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    if (role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      const doctorId = doctorProfile?._id;

      const [todayAppointments, totalAppointments, completedAppointments, prescriptionsCount] =
        await Promise.all([
          Appointment.find({
            doctor: doctorId,
            appointmentDate: { $gte: startOfToday, $lte: endOfToday },
          })
            .populate('patient', 'name patientId phone age gender bloodGroup')
            .sort({ tokenNumber: 1 }),
          Appointment.countDocuments({ doctor: doctorId }),
          Appointment.countDocuments({ doctor: doctorId, status: 'Completed' }),
          Prescription.countDocuments({ doctor: doctorId }),
        ]);

      return res.json({
        success: true,
        data: {
          role: 'Doctor',
          todayQueue: todayAppointments,
          metrics: {
            todayCount: todayAppointments.length,
            totalAppointments,
            completedAppointments,
            prescriptionsCount,
            experienceYears: doctorProfile?.experienceYears || 5,
            rating: doctorProfile?.rating || 4.9,
          },
        },
      });
    }

    if (role === 'Patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      const patientId = patientProfile?._id;

      const [myAppointments, myPrescriptions, myInvoices] = await Promise.all([
        Appointment.find({ patient: patientId })
          .populate({
            path: 'doctor',
            populate: { path: 'user', select: 'name avatar' },
          })
          .sort({ appointmentDate: -1 })
          .limit(5),
        Prescription.find({ patient: patientId })
          .populate({
            path: 'doctor',
            populate: { path: 'user', select: 'name' },
          })
          .sort({ createdAt: -1 })
          .limit(5),
        Invoice.find({ patient: patientId }).sort({ issueDate: -1 }).limit(5),
      ]);

      const unpaidInvoices = myInvoices.filter((i) => i.paymentStatus !== 'Paid');
      const pendingBalance = unpaidInvoices.reduce((acc, i) => acc + i.balanceAmount, 0);

      return res.json({
        success: true,
        data: {
          role: 'Patient',
          patient: patientProfile,
          myAppointments,
          myPrescriptions,
          myInvoices,
          metrics: {
            totalVisits: myAppointments.length,
            activePrescriptions: myPrescriptions.length,
            pendingBillsCount: unpaidInvoices.length,
            pendingBalance,
          },
        },
      });
    }

    // Default: Admin and Receptionist view
    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      totalBeds,
      occupiedBeds,
      recentAppointments,
      invoices,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: 'Occupied' }),
      Appointment.find()
        .populate('patient', 'name patientId')
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name avatar' },
        })
        .sort({ createdAt: -1 })
        .limit(6),
      Invoice.find({}),
    ]);

    const totalRevenue = invoices.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
    const pendingRevenue = invoices.reduce((acc, curr) => acc + (curr.balanceAmount || 0), 0);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return res.json({
      success: true,
      data: {
        role: role,
        metrics: {
          totalPatients,
          totalDoctors,
          todayAppointments,
          totalBeds,
          occupiedBeds,
          occupancyRate,
          totalRevenue,
          pendingRevenue,
        },
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
