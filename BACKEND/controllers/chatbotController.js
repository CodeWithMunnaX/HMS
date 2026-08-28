const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bed = require('../models/Bed');
const Invoice = require('../models/Invoice');
const Prescription = require('../models/Prescription');

// @desc    Process Chatbot AI query with live MongoDB context and Gemini AI
// @route   POST /api/chatbot/query
// @access  Public / Protected
const processChatQuery = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured in backend .env',
      });
    }

    // 1. Fetch live comprehensive hospital database context
    const [patients, doctors, appointments, beds, invoices, prescriptions] = await Promise.all([
      Patient.find().select('patientId name age gender bloodGroup phone email address allergies chronicConditions insuranceProvider admissionStatus').limit(50),
      Doctor.find().populate('user', 'name email phone avatar department status').limit(20),
      Appointment.find()
        .populate('patient', 'name patientId phone')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ appointmentDate: -1 })
        .limit(30),
      Bed.find().populate('currentPatient', 'name patientId').populate({ path: 'attendingDoctor', populate: { path: 'user', select: 'name' } }),
      Invoice.find().populate('patient', 'name patientId').sort({ issueDate: -1 }).limit(30),
      Prescription.find().populate('patient', 'name patientId').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } }).limit(20),
    ]);

    // Format doctors summary
    const doctorsSummary = doctors.map((d) => ({
      name: d.user?.name,
      specialty: d.specialty,
      department: d.department,
      fee: `$${d.consultationFee}`,
      room: d.roomNumber,
      experience: `${d.experienceYears} years`,
      rating: d.rating,
      availableDays: d.availableDays?.join(', '),
      timeSlots: d.availableTimeSlots?.join(', '),
    }));

    // Format patients summary
    const patientsSummary = patients.map((p) => ({
      id: p.patientId,
      name: p.name,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      phone: p.phone,
      email: p.email,
      allergies: p.allergies?.join(', ') || 'None',
      chronicConditions: p.chronicConditions?.join(', ') || 'None',
      status: p.admissionStatus,
      insurance: p.insuranceProvider,
    }));

    // Format beds summary
    const bedsSummary = beds.map((b) => ({
      bedNumber: b.bedNumber,
      ward: b.wardType,
      floor: b.floor,
      status: b.status,
      rate: `$${b.dailyRate}/day`,
      currentPatient: b.currentPatient?.name || 'Empty',
      doctor: b.attendingDoctor?.user?.name || 'N/A',
    }));

    // Format appointments summary
    const appointmentsSummary = appointments.map((a) => ({
      appointmentNumber: a.appointmentNumber,
      tokenNumber: a.tokenNumber,
      patient: a.patient?.name,
      doctor: a.doctor?.user?.name,
      department: a.department,
      date: new Date(a.appointmentDate).toLocaleDateString(),
      timeSlot: a.timeSlot,
      status: a.status,
      reason: a.reasonForVisit,
    }));

    // Format financial billing summary
    const totalRevenue = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
    const pendingBalance = invoices.reduce((acc, i) => acc + (i.balanceAmount || 0), 0);
    const invoicesSummary = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      patient: inv.patient?.name,
      total: `$${inv.totalAmount}`,
      paid: `$${inv.paidAmount}`,
      balance: `$${inv.balanceAmount}`,
      status: inv.paymentStatus,
      method: inv.paymentMethod,
      date: new Date(inv.issueDate).toLocaleDateString(),
    }));

    // Format prescriptions summary
    const prescriptionsSummary = prescriptions.map((rx) => ({
      rxId: rx.prescriptionId,
      patient: rx.patient?.name,
      doctor: rx.doctor?.user?.name,
      diagnosis: rx.diagnosis,
      medicines: rx.medicines?.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join('; '),
      vitals: rx.vitals ? `BP: ${rx.vitals.bloodPressure}, Pulse: ${rx.vitals.heartRate}, SpO2: ${rx.vitals.spO2}` : 'N/A',
    }));

    // 2. Build AI System Instruction with Ground Truth Database Context
    const systemPrompt = `You are "CarePulse AI", the intelligent clinical medical assistant for CarePulse Hospital Management System.
You have real-time live access to the hospital's MongoDB database. Your job is to answer user queries accurately, concisely, and professionally using the live database snapshot below.

### LIVE DATABASE SNAPSHOT:
1. **DOCTORS & SPECIALISTS (${doctorsSummary.length} on roster)**:
${JSON.stringify(doctorsSummary, null, 2)}

2. **REGISTERED PATIENTS (${patientsSummary.length} records)**:
${JSON.stringify(patientsSummary, null, 2)}

3. **INPATIENT BEDS & WARDS (${bedsSummary.length} beds)**:
${JSON.stringify(bedsSummary, null, 2)}

4. **APPOINTMENTS & OPD QUEUE (${appointmentsSummary.length} records)**:
${JSON.stringify(appointmentsSummary, null, 2)}

5. **BILLING & INVOICES (Total Revenue: $${totalRevenue}, Pending: $${pendingBalance})**:
${JSON.stringify(invoicesSummary, null, 2)}

6. **E-PRESCRIPTIONS & CLINICAL RECORDS**:
${JSON.stringify(prescriptionsSummary, null, 2)}

### INSTRUCTIONS:
- Whenever a user asks for a patient (like "Sameer", "Alex", "Sophia", etc.), check the Patients list above and provide their exact details (Age, Gender, Blood Group, Phone, Allergies, Status, Insurance, etc.).
- If they ask about doctors, availability, fees, or departments, provide accurate doctor names, specialties, and schedules.
- If they ask about bed occupancy, report available beds and occupied beds by ward (ICU, Emergency, General Ward, Deluxe).
- If they ask about billing, provide invoice totals, payment status, and balances.
- Format your response using clean Markdown with bold headings, bullet points, and neat tables when appropriate.
- Be friendly, professional, empathetic, and concise.`;

    // 3. Prepare Gemini API Request
    const contents = [];

    // Append prior history if any
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        if (h.role && h.text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // Call Gemini API (Try latest available model versions)
    const modelsToTry = ['gemini-3.6-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
    let aiResponseText = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          aiResponseText = data.candidates[0].content.parts[0].text;
          break;
        } else {
          lastError = data.error?.message || JSON.stringify(data);
          console.warn(`[Gemini ${model} warning]:`, lastError);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`[Gemini ${model} fetch failed]:`, err.message);
      }
    }

    if (!aiResponseText) {
      // Intelligent fallback answer generator using direct database search if Gemini API has quota/network error
      const searchLower = message.toLowerCase();
      let matchedPatient = patients.find(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          searchLower.includes(p.name.toLowerCase().split(' ')[0]) ||
          (p.patientId && searchLower.includes(p.patientId.toLowerCase()))
      );

      if (matchedPatient) {
        aiResponseText = `### 📋 Patient Record Found: **${matchedPatient.name}**\n\n` +
          `- **Patient ID:** \`${matchedPatient.patientId}\`\n` +
          `- **Age / Gender:** ${matchedPatient.age} yrs (${matchedPatient.gender})\n` +
          `- **Blood Group:** **${matchedPatient.bloodGroup}**\n` +
          `- **Contact Phone:** ${matchedPatient.phone}\n` +
          `- **Email:** ${matchedPatient.email || 'N/A'}\n` +
          `- **Care Status:** ${matchedPatient.admissionStatus}\n` +
          `- **Insurance:** ${matchedPatient.insuranceProvider} (Policy: ${matchedPatient.policyNumber || 'N/A'})\n` +
          `- **Known Allergies:** ${matchedPatient.allergies?.length ? matchedPatient.allergies.join(', ') : 'None reported'}\n` +
          `- **Chronic Conditions:** ${matchedPatient.chronicConditions?.length ? matchedPatient.chronicConditions.join(', ') : 'None'}`;
      } else {
        aiResponseText = `I am connected to the hospital database. I can help you lookup patients (e.g. Sameer, Alex Johnson, Sophia Martinez), doctor schedules, bed availability across ICU/General wards, appointment queues, and billing invoices. What would you like to know?`;
      }
    }

    res.json({
      success: true,
      reply: aiResponseText,
    });
  } catch (error) {
    console.error('[Chatbot Error]:', error);
    next(error);
  }
};

module.exports = {
  processChatQuery,
};
