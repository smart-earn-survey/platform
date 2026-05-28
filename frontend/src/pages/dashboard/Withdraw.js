import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { withdrawalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WithdrawPage() {
  const { user, refreshUser } = useAuth();
  const [banks, setBanks] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({ amount: '', method: 'bank_transfer', bankName: '', accountNumber: '', accountName: '', bankCode: '' });
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=bank, 3=confirm

  const MIN = 500;

  useEffect(() => {
    Promise.all([withdrawalAPI.getBanks(), withdrawalAPI.getWithdrawals()])
      .then(([banksRes, wdRes]) => {
        setBanks(banksRes.data.banks || []);
        setWithdrawals(wdRes.data.withdrawals || []);
      }).catch(() => {});

    // Pre-fill saved bank
    if (user?.bankDetails?.accountNumber) {
      setForm(p => ({ ...p, ...user.bankDetails }));
    }
  }, []);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleVerifyBank = async () => {
    if (!form.accountNumber || !form.bankCode) return toast.error('Enter account number and bank.');
    setVerifying(true);
    try {
      const { data } = await withdrawalAPI.verifyBank({ accountNumber: form.accountNumber, bankCode: form.bankCode });
      setForm(p => ({ ...p, accountName: data.accountName }));
      const bank = banks.find(b => b.code === form.bankCode);
      if (bank) setForm(p => ({ ...p, bankName: bank.name }));
      toast.success(`Account verified: ${data.accountName}`);
    } catch {
      toast.error('Could not verify account. Check details.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) < MIN) return toast.error(`Minimum withdrawal is ₦${MIN}.`);
    if (parseFloat(form.amount) > user?.wallet?.balance) return toast.error('Insufficient balance.');
    if (!form.accountName) return toast.error('Please verify your bank account first.');

    setLoading(true);
    try {
      await withdrawalAPI.requestWithdrawal({
        amount: parseFloat(form.amount),
        method: form.method,
        bankDetails: { bankName: form.bankName, accountNumber: form.accountNumber, accountName: form.accountName, bankCode: form.bankCode },
      });
      toast.success('Withdrawal request submitted! Processing within 24 hours.');
      refreshUser();
      setStep(1);
      setForm(p => ({ ...p, amount: '' }));
      const { data } = await withdrawalAPI.getWithdrawals();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_STYLES = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    approved: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Withdraw Funds</h1>
        <p className="text-gray-400 text-sm">Minimum withdrawal: ₦{MIN} · Processing fee: ₦50</p>
      </div>

      {/* Balance */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4">
        <span className="text-3xl">💰</span>
        <div>
          <div className="text-emerald-400 font-black text-2xl">₦{(user?.wallet?.balance || 0).toLocaleString()}</div>
          <div className="text-emerald-300/70 text-sm">Available Balance</div>
        </div>
      </div>

      {!user?.isEmailVerified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-yellow-400 text-sm">
          ⚠️ Please verify your email before withdrawing.
        </div>
      )}

      {/* Withdrawal Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-bold">Request Withdrawal</h2>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₦)</label>
          <input type="number" value={form.amount} onChange={set('amount')} min={MIN} max={user?.wallet?.balance}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder={`Min ₦${MIN}`} />
          {form.amount && parseFloat(form.amount) >= MIN && (
            <p className="text-gray-400 text-xs mt-1">You'll receive: ₦{(parseFloat(form.amount) - 50).toLocaleString()} (after ₦50 fee)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Bank</label>
          <select value={form.bankCode} onChange={e => {
            const bank = banks.find(b => b.code === e.target.value);
            setForm(p => ({ ...p, bankCode: e.target.value, bankName: bank?.name || '', accountName: '' }));
          }}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors">
            <option value="">Select Bank</option>
            {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
          <div className="flex gap-3">
            <input type="text" value={form.accountNumber} onChange={set('accountNumber')} maxLength={10}
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="10-digit account number" />
            <button onClick={handleVerifyBank} disabled={verifying}
              className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold transition-all whitespace-nowrap disabled:opacity-50">
              {verifying ? '⏳ Verifying...' : '🔍 Verify'}
            </button>
          </div>
        </div>

        {form.accountName && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-sm font-medium">
            ✅ {form.accountName} - {form.bankName}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !user?.isEmailVerified || !form.accountName}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02]">
          {loading ? '⏳ Processing...' : `Withdraw ₦${form.amount || '0'}`}
        </button>
      </div>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-white font-bold">Withdrawal History</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {withdrawals.map(wd => (
              <div key={wd._id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏦</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">₦{wd.amount.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">{wd.bankDetails?.bankName} · {wd.bankDetails?.accountNumber}</div>
                  <div className="text-gray-600 text-xs">{new Date(wd.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[wd.status]}`}>
                  {wd.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
