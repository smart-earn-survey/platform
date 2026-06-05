import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-emerald-400 hover:text-emerald-300 mb-8 inline-block">← Back to Home</Link>
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>Last updated: June 2026</p>
          <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
          <p>We collect information you provide when registering, including your name, email address, and bank account details for payment processing.</p>
          <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
          <p>We use your information to provide our services, process payments, send notifications about surveys and earnings, and improve our platform.</p>
          <h2 className="text-2xl font-bold text-white">3. Information Sharing</h2>
          <p>We do not sell your personal information to third parties. We share necessary information with survey providers to match you with relevant surveys.</p>
          <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
          <p>We implement industry-standard security measures including encryption and secure connections to protect your personal information.</p>
          <h2 className="text-2xl font-bold text-white">5. Cookies</h2>
          <p>We use cookies to maintain your session and improve your experience. You can disable cookies in your browser settings.</p>
          <h2 className="text-2xl font-bold text-white">6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. Contact us at leesmarttech15@gmail.com.</p>
          <h2 className="text-2xl font-bold text-white">7. GDPR Compliance</h2>
          <p>For users in Europe, we comply with GDPR regulations. You have the right to data portability, erasure, and to withdraw consent at any time.</p>
          <h2 className="text-2xl font-bold text-white">8. CCPA Compliance</h2>
          <p>For users in California, we comply with CCPA regulations. You have the right to know what data we collect and request its deletion.</p>
          <h2 className="text-2xl font-bold text-white">9. Contact Us</h2>
          <p>For privacy concerns contact us at leesmarttech15@gmail.com</p>
          <p className="text-gray-500">Powered by Lee Smart Tech</p>
        </div>
      </div>
    </div>
  );
}