import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center text-2xl">💰</div>
          <span className="font-black text-2xl text-white">Smart<span className="text-emerald-400">Earn</span></span>
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">
          {status === 'loading' && (
            <div>
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <p className="text-white text-xl font-bold">Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div className="text-7xl mb-4">✅</div>
              <h2 className="text-2xl font-black text-white mb-3">Email Verified!</h2>
              <p className="text-gray-400 mb-8">Your account is now active. Start earning today!</p>
              <Link to="/login" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition-all">
                Login Now
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div className="text-7xl mb-4">❌</div>
              <h2 className="text-2xl font-black text-white mb-3">Verification Failed</h2>
              <p className="text-gray-400 mb-8">The link is invalid or has expired. Please request a new verification email.</p>
              <Link to="/login" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition-all">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
