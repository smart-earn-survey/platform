import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminAPI } from '../../services/api';

const StatCard = ({ icon, label, value, prefix = '', suffix = '', color = 'purple' }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-${color}-500/30 transition-all`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
    </div>
    <div className={`text-2xl font-black text-${color}-400`}>{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</div>
    <div className="text-gray-400 text-sm mt-1">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading dashboard...</div>;
  if (!stats) return <div className="text-gray-400 text-center py-20">Failed to load stats</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Platform overview and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="blue" />
        <StatCard icon="✅" label="Active Users" value={stats.activeUsers} color="emerald" />
        <StatCard icon="⏳" label="Pending Withdrawals" value={stats.pendingWithdrawals} color="yellow" />
        <StatCard icon="💸" label="Total Paid Out" value={stats.totalRevenue} prefix="₦" color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Daily Signups (30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailySignups}>
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => v?.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Daily Withdrawals (30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.dailyWithdrawals}>
              <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => v?.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₦${v}`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                formatter={v => [`₦${v}`, 'Amount']} />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users + Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-5 border-b border-gray-800"><h2 className="text-white font-bold">Recent Users</h2></div>
          <div className="divide-y divide-gray-800">
            {stats.recentUsers?.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.firstName?.[0]}{u.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{u.firstName} {u.lastName}</div>
                  <div className="text-gray-500 text-xs truncate">{u.email}</div>
                </div>
                <div className="text-emerald-400 text-sm font-medium">₦{(u.wallet?.balance || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-5 border-b border-gray-800"><h2 className="text-white font-bold">Pending Withdrawals</h2></div>
          <div className="divide-y divide-gray-800">
            {stats.recentWithdrawals?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending withdrawals</div>
            ) : stats.recentWithdrawals?.map(wd => (
              <div key={wd._id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏦</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{wd.user?.firstName} {wd.user?.lastName}</div>
                  <div className="text-gray-500 text-xs">{new Date(wd.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-yellow-400 font-bold">₦{wd.amount?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
