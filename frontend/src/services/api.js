/**
 * API Service Layer
 * Centralized axios instance with interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// ─── User API ──────────────────────────────────────────────────
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
};

// ─── Survey API ────────────────────────────────────────────────
export const surveyAPI = {
  getSurveys: (params) => api.get('/surveys', { params }),
  getSurvey: (id) => api.get(`/surveys/${id}`),
  startSurvey: (id) => api.post(`/surveys/${id}/start`),
  completeSurvey: (surveyId) => api.post('/surveys/complete', { surveyId }),
  getCompleted: () => api.get('/surveys/completed'),
};

// ─── Wallet API ────────────────────────────────────────────────
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getSummary: () => api.get('/wallet/summary'),
  claimDailyBonus: () => api.post('/wallet/daily-bonus'),
  spinWheel: () => api.post('/wallet/spin'),
};

// ─── Withdrawal API ────────────────────────────────────────────
export const withdrawalAPI = {
  requestWithdrawal: (data) => api.post('/withdrawals', data),
  getWithdrawals: (params) => api.get('/withdrawals', { params }),
  getBanks: () => api.get('/withdrawals/banks'),
  verifyBank: (data) => api.post('/withdrawals/verify-bank', data),
  saveBankDetails: (data) => api.post('/withdrawals/save-bank', data),
};

// ─── Referral API ──────────────────────────────────────────────
export const referralAPI = {
  getStats: () => api.get('/referrals/stats'),
};

// ─── Offerwall API ─────────────────────────────────────────────
export const offerwallAPI = {
  getUrls: () => api.get('/offerwall/urls'),
  getCompleted: () => api.get('/offerwall/completed'),
};

// ─── Notification API ──────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  getAnnouncements: () => api.get('/notifications/announcements'),
};

// ─── Admin API ─────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  adjustBalance: (id, data) => api.post(`/admin/users/${id}/balance`, data),
  getWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  processWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
  getSurveys: () => api.get('/admin/surveys'),
  createSurvey: (data) => api.post('/admin/surveys', data),
  updateSurvey: (id, data) => api.put(`/admin/surveys/${id}`, data),
  deleteSurvey: (id) => api.delete(`/admin/surveys/${id}`),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
};

export default api;
