// ===== AdminWithdrawals.js =====
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getWithdrawals({ status: filter, page, limit: 15 });
      setWithdrawals(data.withdrawals || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, [filter, page]);

  const handleProcess = async (action) => {
    if (!note && action === 'reject') return toast.error('Please provide a rejection reason.');
    setProcessing(true);
    try {
      await adminAPI.processWithdrawal(selected._id, { action, note });
      toast.success(`Withdrawal ${action}d successfully.`);
      setSelected(null);
      setNote('');
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process withdrawal.');
    } finally {
      setProcessing(false);
    }
  };

  const pendingTotal = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Withdrawal Management</h1>
          <p className="text-gray-400 text-sm">{pagination.total || 0} withdrawals · Pending: ₦{pendingTotal.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'approved', 'completed', 'rejected'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all
                ${filter === s ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Amount', 'Net', 'Bank', 'Account', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    No {filter} withdrawals found
                  </td>
                </tr>
              ) : withdrawals.map(wd => (
                <tr key={wd._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium whitespace-nowrap">
                      {wd.user?.firstName} {wd.user?.lastName}
                    </div>
                    <div className="text-gray-500 text-xs truncate max-w-[120px]">{wd.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-yellow-400 font-bold whitespace-nowrap">
                    ₦{wd.amount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-medium whitespace-nowrap">
                    ₦{wd.netAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {wd.bankDetails?.bankName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                    {wd.bankDetails?.accountNumber || '—'}
                    {wd.bankDetails?.accountName && (
                      <div className="text-gray-500 font-sans">{wd.bankDetails.accountName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(wd.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[wd.status]}`}>
                      {wd.status}
                    </span>
                    {wd.rejectionReason && (
                      <div className="text-red-400 text-xs mt-1 max-w-[100px] truncate" title={wd.rejectionReason}>
                        {wd.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {wd.status === 'pending' && (
                      <button onClick={() => { setSelected(wd); setNote(''); }}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all whitespace-nowrap">
                        Process →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

      {/* Process Withdrawal Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-1">Process Withdrawal</h3>
            <p className="text-gray-400 text-sm mb-5">
              {selected.user?.firstName} {selected.user?.lastName} · ₦{selected.amount?.toLocaleString()}
            </p>

            {/* Withdrawal Details */}
            <div className="bg-gray-800 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bank</span>
                <span className="text-white">{selected.bankDetails?.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account</span>
                <span className="text-white font-mono">{selected.bankDetails?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white">{selected.bankDetails?.accountName}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-400">Amount</span>
                <span className="text-yellow-400 font-bold">₦{selected.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fee</span>
                <span className="text-red-400">-₦{selected.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net Payout</span>
                <span className="text-emerald-400 font-bold">₦{selected.netAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note (required for rejection)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                rows={3}
                placeholder="Add a note (optional for approval, required for rejection)..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelected(null); setNote(''); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={() => handleProcess('reject')}
                disabled={processing}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                {processing ? '...' : '✗ Reject'}
              </button>
              <button
                onClick={() => handleProcess('approve')}
                disabled={processing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                {processing ? '...' : '✓ Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
