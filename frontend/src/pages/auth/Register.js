/**
 * Register Page
 */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    referralCode: refCode, country: 'Nigeria',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      return toast.error('Please fill all required fields.');
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success('🎉 Welcome! You earned ₦50 signup bonus!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/50 via-gray-950 to-gray-950" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-2xl">💰</div>
            <span className="font-black text-2xl text-white">Smart<span className="text-emerald-400">Earn</span></span>
          </Link>
          <h1 className="text-3xl font-black text-white">Create Free Account</h1>
          <p className="text-gray-400 mt-2">Get ₦50 welcome bonus instantly!</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="John" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Doe" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" value={form.email} onChange={set('email')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="you@example.com" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                <select value={form.country} onChange={set('country')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors">
                  <option>Nigeria</option>
                  <option>Ghana</option>
                  <option>Kenya</option>
                  <option>South Africa</option>
                  <option>Other</option>
                </select>
              </div>

              {refCode && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                  <p className="text-emerald-400 text-sm font-medium">🎁 Referral code applied: <strong>{refCode}</strong></p>
                </div>
              )}

              <button type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3.5 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]">
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors pr-12"
                    placeholder="Min. 6 characters" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Referral Code (Optional)</label>
                <input type="text" value={form.referralCode} onChange={set('referralCode')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                  placeholder="e.g. SE123456" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-semibold transition-all">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-2 flex-grow bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : 'Create Account 🎉'}
                </button>
              </div>

              <p className="text-gray-500 text-xs text-center">
                By registering, you agree to our{' '}
                <a href="#" className="text-emerald-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>
              </p>
            </form>
          )}

          <div className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
