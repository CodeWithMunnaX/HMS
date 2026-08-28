const Bed = require('../models/Bed');
const Patient = require('../models/Patient');

// @desc    Get all beds with filters
// @route   GET /api/beds
// @access  Private
const getBeds = async (req, res, next) => {
  try {
    const { wardType, status, floor } = req.query;
    let query = {};

    if (wardType) query.wardType = wardType;
    if (status) query.status = status;
    if (floor) query.floor = floor;

    const beds = await Bed.find(query)
      .populate('currentPatient', 'patientId name age gender phone bloodGroup admissionStatus')
      .populate({
        path: 'attendingDoctor',
        populate: { path: 'user', select: 'name department avatar' },
      })
      .sort({ wardType: 1, bedNumber: 1 });

    res.json({
      success: true,
      count: beds.length,
      data: beds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Allocate bed to a patient
// @route   PUT /api/beds/:id/allocate
// @access  Private (Admin, Receptionist, Doctor)
const allocateBed = async (req, res, next) => {
  try {
    const { patientId, doctorId, notes } = req.body;
    const bed = await Bed.findById(req.params.id);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.status === 'Occupied') {
      return res.status(400).json({ success: false, message: `Bed ${bed.bedNumber} is already occupied` });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Update bed
    bed.status = 'Occupied';
    bed.currentPatient = patientId;
    bed.attendingDoctor = doctorId || null;
    bed.admittedAt = new Date();
    if (notes) bed.notes = notes;
    await bed.save();

    // Update patient's current bed & admission status
    patient.currentBed = bed._id;
    patient.admissionStatus = 'Inpatient';
    await patient.save();

    const populated = await Bed.findById(bed._id)
      .populate('currentPatient')
      .populate({
        path: 'attendingDoctor',
        populate: { path: 'user', select: 'name' },
      });

    res.json({
      success: true,
      data: populated,
      message: `Bed ${bed.bedNumber} successfully allocated to ${patient.name}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Discharge patient / free up bed
// @route   PUT /api/beds/:id/discharge
// @access  Private (Admin, Receptionist, Doctor)
const dischargeBed = async (req, res, next) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    if (bed.currentPatient) {
      await Patient.findByIdAndUpdate(bed.currentPatient, {
        currentBed: null,
        admissionStatus: 'Discharged',
      });
    }

    bed.status = 'Available';
    bed.currentPatient = null;
    bed.attendingDoctor = null;
    bed.admittedAt = null;
    await bed.save();

    res.json({
      success: true,
      data: bed,
      message: `Bed ${bed.bedNumber} is now freed and marked Available`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ward statistics & occupancy rate
// @route   GET /api/beds/stats
// @access  Private
const getWardStats = async (req, res, next) => {
  try {
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
    const availableBeds = await Bed.countDocuments({ status: 'Available' });
    const maintenanceBeds = await Bed.countDocuments({ status: 'Sanitizing / Maintenance' });

    const wardBreakdown = await Bed.aggregate([
      {
        $group: {
          _id: '$wardType',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] },
          },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] },
          },
        },
      },
    ]);

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        maintenanceBeds,
        occupancyRate,
        wardBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBeds,
  allocateBed,
  dischargeBed,
  getWardStats,
};
