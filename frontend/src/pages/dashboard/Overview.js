/**
 * Dashboard Overview Page
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { walletAPI, notificationAPI, surveyAPI } from '../../services/api';

const StatCard = ({ icon, label, value, prefix = '₦', color = 'emerald', sub }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-${color}-500/30 transition-all`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium text-${color}-400 bg-${color}-400/10 px-2 py-1 rounded-full`}>{sub}</span>
    </div>
    <div className={`text-2xl font-black text-${color}-400`}>
      {prefix}<CountUp end={parseFloat(value) || 0} duration={1.5} separator="," decimals={0} />
    </div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
  </div>
);

export default function Overview() {
  const { user, refreshUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentSurveys, setRecentSurveys] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [claimingBonus, setClaimingBonus] = useState(false);

  useEffect(() => {
    Promise.all([
      walletAPI.getSummary(),
      notificationAPI.getAll(),
      surveyAPI.getSurveys({ limit: 4 }),
      notificationAPI.getAnnouncements(),
    ]).then(([summaryRes, notifRes, surveysRes, announcementsRes]) => {
      setSummary(summaryRes.data.summary);
      setNotifications(notifRes.data.notifications?.slice(0, 5) || []);
      setRecentSurveys(surveysRes.data.surveys || []);
      setAnnouncements(announcementsRes.data.announcements || []);
    }).catch(() => {});
  }, []);

  const handleClaimBonus = async () => {
    setClaimingBonus(true);
    try {
      const { data } = await walletAPI.claimDailyBonus();
      toast.success(`🎉 ${data.message}`);
      refreshUser();
      const summaryRes = await walletAPI.getSummary();
      setSummary(summaryRes.data.summary);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim bonus.');
    } finally {
      setClaimingBonus(false);
    }
  };

  const canClaimBonus = summary && !summary.dailyBonusClaimed;
  const chartData = summary?.last30Days?.slice(-14) || [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Announcements */}
      {announcements.map(ann => (
        <div key={ann._id} className={`
          flex items-start gap-3 p-4 rounded-2xl border text-sm
          ${ann.type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : ''}
          ${ann.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : ''}
          ${ann.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : ''}
          ${ann.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300' : ''}
        `}>
          <span className="text-lg flex-shrink-0">📢</span>
          <div><strong>{ann.title}:</strong> {ann.message}</div>
        </div>
      ))}

      {/* Email Verification Warning */}
      {!user?.isEmailVerified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-yellow-400 font-semibold">Verify your email address</p>
            <p className="text-yellow-400/70 text-sm">Withdrawals require email verification.</p>
          </div>
        </div>
      )}

      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Here's your earnings overview</p>
        </div>
        <div className="flex gap-3">
          {canClaimBonus && (
            <button onClick={handleClaimBonus} disabled={claimingBonus}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 animate-pulse">
              {claimingBonus ? '⏳ Claiming...' : '🎁 Claim Daily Bonus'}
            </button>
          )}
          <Link to="/dashboard/spin"
            className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-xl font-semibold text-sm transition-all">
            🎰 Spin Wheel
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Available Balance" value={user?.wallet?.balance || 0} sub="Wallet" color="emerald" />
        <StatCard icon="⏳" label="Pending Balance" value={user?.wallet?.pendingBalance || 0} sub="Processing" color="yellow" />
        <StatCard icon="📈" label="Total Earned" value={user?.wallet?.totalEarned || 0} sub="All time" color="blue" />
        <StatCard icon="📋" label="Surveys Done" value={user?.surveysCompleted || 0} prefix="" sub="Completed" color="purple" />
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Earnings - Last 14 Days</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => v?.split('-').slice(1).join('/')} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₦${v}`} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                  formatter={(v) => [`₦${v}`, 'Earned']}
                />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#earningsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              Complete surveys to see your earnings chart
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/dashboard/surveys', icon: '📋', label: 'Browse Surveys', desc: 'Earn now', color: 'emerald' },
              { to: '/dashboard/offerwall', icon: '🎯', label: 'Offer Wall', desc: 'More tasks', color: 'blue' },
              { to: '/dashboard/withdraw', icon: '🏦', label: 'Withdraw', desc: 'Get paid', color: 'purple' },
              { to: '/dashboard/referrals', icon: '👥', label: 'Refer & Earn', desc: '10% commission', color: 'yellow' },
            ].map(({ to, icon, label, desc, color }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-transparent hover:border-${color}-500/20 transition-all group`}>
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{label}</div>
                  <div className="text-gray-500 text-xs">{desc}</div>
                </div>
                <svg className={`w-4 h-4 text-gray-600 group-hover:text-${color}-400 transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Surveys + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Surveys */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Available Surveys</h2>
            <Link to="/dashboard/surveys" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">View All →</Link>
          </div>
          <div className="space-y-3">
            {recentSurveys.length > 0 ? recentSurveys.map(survey => (
              <div key={survey._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                  ${survey.category === 'technology' ? 'bg-blue-500/20' :
                    survey.category === 'health' ? 'bg-green-500/20' :
                    survey.category === 'finance' ? 'bg-yellow-500/20' : 'bg-purple-500/20'}`}>
                  {survey.category === 'technology' ? '💻' :
                   survey.category === 'health' ? '🏥' :
                   survey.category === 'finance' ? '💰' : '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{survey.title}</div>
                  <div className="text-gray-400 text-xs">{survey.estimatedTime} mins</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm flex-shrink-0">₦{survey.reward}</div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📋</div>
                <p>No surveys available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Recent Activity</h2>
            <Link to="/dashboard/notifications" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">View All →</Link>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? notifications.map(notif => (
              <div key={notif._id} className={`flex items-start gap-3 p-3 rounded-xl ${!notif.isRead ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-gray-800/30'}`}>
                <span className="text-xl flex-shrink-0">
                  {notif.type === 'survey' ? '📋' : notif.type === 'payment' ? '💸' : notif.type === 'referral' ? '👥' : notif.type === 'bonus' ? '🎁' : '📢'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{notif.title}</div>
                  <div className="text-gray-400 text-xs mt-0.5 line-clamp-2">{notif.message}</div>
                  <div className="text-gray-600 text-xs mt-1">{new Date(notif.createdAt).toLocaleDateString()}</div>
                </div>
                {!notif.isRead && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
