const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Bed = require('../models/Bed');
const MedicalFile = require('../models/MedicalFile');

const seedData = async () => {
  try {
    // Ensure Munna Admin exists
    const existingMunna = await User.findOne({ email: 'munna@gmail.com' });
    if (!existingMunna) {
      await User.create({
        name: 'Munna (Chief Admin)',
        email: 'munna@gmail.com',
        password: 'munna@gmail.com',
        role: 'Admin',
        phone: '+1 (555) 010-9000',
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
        department: 'Hospital Administration',
      });
      console.log('[HMS Seeder]: Admin Munna (munna@gmail.com) created.');
    }

    const userCount = await User.countDocuments();
    if (userCount > 1) {
      console.log('[HMS Seeder]: Data already seeded, skipping auto-seed.');
      return;
    }

    console.log('[HMS Seeder]: Seeding initial clinical data...');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Munna (Chief Admin)',
      email: 'munna@gmail.com',
      password: 'munna@gmail.com',
      role: 'Admin',
      phone: '+1 (555) 010-9000',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
      department: 'Hospital Administration',
    });

    // 2. Create Receptionist / Staff
    const staffUser = await User.create({
      name: 'Emma Watson, RN (Head Reception)',
      email: 'reception@carepulse.com',
      password: 'Staff@123',
      role: 'Receptionist',
      phone: '+1 (555) 010-9001',
      avatar: 'https://images.unsplash.com/photo-1594824813589-9a744c8c7d6c?auto=format&fit=crop&q=80&w=300',
      department: 'Front Desk & Triage',
    });

    // 3. Create Specialist Doctors
    const doctorsData = [
      {
        user: {
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.cardio@carepulse.com',
          password: 'Doctor@123',
          role: 'Doctor',
          phone: '+1 (555) 012-3401',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
          department: 'Cardiology',
        },
        profile: {
          specialty: 'Interventional Cardiology',
          qualifications: ['MD (Cardiology)', 'FACC', 'FSCAI'],
          experienceYears: 12,
          department: 'Cardiology',
          consultationFee: 120,
          biography: 'Specializes in coronary interventions, hypertension management, and non-invasive cardiovascular imaging with over 12 years of clinical expertise.',
          roomNumber: 'Cardio Wing - 204',
          rating: 4.9,
          totalPatientsTreated: 1420,
        },
      },
      {
        user: {
          name: 'Dr. Robert Thorne',
          email: 'robert.neuro@carepulse.com',
          password: 'Doctor@123',
          role: 'Doctor',
          phone: '+1 (555) 012-3402',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
          department: 'Neurology',
        },
        profile: {
          specialty: 'Neurology & Stroke Care',
          qualifications: ['MD (Neurology)', 'DM', 'FAAN'],
          experienceYears: 15,
          department: 'Neurology',
          consultationFee: 150,
          biography: 'Expert in neuro-diagnostics, epilepsy management, migraine therapies, and acute stroke intervention protocols.',
          roomNumber: 'Neuro Suite - 310',
          rating: 4.95,
          totalPatientsTreated: 1890,
        },
      },
      {
        user: {
          name: 'Dr. Elena Rostova',
          email: 'elena.pediatrics@carepulse.com',
          password: 'Doctor@123',
          role: 'Doctor',
          phone: '+1 (555) 012-3403',
          avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
          department: 'Pediatrics',
        },
        profile: {
          specialty: 'Pediatric Care & Neonatology',
          qualifications: ['MD (Pediatrics)', 'FAAP'],
          experienceYears: 9,
          department: 'Pediatrics',
          consultationFee: 85,
          biography: 'Dedicated pediatrician with special focus on newborn developmental tracking, pediatric asthma, and child immunization schedules.',
          roomNumber: 'Pediatric Wing - 105',
          rating: 4.88,
          totalPatientsTreated: 2150,
        },
      },
      {
        user: {
          name: 'Dr. David Kim',
          email: 'david.ortho@carepulse.com',
          password: 'Doctor@123',
          role: 'Doctor',
          phone: '+1 (555) 012-3404',
          avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
          department: 'Orthopedics',
        },
        profile: {
          specialty: 'Orthopedic Surgery & Sports Medicine',
          qualifications: ['MS (Ortho)', 'FAAOS'],
          experienceYears: 11,
          department: 'Orthopedics',
          consultationFee: 110,
          biography: 'Pioneering arthroscopic joint preservation, sports injury rehabilitation, and minimally invasive knee/hip replacements.',
          roomNumber: 'Ortho Pavilion - 215',
          rating: 4.82,
          totalPatientsTreated: 1340,
        },
      },
    ];

    const createdDoctors = [];
    for (const doc of doctorsData) {
      const u = await User.create(doc.user);
      const p = await Doctor.create({
        user: u._id,
        ...doc.profile,
      });
      createdDoctors.push(p);
    }

    // 4. Create Sample Patients
    const patientsData = [
      {
        user: {
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          password: 'Patient@123',
          role: 'Patient',
          phone: '+1 (555) 301-8821',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          patientId: 'PAT-1001',
          name: 'Alex Johnson',
          age: 34,
          gender: 'Male',
          bloodGroup: 'O+',
          phone: '+1 (555) 301-8821',
          email: 'alex.johnson@example.com',
          address: '42 Pine Valley Rd, Seattle, WA',
          emergencyContact: { name: 'Claire Johnson', relation: 'Spouse', phone: '+1 (555) 301-8822' },
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Mild Asthma'],
          insuranceProvider: 'BlueCross Health Guard',
          policyNumber: 'BC-992182-01',
          admissionStatus: 'Outpatient',
        },
      },
      {
        user: {
          name: 'Sophia Martinez',
          email: 'sophia.m@example.com',
          password: 'Patient@123',
          role: 'Patient',
          phone: '+1 (555) 441-2098',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          patientId: 'PAT-1002',
          name: 'Sophia Martinez',
          age: 29,
          gender: 'Female',
          bloodGroup: 'A+',
          phone: '+1 (555) 441-2098',
          email: 'sophia.m@example.com',
          address: '108 Sunnyview Ave, San Francisco, CA',
          emergencyContact: { name: 'Carlos Martinez', relation: 'Father', phone: '+1 (555) 441-2000' },
          allergies: ['Sulfa drugs'],
          chronicConditions: [],
          insuranceProvider: 'Aetna Medicare Choice',
          policyNumber: 'AET-44321-09',
          admissionStatus: 'Outpatient',
        },
      },
      {
        user: {
          name: 'Arthur Pendelton',
          email: 'arthur.p@example.com',
          password: 'Patient@123',
          role: 'Patient',
          phone: '+1 (555) 887-1120',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          patientId: 'PAT-1003',
          name: 'Arthur Pendelton',
          age: 62,
          gender: 'Male',
          bloodGroup: 'B+',
          phone: '+1 (555) 887-1120',
          email: 'arthur.p@example.com',
          address: '77 Heritage Boulevard, Portland, OR',
          emergencyContact: { name: 'Eleanor Pendelton', relation: 'Daughter', phone: '+1 (555) 887-9999' },
          allergies: ['Aspirin'],
          chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
          insuranceProvider: 'United Healthcare Global',
          policyNumber: 'UHC-771120-X',
          admissionStatus: 'Inpatient',
        },
      },
      {
        user: {
          name: 'Emily Chen',
          email: 'emily.chen@example.com',
          password: 'Patient@123',
          role: 'Patient',
          phone: '+1 (555) 662-7711',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        },
        profile: {
          patientId: 'PAT-1004',
          name: 'Emily Chen',
          age: 8,
          gender: 'Female',
          bloodGroup: 'AB+',
          phone: '+1 (555) 662-7711',
          email: 'chen.family@example.com',
          address: '500 Cascade Hills Dr, Bellevue, WA',
          emergencyContact: { name: 'Wei Chen', relation: 'Father', phone: '+1 (555) 662-7712' },
          allergies: [],
          chronicConditions: ['Seasonal Allergies'],
          insuranceProvider: 'Cigna Health Plan',
          policyNumber: 'CIG-998231',
          admissionStatus: 'Outpatient',
        },
      },
    ];

    const createdPatients = [];
    for (const pat of patientsData) {
      const u = await User.create(pat.user);
      const p = await Patient.create({
        user: u._id,
        ...pat.profile,
      });
      createdPatients.push(p);
    }

    // 5. Create Wards and Beds
    const bedsData = [
      { bedNumber: 'ICU-B01', wardType: 'ICU', floor: '3rd Floor', roomNumber: 'ICU-301', dailyRate: 450, status: 'Occupied' },
      { bedNumber: 'ICU-B02', wardType: 'ICU', floor: '3rd Floor', roomNumber: 'ICU-302', dailyRate: 450, status: 'Available' },
      { bedNumber: 'ICU-B03', wardType: 'ICU', floor: '3rd Floor', roomNumber: 'ICU-303', dailyRate: 450, status: 'Sanitizing / Maintenance' },
      { bedNumber: 'EMR-B01', wardType: 'Emergency Room', floor: 'Ground Floor', roomNumber: 'ER-01', dailyRate: 300, status: 'Available' },
      { bedNumber: 'EMR-B02', wardType: 'Emergency Room', floor: 'Ground Floor', roomNumber: 'ER-02', dailyRate: 300, status: 'Available' },
      { bedNumber: 'GEN-101', wardType: 'General Ward', floor: '1st Floor', roomNumber: 'Ward-101', dailyRate: 100, status: 'Available' },
      { bedNumber: 'GEN-102', wardType: 'General Ward', floor: '1st Floor', roomNumber: 'Ward-101', dailyRate: 100, status: 'Available' },
      { bedNumber: 'GEN-103', wardType: 'General Ward', floor: '1st Floor', roomNumber: 'Ward-102', dailyRate: 100, status: 'Available' },
      { bedNumber: 'DEL-201', wardType: 'Private Deluxe', floor: '2nd Floor', roomNumber: 'Suite-201', dailyRate: 280, status: 'Available' },
      { bedNumber: 'DEL-202', wardType: 'Private Deluxe', floor: '2nd Floor', roomNumber: 'Suite-202', dailyRate: 280, status: 'Available' },
    ];

    const createdBeds = [];
    for (const b of bedsData) {
      if (b.bedNumber === 'ICU-B01') {
        b.currentPatient = createdPatients[2]._id; // Arthur Pendelton
        b.attendingDoctor = createdDoctors[0]._id; // Dr. Sarah Jenkins
        b.admittedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      }
      const bedDoc = await Bed.create(b);
      createdBeds.push(bedDoc);

      if (b.bedNumber === 'ICU-B01') {
        await Patient.findByIdAndUpdate(createdPatients[2]._id, { currentBed: bedDoc._id });
      }
    }

    // 6. Create Realistic Appointments
    const appointmentsData = [
      {
        appointmentNumber: 'APT-10001',
        patient: createdPatients[0]._id, // Alex Johnson
        doctor: createdDoctors[0]._id, // Dr. Sarah Jenkins (Cardio)
        department: 'Cardiology',
        appointmentDate: new Date(),
        timeSlot: '09:00 AM - 10:00 AM',
        tokenNumber: 1,
        type: 'Specialist Consultation',
        status: 'In Consultation',
        reasonForVisit: 'Occasional chest tightness and palpitations during high cardio workouts',
        symptoms: ['Chest Tightness', 'Elevated Pulse', 'Shortness of breath'],
        paymentStatus: 'Paid',
      },
      {
        appointmentNumber: 'APT-10002',
        patient: createdPatients[1]._id, // Sophia Martinez
        doctor: createdDoctors[1]._id, // Dr. Robert Thorne (Neuro)
        department: 'Neurology',
        appointmentDate: new Date(),
        timeSlot: '11:00 AM - 12:00 PM',
        tokenNumber: 2,
        type: 'Specialist Consultation',
        status: 'Confirmed',
        reasonForVisit: 'Chronic tension migraines with visual aura affecting work screen time',
        symptoms: ['Migraine', 'Photosensitivity', 'Neck stiffness'],
        paymentStatus: 'Paid',
      },
      {
        appointmentNumber: 'APT-10003',
        patient: createdPatients[3]._id, // Emily Chen
        doctor: createdDoctors[2]._id, // Dr. Elena Rostova (Pediatrics)
        department: 'Pediatrics',
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeSlot: '02:00 PM - 03:00 PM',
        tokenNumber: 1,
        type: 'General Checkup',
        status: 'Scheduled',
        reasonForVisit: 'Routine annual pediatric growth checkup and booster vaccination review',
        symptoms: [],
        paymentStatus: 'Pending',
      },
    ];

    const createdAppointments = [];
    for (const app of appointmentsData) {
      const a = await Appointment.create(app);
      createdAppointments.push(a);
    }

    // 7. Create E-Prescriptions
    await Prescription.create({
      prescriptionId: 'RX-50001',
      appointment: createdAppointments[0]._id,
      patient: createdPatients[0]._id,
      doctor: createdDoctors[0]._id,
      vitals: {
        bloodPressure: '128/84 mmHg',
        heartRate: '78 bpm',
        temperature: '98.4 °F',
        spO2: '99%',
        weight: '74 kg',
        height: '178 cm',
      },
      diagnosis: 'Sinus Tachycardia secondary to stress and caffeine intake; Mild grade 1 pre-hypertension.',
      symptomsObserved: ['Palpitations', 'Normal heart sounds S1/S2', 'No murmur detected'],
      medicines: [
        {
          name: 'Metoprolol Succinate ER',
          dosage: '25mg',
          frequency: '1-0-0 (Morning with breakfast)',
          duration: '30 Days',
          instructions: 'Take consistently every morning with a glass of water.',
        },
        {
          name: 'Magnesium Glycinate',
          dosage: '200mg',
          frequency: '0-0-1 (Night before sleep)',
          duration: '30 Days',
          instructions: 'Supports muscular relaxation and calm heart rhythm.',
        },
      ],
      labTestsRecommended: ['24-Hour Holter Monitor Test', 'Serum Electrolytes Panel', 'Lipid Profile Fasting'],
      dietaryAdvice: 'Limit daily espresso intake to 1 cup max. Hydrate with 2.5L water daily. Low sodium dietary regime.',
      doctorNotes: 'Patient advised to log morning blood pressure daily and review in 4 weeks.',
      followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    });

    // 8. Create Invoices
    await Invoice.create({
      invoiceNumber: 'INV-2026-01001',
      patient: createdPatients[0]._id,
      doctor: createdDoctors[0]._id,
      items: [
        { description: 'Specialist Cardiology Consultation', category: 'Consultation', quantity: 1, unitPrice: 120, total: 120 },
        { description: '12-Lead Electrocardiogram (ECG)', category: 'Lab Test', quantity: 1, unitPrice: 85, total: 85 },
      ],
      subTotal: 205,
      discountPercent: 10,
      taxPercent: 5,
      totalAmount: 193.73,
      paidAmount: 193.73,
      balanceAmount: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card',
      notes: 'Consultation and preliminary ECG billing settled via Card.',
    });

    await Invoice.create({
      invoiceNumber: 'INV-2026-01002',
      patient: createdPatients[2]._id, // Arthur Pendelton (ICU)
      doctor: createdDoctors[0]._id,
      items: [
        { description: 'ICU Bed Stay (2 Days)', category: 'Room / Bed', quantity: 2, unitPrice: 450, total: 900 },
        { description: 'Intensive Nursing & Continuous Cardiac Telemetry', category: 'Nursing / Care', quantity: 2, unitPrice: 150, total: 300 },
        { description: 'Arterial Blood Gas (ABG) & Cardiac Enzymes Panel', category: 'Lab Test', quantity: 1, unitPrice: 220, total: 220 },
      ],
      subTotal: 1420,
      discountPercent: 5,
      taxPercent: 5,
      totalAmount: 1416.45,
      paidAmount: 500,
      balanceAmount: 916.45,
      paymentStatus: 'Partially Paid',
      paymentMethod: 'Health Insurance',
      notes: 'Initial deposit of $500 received. Balance under United Healthcare insurance pre-authorization.',
    });

    // 9. Create Sample Medical Files (Cloudinary Scans / Lab Reports)
    await MedicalFile.create({
      patient: createdPatients[0]._id,
      doctor: createdDoctors[0]._id,
      title: '12-Lead Resting Electrocardiogram (ECG)',
      category: 'Lab Report',
      fileUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      cloudinaryPublicId: 'sample_ecg_report_01',
      fileSize: 452000,
      fileFormat: 'image/jpeg',
      notes: 'Sinus rhythm recorded, PR interval 160ms, normal QRS complex.',
    });

    await MedicalFile.create({
      patient: createdPatients[2]._id,
      doctor: createdDoctors[0]._id,
      title: 'Chest Radiograph (X-Ray PA View)',
      category: 'X-Ray / MRI Scan',
      fileUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      cloudinaryPublicId: 'sample_xray_report_02',
      fileSize: 1240000,
      fileFormat: 'image/jpeg',
      notes: 'Cardiothoracic ratio within normal range. Clear bilateral costophrenic angles.',
    });

    console.log('[HMS Seeder]: Clinical database successfully populated with rich test dataset!');
  } catch (error) {
    console.error('[HMS Seeder Error]:', error);
  }
};

module.exports = seedData;
