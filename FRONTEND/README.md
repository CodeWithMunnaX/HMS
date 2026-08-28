# 🏥 CarePulse HMS — Frontend Clinical Interface

Modern, high-performance Hospital Management System frontend built with **React 19**, **Vite 8**, and **Lucide React**.

---

## 🚀 Key Technologies & Stack

- **Framework**: React 19 (`react`, `react-dom`)
- **Bundler**: Vite 8 with fast Hot Module Replacement (HMR)
- **Styling**: Pure Modern CSS Design System (Custom Glassmorphism, CSS Custom Properties, Responsive Grid & Flexbox)
- **Icons**: `lucide-react`
- **HTTP Client**: `axios` with global auth interceptors
- **Visual Effects**: `canvas-confetti`

---

## 📦 Project Structure

```
src/
├── assets/          # Static branding, hero graphics, and medical imagery
├── components/      # Modular, reusable clinical components
│   ├── common/      # Navbar, Sidebar, RoleSwitcher, ChatBot, StatCard, Badge, EcgWaveform, Modal
│   ├── emergency/   # AmbulanceTrackerModal (Emergency GPS tracker)
│   ├── lab/         # PathologyReportGeneratorModal (Lab test generator)
│   ├── pharmacy/    # PharmacyDispenserModal & PharmacyInventoryModal
│   ├── scans/       # AiScanAnalyzerModal (AI Computer Vision diagnostic scanner)
│   ├── telehealth/  # TelehealthRoomModal (WebRTC clinical video room)
│   └── triage/      # SymptomTriageModal (AI symptom checker)
├── context/         # AuthContext (Role-Based Access Control) & ToastContext
├── pages/
│   ├── admin/       # AdminPortal (Executive operations, revenue analytics, staff roster)
│   ├── doctor/      # DoctorPortal (OPD queue, digital E-prescriptions, EMR history)
│   ├── patient/     # PatientPortal (Self-service OPD booking, digital RX wallet, scan vault)
│   ├── LandingPage.jsx  # Ultra-modern Hospital Landing Page
│   ├── Login.jsx        # Dedicated Multi-Role Sign In
│   └── Register.jsx     # Patient Registration Page
├── services/        # Centralized REST API client (api.js)
├── styles/          # Design tokens (index.css, components.css)
├── App.jsx          # Top-level application router and RBAC controller
└── main.jsx         # Application root DOM mount
```

---

## 🏃 Running Frontend Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Demo Account Switcher
Use the **1-Click Quick Demo Launcher** directly on the landing page or the top navigation bar to test:
- **Chief Admin**: `admin@carepulse.com`
- **Specialist Doctor**: `sarah.cardio@carepulse.com`
- **Head Receptionist**: `reception@carepulse.com`
- **Patient**: `alex.johnson@example.com`
