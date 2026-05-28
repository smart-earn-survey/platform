import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { walletAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CAT_COLORS = {
  survey: 'text-emerald-400 bg-emerald-400/10',
  offer: 'text-blue-400 bg-blue-400/10',
  referral: 'text-purple-400 bg-purple-400/10',
  daily_bonus: 'text-yellow-400 bg-yellow-400/10',
  spin_wheel: 'text-pink-400 bg-pink-400/10',
  signup_bonus: 'text-green-400 bg-green-400/10',
  withdrawal: 'text-red-400 bg-red-400/10',
  admin_credit: 'text-cyan-400 bg-cyan-400/10',
  admin_debit: 'text-orange-400 bg-orange-400/10',
};

const CAT_ICONS = {
  survey: '📋', offer: '🎯', referral: '👥', daily_bonus: '📅',
  spin_wheel: '🎰', signup_bonus: '🎉', withdrawal: '🏦',
  admin_credit: '⬆️', admin_debit: '⬇️',
};

export default function WalletPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('');

  const fetchTxns = async (p = 1, cat = '') => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (cat) params.category = cat;
      const { data } = await walletAPI.getTransactions(params);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || {});
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTxns(page, filter); }, [page, filter]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white">My Wallet</h1>
        <p className="text-gray-400 text-sm">Manage your earnings and transactions</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Available Balance', value: user?.wallet?.balance || 0, icon: '💰', color: 'emerald', action: { label: 'Withdraw', to: '/dashboard/withdraw' } },
          { label: 'Pending Balance', value: user?.wallet?.pendingBalance || 0, icon: '⏳', color: 'yellow', action: null },
          { label: 'Total Earned', value: user?.wallet?.totalEarned || 0, icon: '📈', color: 'blue', action: null },
        ].map(({ label, value, icon, color, action }) => (
          <div key={label} className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-${color}-500/20 transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              {action && (
                <Link to={action.to} className={`text-xs font-semibold text-${color}-400 hover:text-${color}-300 transition-colors`}>
                  {action.label} →
                </Link>
              )}
            </div>
            <div className={`text-2xl font-black text-${color}-400`}>₦{value.toLocaleString()}</div>
            <div className="text-gray-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-white font-bold flex-1">Transaction History</h2>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
            <option value="">All Types</option>
            {Object.keys(CAT_ICONS).map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-800 rounded mb-2 w-3/4" />
                  <div className="h-2 bg-gray-800 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-800 rounded w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <div className="text-4xl mb-3">💳</div>
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {transactions.map(txn => (
              <div key={txn._id} className="flex items-center gap-3 p-4 hover:bg-gray-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${CAT_COLORS[txn.category] || 'bg-gray-700'}`}>
                  {CAT_ICONS[txn.category] || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium line-clamp-1">{txn.description}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {new Date(txn.createdAt).toLocaleString()} · {txn.reference}
                  </div>
                </div>
                <div className={`font-bold text-sm flex-shrink-0 ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-xl text-sm transition-all">
              ← Previous
            </button>
            <span className="text-gray-400 text-sm">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-xl text-sm transition-all">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
