/**
 * Dashboard Layout - Sidebar + Main Content
 */
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: '🏠', exact: true },
  { to: '/dashboard/surveys', label: 'Surveys', icon: '📋' },
  { to: '/dashboard/offerwall', label: 'Offer Wall', icon: '🎯' },
  { to: '/dashboard/wallet', label: 'Wallet', icon: '💰' },
  { to: '/dashboard/withdraw', label: 'Withdraw', icon: '🏦' },
  { to: '/dashboard/referrals', label: 'Referrals', icon: '👥' },
  { to: '/dashboard/spin', label: 'Spin Wheel', icon: '🎰' },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/dashboard/profile', label: 'Profile', icon: '👤' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationAPI.getAll()
      .then(({ data }) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ──────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-xl">💰</div>
            <div>
              <div className="font-black text-lg text-white leading-none">Smart<span className="text-emerald-400">Earn</span></div>
              <div className="text-gray-500 text-xs">Earn Daily</div>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-2xl p-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-emerald-400 font-bold text-sm">₦{(user?.wallet?.balance || 0).toLocaleString()}</div>
            </div>
            {!user?.isEmailVerified && (
              <div title="Email not verified" className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}
              `}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-4 border
                ${isActive
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'text-gray-400 hover:text-purple-400 border-transparent hover:border-purple-500/20 hover:bg-purple-500/10'}
              `}>
              <span className="text-lg">⚙️</span>
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:block">
            <p className="text-gray-400 text-sm">Welcome back, <span className="text-white font-semibold">{user?.firstName}</span> 👋</p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {!user?.isEmailVerified && (
              <div className="hidden sm:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-medium">
                ⚠️ Verify your email
              </div>
            )}
            <NavLink to="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/dashboard/profile"
              className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
