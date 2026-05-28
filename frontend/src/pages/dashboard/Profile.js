// ===== Profile.js =====
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', country: user?.country || 'Nigeria' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const setPw = (key) => (e) => setPwForm(p => ({ ...p, [key]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match.');
    setChangingPw(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-gray-400 text-sm">Manage your account settings</p>
      </div>

      {/* Avatar + Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-black text-2xl">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user?.isEmailVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {user?.isEmailVerified ? '✅ Verified' : '⚠️ Unverified'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-5">Edit Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input value={form.firstName} onChange={set('firstName')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input value={form.lastName} onChange={set('lastName')}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input value={form.phone} onChange={set('phone')}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="+234 xxx xxxx xxx" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-5">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input type="password" value={pwForm[field]} onChange={setPw(field)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={changingPw}
            className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            {changingPw ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Account Info</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Referral Code', value: user?.referralCode, mono: true },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '' },
            { label: 'Total Surveys', value: user?.surveysCompleted || 0 },
            { label: 'Login Streak', value: `${user?.dailyBonusStreak || 0} days 🔥` },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <span className="text-gray-400">{label}</span>
              <span className={`text-white font-medium ${mono ? 'font-mono text-emerald-400' : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
