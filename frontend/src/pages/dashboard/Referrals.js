// ===== Referrals.js =====
import React, { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { referralAPI } from '../../services/api';

export default function ReferralsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralAPI.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load referral stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">Referral Program</h1>
        <p className="text-gray-400 text-sm">Earn 10% on every survey your referrals complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Referrals', value: stats?.totalReferrals || 0, icon: '👥', prefix: '' },
          { label: 'Referral Earnings', value: stats?.totalEarnings || 0, icon: '💰', prefix: '₦' },
          { label: 'Commission Rate', value: 10, icon: '📊', prefix: '', suffix: '%' },
        ].map(({ label, value, icon, prefix, suffix = '' }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-black text-emerald-400">{prefix}{value.toLocaleString()}{suffix}</div>
            <div className="text-gray-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Your Referral Link</h2>
        <div className="flex gap-3">
          <input readOnly value={stats?.referralLink || ''} 
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none" />
          <CopyToClipboard text={stats?.referralLink || ''} onCopy={() => toast.success('Link copied!')}>
            <button className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold text-sm transition-all">
              📋 Copy
            </button>
          </CopyToClipboard>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-gray-400 text-sm">Your code:</span>
          <CopyToClipboard text={stats?.referralCode || ''} onCopy={() => toast.success('Code copied!')}>
            <button className="font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
              {stats?.referralCode} 📋
            </button>
          </CopyToClipboard>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">How Referrals Work</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your unique referral link with friends and family' },
            { step: '2', text: 'They sign up using your link and create a free account' },
            { step: '3', text: 'You earn 10% of all their survey earnings automatically' },
            { step: '4', text: 'No limit - refer as many people as you want!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5">{step}</div>
              <p className="text-gray-300 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral list */}
      {stats?.referrals?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-5 border-b border-gray-800"><h2 className="text-white font-bold">My Referrals</h2></div>
          <div className="divide-y divide-gray-800">
            {stats.referrals.map(ref => (
              <div key={ref._id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {ref.referee?.firstName?.[0]}{ref.referee?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{ref.referee?.firstName} {ref.referee?.lastName}</div>
                  <div className="text-gray-500 text-xs">{new Date(ref.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">+₦{ref.commissionEarned}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {stats?.leaderboard?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-5 border-b border-gray-800"><h2 className="text-white font-bold">🏆 Top Referrers</h2></div>
          <div className="divide-y divide-gray-800">
            {stats.leaderboard.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0
                  ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    i === 1 ? 'bg-gray-400/20 text-gray-400' :
                    i === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-gray-800 text-gray-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{u.firstName} {u.lastName}</div>
                  <div className="text-gray-500 text-xs">{u.referralCount} referrals</div>
                </div>
                <div className="text-emerald-400 font-bold text-sm">₦{(u.referralEarnings || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
