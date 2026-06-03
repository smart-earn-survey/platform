/**
 * Smart Earn Survey - Main App
 * Powered by Lee Smart Tech
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/Landing'));
const TermsPage = lazy(() => import('./pages/Terms'));
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmail'));

const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const SurveysPage = lazy(() => import('./pages/dashboard/Surveys'));
const OfferwallPage = lazy(() => import('./pages/dashboard/Offerwall'));
const WalletPage = lazy(() => import('./pages/dashboard/Wallet'));
const WithdrawPage = lazy(() => import('./pages/dashboard/Withdraw'));
const ReferralsPage = lazy(() => import('./pages/dashboard/Referrals'));
const ProfilePage = lazy(() => import('./pages/dashboard/Profile'));
const NotificationsPage = lazy(() => import('./pages/dashboard/Notifications'));
const SpinWheelPage = lazy(() => import('./pages/dashboard/SpinWheel'));
const LeaderboardPage = lazy(() => import('./pages/dashboard/Leaderboard'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminSurveys = lazy(() => import('./pages/admin/AdminSurveys'));

// Route guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-emerald-400 font-medium animate-pulse">Loading Smart Earn...</p>
    </div>
  </div>
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
      <Route path="/terms" element={<SuspenseWrapper><TermsPage /></SuspenseWrapper>} />
      <Route path="/privacy" element={<SuspenseWrapper><PrivacyPage /></SuspenseWrapper>} />
      <Route path="/login" element={<PublicRoute><SuspenseWrapper><LoginPage /></SuspenseWrapper></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><SuspenseWrapper><RegisterPage /></SuspenseWrapper></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper></PublicRoute>} />
      <Route path="/reset-password/:token" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />
      <Route path="/verify-email/:token" element={<SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><SuspenseWrapper><DashboardLayout /></SuspenseWrapper></ProtectedRoute>}>
        <Route index element={<SuspenseWrapper><Overview /></SuspenseWrapper>} />
        <Route path="surveys" element={<SuspenseWrapper><SurveysPage /></SuspenseWrapper>} />
        <Route path="offerwall" element={<SuspenseWrapper><OfferwallPage /></SuspenseWrapper>} />
        <Route path="wallet" element={<SuspenseWrapper><WalletPage /></SuspenseWrapper>} />
        <Route path="withdraw" element={<SuspenseWrapper><WithdrawPage /></SuspenseWrapper>} />
        <Route path="referrals" element={<SuspenseWrapper><ReferralsPage /></SuspenseWrapper>} />
        <Route path="profile" element={<SuspenseWrapper><ProfilePage /></SuspenseWrapper>} />
        <Route path="notifications" element={<SuspenseWrapper><NotificationsPage /></SuspenseWrapper>} />
        <Route path="spin" element={<SuspenseWrapper><SpinWheelPage /></SuspenseWrapper>} />
        <Route path="leaderboard" element={<SuspenseWrapper><LeaderboardPage /></SuspenseWrapper>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><SuspenseWrapper><AdminLayout /></SuspenseWrapper></AdminRoute>}>
        <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
        <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
        <Route path="withdrawals" element={<SuspenseWrapper><AdminWithdrawals /></SuspenseWrapper>} />
        <Route path="surveys" element={<SuspenseWrapper><AdminSurveys /></SuspenseWrapper>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#e2e8f0',
              border: '1px solid #10b981',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
