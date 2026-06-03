import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-emerald-400 hover:text-emerald-300 mb-8 inline-block">← Back to Home</Link>
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>Last updated: June 2026</p>
          <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
          <p>By accessing and using Smart Earn Survey, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          <h2 className="text-2xl font-bold text-white">2. Description of Service</h2>
          <p>Smart Earn Survey is an online rewards platform where users earn money by completing surveys, offers, and tasks. Users are paid in Nigerian Naira directly to their bank accounts.</p>
          <h2 className="text-2xl font-bold text-white">3. User Eligibility</h2>
          <p>You must be at least 18 years old to use this platform. By registering, you confirm that you are at least 18 years of age.</p>
          <h2 className="text-2xl font-bold text-white">4. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account and password.</p>
          <h2 className="text-2xl font-bold text-white">5. Earnings and Payments</h2>
          <p>Earnings are credited to your wallet upon successful completion of surveys and offers. Minimum withdrawal amount is ₦500. Payments are processed within 24-48 hours of approval.</p>
          <h2 className="text-2xl font-bold text-white">6. Prohibited Activities</h2>
          <p>Users are prohibited from creating multiple accounts, providing false information, using automated tools to complete surveys, or engaging in any fraudulent activity.</p>
          <h2 className="text-2xl font-bold text-white">7. Termination</h2>
          <p>We reserve the right to terminate accounts that violate these terms without prior notice. Any earnings in a terminated account may be forfeited.</p>
          <h2 className="text-2xl font-bold text-white">8. Contact</h2>
          <p>For questions about these terms, contact us at leesmarttech15@gmail.com</p>
          <p className="text-gray-500">Powered by Lee Smart Tech</p>
        </div>
      </div>
    </div>
  );
}