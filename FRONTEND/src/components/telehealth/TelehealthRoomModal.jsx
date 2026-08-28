import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Heart,
  Activity,
  User,
  Stethoscope,
  FileText,
  Clock,
  Shield,
  Send,
  MessageSquare,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';

export const TelehealthRoomModal = ({ isOpen, onClose, patient = null, doctor = null }) => {
  const toast = useToast();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'chat'

  // Live WebRTC Video Ref
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // In-Call Live Chat
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', name: doctor?.name || 'Dr. Sarah Jenkins', time: 'Just now', text: 'Hello! I can see you clearly. How are you feeling today?' },
    { sender: 'patient', name: patient?.name || 'Alex Johnson', time: 'Just now', text: 'Doctor, I had mild chest heaviness this morning while walking.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // In-Call Clinical EMR Notes
  const [inCallNotes, setInCallNotes] = useState('Patient reports episodic retrosternal discomfort. Pulse steady at 76 bpm, SpO2 99%. Advised resting ECG and lipid profile review.');
  const [rxIssued, setRxIssued] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setCallDuration(0);
      setRxIssued(false);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      stopLiveCamera();
    }
    return () => {
      clearInterval(timer);
      stopLiveCamera();
    };
  }, [isOpen]);

  const startLiveCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        setIsLiveCameraActive(true);
        setIsVideoOn(true);
        setIsMicOn(true);
        toast.success('Live Webcam & Microphone Connected!');
      } else {
        toast.warning('Webcam access not supported in this browser environment. Using HD Clinical Stream.');
      }
    } catch (err) {
      console.warn('Camera permission error / device not available:', err);
      toast.info('Camera unavailable or permission denied. Switched to HD Clinical Simulation Stream.');
      setIsLiveCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  };

  const toggleCamera = () => {
    if (!isLiveCameraActive) {
      startLiveCamera();
    } else {
      if (mediaStreamRef.current) {
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoOn(videoTrack.enabled);
          toast.info(videoTrack.enabled ? 'Camera Video Resumed' : 'Camera Video Muted');
        }
      } else {
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
    setIsMicOn(!isMicOn);
    toast.info(!isMicOn ? 'Microphone Unmuted (Transmitting Audio)' : 'Microphone Muted');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'doctor',
        name: doctor?.name || 'Dr. Sarah Jenkins',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: newMessage.trim(),
      },
    ]);
    setNewMessage('');
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    stopLiveCamera();
    toast.info(`Telehealth consultation concluded. Duration: ${formatDuration(callDuration)}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleEndCall}
      title="Telehealth & Virtual Video Consultation Studio"
      maxWidth="1120px"
    >
      <div>
        {/* Top Notification Bar: Camera connection helper */}
        <div
          style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '12px',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <strong style={{ color: '#0f766e' }}>Encrypted Telehealth Room:</strong>
            <span style={{ color: '#134e4a' }}>
              Connected via WebRTC with {patient?.name || 'Alex Johnson'} ({patient?.patientId || 'PAT-1001'})
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              backgroundColor: isLiveCameraActive ? '#059669' : '#0891b2',
              color: '#ffffff',
              fontWeight: '700',
              padding: '0.3rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={isLiveCameraActive ? stopLiveCamera : startLiveCamera}
          >
            <Camera size={14} />
            {isLiveCameraActive ? 'Webcam Active (Click to Disconnect)' : 'Connect Your Real Webcam'}
          </button>
        </div>

        {/* Studio Grid: Video Stage (Left) & Clinical Console (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.85fr', gap: '1.25rem' }}>
          {/* LEFT: Video Screen Stage */}
          <div>
            <div
              style={{
                position: 'relative',
                height: '420px',
                backgroundColor: '#040d21',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Remote Feed: Patient Screen */}
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img
                  src={
                    patient?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
                  }
                  alt="Patient Remote Stream"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Patient Status Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(4, 13, 33, 0.75)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontWeight: '700' }}>{patient?.name || 'Alex Johnson'} (Patient Stream)</span>
                </div>

                {/* Vitals Telemetry Box on Video */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(4, 13, 33, 0.8)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171' }}>
                    <Heart size={13} className="animate-pulse" /> 76 BPM
                  </div>
                  <div style={{ color: '#38bdf8' }}>SpO2 99%</div>
                  <div style={{ color: '#4ade80' }}>BP 120/80</div>
                  <div style={{ color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {formatDuration(callDuration)}
                  </div>
                </div>

                {/* Self Feed (Doctor PiP Window) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    width: '150px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    backgroundColor: '#000000',
                  }}
                >
                  {/* Real WebRTC Video Tag */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: isLiveCameraActive && isVideoOn ? 'block' : 'none',
                    }}
                  />

                  {/* Fallback Doctor Avatar */}
                  {(!isLiveCameraActive || !isVideoOn) && (
                    <img
                      src={
                        doctor?.avatar ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
                      }
                      alt="Doctor Stream"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isVideoOn ? 'none' : 'brightness(0.2)' }}
                    />
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '6px',
                      fontSize: '0.65rem',
                      color: '#ffffff',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: '700',
                    }}
                  >
                    {isLiveCameraActive ? '● Real Camera' : 'You (Doctor)'}
                  </div>
                </div>

                {/* Animated Audio Equalizer Waveform when Mic is Active */}
                {isMicOn && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      backgroundColor: 'rgba(4, 13, 33, 0.75)',
                      backdropFilter: 'blur(8px)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Volume2 size={13} color="#22d3ee" />
                    <span style={{ fontSize: '0.7rem', color: '#67e8f9', fontWeight: '700' }}>Audio Live</span>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px', marginLeft: '4px' }}>
                      <span style={{ width: '3px', height: '8px', backgroundColor: '#22d3ee', borderRadius: '1px', animation: 'pulse 0.6s infinite' }} />
                      <span style={{ width: '3px', height: '12px', backgroundColor: '#22d3ee', borderRadius: '1px', animation: 'pulse 0.4s infinite' }} />
                      <span style={{ width: '3px', height: '6px', backgroundColor: '#22d3ee', borderRadius: '1px', animation: 'pulse 0.8s infinite' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* In-Call Action Controls Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                marginTop: '1rem',
                backgroundColor: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                className={`btn ${isMicOn ? 'btn-secondary' : 'btn-danger'}`}
                style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, justifyContent: 'center' }}
                onClick={toggleMic}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              <button
                type="button"
                className={`btn ${isVideoOn ? 'btn-secondary' : 'btn-danger'}`}
                style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, justifyContent: 'center' }}
                onClick={toggleCamera}
                title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>

              <button
                type="button"
                className={`btn ${isScreenSharing ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, justifyContent: 'center' }}
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  toast.info(isScreenSharing ? 'Stopped Screen Share' : 'Diagnostic Imaging Viewer Shared on Screen');
                }}
                title="Share Medical Scan / Screen"
              >
                <Monitor size={18} />
              </button>

              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '0.55rem 1.4rem', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleEndCall}
              >
                <PhoneOff size={16} /> End Call
              </button>
            </div>
          </div>

          {/* RIGHT: In-Call Clinical Console & Instant Chat Tabs */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              height: '490px',
            }}
          >
            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setActiveTab('notes')}
              >
                <FileText size={14} /> Clinical Notes & Rx
              </button>
              <button
                type="button"
                className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={14} /> In-Call Chat ({chatMessages.length})
              </button>
            </div>

            {/* TAB 1: Clinical Notes & Rx */}
            {activeTab === 'notes' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Patient Summary Card */}
                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.85rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>Patient:</strong> <span>{patient?.name || 'Alex Johnson'} ({patient?.patientId || 'PAT-1001'})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>Blood Group:</strong> <span>{patient?.bloodGroup || 'O+'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Known Allergies:</strong> <span style={{ color: '#dc2626', fontWeight: '800' }}>Penicillin, Peanuts</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                    Live Consultation Clinical Findings & Rx Advice:
                  </label>
                  <textarea
                    className="form-textarea"
                    style={{ flex: 1, resize: 'none', fontSize: '0.8125rem' }}
                    value={inCallNotes}
                    onChange={(e) => setInCallNotes(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.85rem', width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setRxIssued(true);
                    toast.success('Clinical prescription drafted and queued for patient verification!');
                  }}
                >
                  <CheckCircle2 size={14} /> {rxIssued ? '✓ Prescription Issued to Patient' : 'Save & Issue Digital E-Prescription'}
                </button>
              </div>
            ) : (
              /* TAB 2: Live In-Call Chat */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {chatMessages.map((msg, idx) => {
                    const isDoc = msg.sender === 'doctor';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isDoc ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          backgroundColor: isDoc ? '#ecfeff' : '#f1f5f9',
                          border: isDoc ? '1px solid #a5f3fc' : '1px solid #e2e8f0',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '10px',
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: isDoc ? '#0e7490' : '#475569', marginBottom: '2px' }}>
                          {msg.name} • {msg.time}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#0f172a' }}>{msg.text}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input Bar */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type message to patient..."
                    style={{ fontSize: '0.8125rem' }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 0.85rem' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
