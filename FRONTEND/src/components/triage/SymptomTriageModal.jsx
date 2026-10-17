import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  ShieldAlert,
  Flame,
  Calendar,
  Sparkles,
  Brain,
  Bone,
  Wind,
  HeartPulse,
  Hand,
} from 'lucide-react';

export const SymptomTriageModal = ({ isOpen, onClose, onBookDepartment = null }) => {
  const toast = useToast();

  const [selectedSymptom, setSelectedSymptom] = useState('chest_pain');
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('2_days');
  const [hasEmergencyFlags, setHasEmergencyFlags] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

  const symptomOptions = [
    {
      id: 'chest_pain',
      name: 'Chest Pain / Palpitations',
      icon: HeartPulse,
      desc: 'Chest pressure, shortness of breath, radiating pain to arm',
      recommendedDept: 'Cardiology',
      recommendedDoc: 'Dr. Sarah Jenkins',
      urgency: 'URGENT',
    },
    {
      id: 'headache',
      name: 'Severe Headache / Migraine',
      icon: Brain,
      desc: 'Throbbing head pain, dizziness, visual aura, light sensitivity',
      recommendedDept: 'Neurology',
      recommendedDoc: 'Dr. Michael Chen',
      urgency: 'MODERATE',
    },
    {
      id: 'joint_trauma',
      name: 'Joint Pain / Bone Injury',
      icon: Bone,
      desc: 'Severe knee/wrist pain, inability to bear weight, swelling after fall',
      recommendedDept: 'Orthopedics',
      recommendedDoc: 'Dr. David Kim',
      urgency: 'MODERATE',
    },
    {
      id: 'respiratory',
      name: 'Persistent Cough & Fever',
      icon: Wind,
      desc: 'Productive phlegm, wheezing, high temperature, chest crackles',
      recommendedDept: 'General Medicine',
      recommendedDoc: 'Dr. Emily Carter',
      urgency: 'ROUTINE',
    },
    {
      id: 'dermatology',
      name: 'Skin Rash / Allergic Lesion',
      icon: Hand,
      desc: 'Itchy rash, redness, spreading skin inflammation, hives',
      recommendedDept: 'Dermatology',
      recommendedDoc: 'Dr. Marcus Vance',
      urgency: 'ROUTINE',
    },
  ];

  const handleRunTriage = () => {
    const symptomData = symptomOptions.find((s) => s.id === selectedSymptom);
    let finalUrgency = symptomData.urgency;

    if (severity === 'severe' || hasEmergencyFlags) {
      finalUrgency = 'EMERGENCY / ER (Immediate Care Required)';
    }

    setAssessmentResult({
      symptom: symptomData.name,
      department: symptomData.recommendedDept,
      doctor: symptomData.recommendedDoc,
      urgency: finalUrgency,
      guidance:
        finalUrgency.includes('EMERGENCY')
          ? 'Immediate clinical evaluation required. Please proceed to the Hospital Emergency Trauma Center or call emergency dispatch.'
          : `Specialist consultation recommended with ${symptomData.recommendedDept}. Schedule an outpatient appointment.`,
    });
    toast.success('Clinical Triage Assessment generated!');
  };

  const handleProceedToBooking = () => {
    if (onBookDepartment && assessmentResult) {
      onBookDepartment(assessmentResult.department);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Symptom Checker & Specialty Triage"
      maxWidth="780px"
    >
      <div>
        {/* Step 1: Choose Chief Complaint */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">
            Step 1: Select your primary symptom
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {symptomOptions.map((s) => {
              const isSelected = selectedSymptom === s.id;
              const Icon = s.icon;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedSymptom(s.id)}
                  className={`clinical-option${isSelected ? ' is-selected' : ''}`}
                >
                  <span className="clinical-option-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="clinical-option-title">{s.name}</span>
                    <span className="clinical-option-desc">{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Severity & Duration */}
        <div className="clinical-grid-2" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Symptom Severity Level</label>
            <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="mild">Mild (Noticeable but does not affect daily activities)</option>
              <option value="moderate">Moderate (Pain/discomfort limits normal routine)</option>
              <option value="severe">Severe (Intense, debilitating pain or distress)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duration of Symptoms</label>
            <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="today">Started Today / Acute</option>
              <option value="2_days">2 to 3 Days</option>
              <option value="1_week">More than 1 Week / Persistent</option>
            </select>
          </div>
        </div>

        {/* Emergency Flag Checkbox */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <input
            type="checkbox"
            id="emergencyFlag"
            checked={hasEmergencyFlags}
            onChange={(e) => setHasEmergencyFlags(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#d97706', cursor: 'pointer' }}
          />
          <label htmlFor="emergencyFlag" style={{ fontSize: '0.8rem', color: '#92400e', cursor: 'pointer', margin: 0 }}>
            <strong>Check if experiencing critical flags:</strong> Sudden fainting, acute breathlessness, sudden speech difficulty, or severe chest tightness radiating to jaw/back.
          </label>
        </div>

        {/* Action Button */}
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', justifyContent: 'center' }}
          onClick={handleRunTriage}
        >
          <Activity size={18} /> Evaluate Symptoms & Recommend Specialist
        </button>

        {/* Triage Output Card */}
        {assessmentResult && (
          <div className="clinical-result">
            <div className="clinical-result-head">
              <div>
                <span className="clinical-eyebrow">Triage result</span>
                <div className="clinical-result-title">
                  Recommended department: {assessmentResult.department}
                </div>
              </div>
              <span
                className={`clinical-pill ${assessmentResult.urgency.includes('EMERGENCY') ? 'clinical-pill-danger' : 'clinical-pill-teal'}`}
              >
                {assessmentResult.urgency.includes('EMERGENCY') && <AlertTriangle size={13} />}
                {assessmentResult.urgency}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: '1rem' }}>
              {assessmentResult.guidance}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleProceedToBooking}
              >
                <Calendar size={16} /> Book {assessmentResult.department} Specialist Now
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
