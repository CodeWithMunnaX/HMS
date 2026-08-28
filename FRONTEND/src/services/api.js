import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carepulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

/* ==========================================================================
   API Endpoints
   ========================================================================== */

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  getDemoUsers: () => api.get('/auth/demo-users'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  getSpecialties: () => api.get('/doctors/meta/specialties'),
};

export const patientService = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } }),
  book: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
};

export const prescriptionService = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  verifyQr: (data) => api.post('/prescriptions/verify-qr', data),
  dispense: (id, data) => api.post(`/prescriptions/${id}/dispense`, data),
};

export const billingService = {
  getInvoices: (params) => api.get('/billing/invoices', { params }),
  getById: (id) => api.get(`/billing/invoices/${id}`),
  createInvoice: (data) => api.post('/billing/invoices', data),
  recordPayment: (id, data) => api.put(`/billing/invoices/${id}/pay`, data),
  getStats: () => api.get('/billing/stats'),
};

export const bedService = {
  getAll: (params) => api.get('/beds', { params }),
  allocate: (id, data) => api.put(`/beds/${id}/allocate`, data),
  discharge: (id) => api.put(`/beds/${id}/discharge`),
  getStats: () => api.get('/beds/stats'),
};

export const uploadService = {
  uploadFile: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getFiles: (params) => api.get('/upload/files', { params }),
  deleteFile: (id) => api.delete(`/upload/files/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const chatbotService = {
  sendMessage: (data) => api.post('/chatbot/query', data),
};

export const aiService = {
  analyzeScan: (formData) =>
    api.post('/ai/analyze-scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeScanJson: (data) => api.post('/ai/analyze-scan', data),
};

export default api;
