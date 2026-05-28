// ===== AdminUsers.js =====
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [creditForm, setCreditForm] = useState({ amount: '', type: 'credit', reason: '' });
  const [modal, setModal] = useState(null); // 'ban' | 'balance'

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, search, limit: 15 });
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleBan = async () => {
    try {
      await adminAPI.banUser(selected._id, banReason);
      toast.success(`User ${selected.isBanned ? 'unbanned' : 'banned'} successfully.`);
      setModal(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update user.');
    }
  };

  const handleBalance = async () => {
    if (!creditForm.amount || !creditForm.reason) return toast.error('Fill all fields.');
    try {
      await adminAPI.adjustBalance(selected._id, creditForm);
      toast.success(`Balance ${creditForm.type}ed successfully.`);
      setModal(null);
      setCreditForm({ amount: '', type: 'credit', reason: '' });
      fetchUsers();
    } catch {
      toast.error('Failed to adjust balance.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-gray-400 text-sm">{pagination.total || 0} total users</p>
        </div>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users..."
          className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-full sm:w-64"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Email', 'Balance', 'Surveys', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="text-white font-medium whitespace-nowrap">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">₦{(u.wallet?.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{u.surveysCompleted || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${u.isBanned ? 'bg-red-500/20 text-red-400' :
                        !u.isEmailVerified ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'}`}>
                      {u.isBanned ? 'Banned' : !u.isEmailVerified ? 'Unverified' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setSelected(u); setBanReason(u.banReason || ''); setModal('ban'); }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all
                          ${u.isBanned ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button onClick={() => { setSelected(u); setModal('balance'); }}
                        className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                        Balance
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-xl text-sm">← Previous</button>
            <span className="text-gray-400 text-sm">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white rounded-xl text-sm">Next →</button>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {modal === 'ban' && selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-4">{selected.isBanned ? 'Unban' : 'Ban'} User: {selected.firstName}</h3>
            {!selected.isBanned && (
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Ban Reason</label>
                <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                  rows={3} placeholder="Reason for ban..." />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={handleBan}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all
                  ${selected.isBanned ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'}`}>
                {selected.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {modal === 'balance' && selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-1">Adjust Balance</h3>
            <p className="text-gray-400 text-sm mb-4">{selected.firstName} {selected.lastName} · Current: ₦{(selected.wallet?.balance || 0).toLocaleString()}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Type</label>
                <select value={creditForm.type} onChange={e => setCreditForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none">
                  <option value="credit">Credit (Add money)</option>
                  <option value="debit">Debit (Remove money)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Amount (₦)</label>
                <input type="number" value={creditForm.amount} onChange={e => setCreditForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Reason</label>
                <input type="text" value={creditForm.reason} onChange={e => setCreditForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Reason for adjustment" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={handleBalance} className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
