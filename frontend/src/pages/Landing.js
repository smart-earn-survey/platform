/**
 * Landing Page - Smart Earn Survey
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

const NAV_LINKS = ['How It Works', 'Features', 'Testimonials', 'FAQ'];

const FEATURES = [
  { icon: '📋', title: 'Paid Surveys', desc: 'Complete targeted surveys from top research companies and earn instantly.' },
  { icon: '🎯', title: 'Offer Walls', desc: 'Try apps, watch videos, and complete tasks for bonus rewards.' },
  { icon: '👥', title: 'Referral Program', desc: 'Earn 10% commission on every friend you invite. No limit!' },
  { icon: '💸', title: 'Instant Payments', desc: 'Withdraw to your Nigerian bank, Opay, or Kuda instantly.' },
  { icon: '🎰', title: 'Spin & Win', desc: 'Spin the wheel daily for bonus cash up to ₦500!' },
  { icon: '📅', title: 'Daily Bonuses', desc: 'Log in daily to claim your streak bonus and extra rewards.' },
];

const STEPS = [
  { step: '01', title: 'Create Free Account', desc: 'Sign up in 60 seconds with your email and get ₦50 welcome bonus!' },
  { step: '02', title: 'Complete Surveys', desc: 'Browse available surveys, complete them at your pace.' },
  { step: '03', title: 'Earn & Withdraw', desc: 'Accumulate earnings and withdraw to your bank anytime.' },
];

const TESTIMONIALS = [
  { name: 'Chioma A.', location: 'Lagos', amount: '₦45,000', text: 'I earned ₦45,000 in my first month! The surveys are easy and payments are instant.', avatar: '👩🏾' },
  { name: 'Emeka O.', location: 'Abuja', amount: '₦28,500', text: 'Legit platform. I withdrew ₦28,500 to my GTB account within minutes.', avatar: '👨🏿' },
  { name: 'Fatima M.', location: 'Kano', amount: '₦62,000', text: 'The referral program is amazing. My referrals alone earned me ₦62,000!', avatar: '👩🏽' },
  { name: 'Tunde B.', location: 'Port Harcourt', amount: '₦19,800', text: 'Simple, clean, and pays well. Much better than other survey sites I tried.', avatar: '👨🏾' },
];

const FAQS = [
  { q: 'Is Smart Earn Survey free to join?', a: 'Yes! Registration is completely free and you even get a ₦50 welcome bonus just for signing up.' },
  { q: 'How much can I earn per survey?', a: 'Survey rewards range from ₦5 to ₦500+ depending on length and complexity. Most surveys take 5-20 minutes.' },
  { q: 'How do I withdraw my earnings?', a: 'You can withdraw to any Nigerian bank account, Opay, Kuda, or PalmPay. Minimum withdrawal is ₦500.' },
  { q: 'How long does withdrawal take?', a: 'Most withdrawals are processed within 24 hours. Bank transfers via Paystack are often instant.' },
  { q: 'Can I earn from referrals?', a: 'Yes! You earn 10% commission on every survey your referrals complete. Unlimited referrals, unlimited earnings!' },
  { q: 'Are my earnings secured?', a: 'Absolutely. All transactions are encrypted and secured. We use industry-standard security measures.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg shadow-emerald-900/20' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center text-lg">💰</div>
              <span className="font-bold text-xl text-white">Smart<span className="text-emerald-400">Earn</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium">
                  {link}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block text-gray-300 hover:text-white text-sm font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-900/40">
                Get Started Free
              </Link>
              <button className="md:hidden p-2 text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                  className="block py-2 text-gray-300 hover:text-emerald-400 transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  {link}
                </a>
              ))}
              <Link to="/login" className="block py-2 text-gray-300" onClick={() => setMobileOpen(false)}>Login</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />

        <div className="relative max-w-5xl mx-auto px-4 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-4 py-2 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            ₦50 Welcome Bonus for New Members
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Answer Surveys,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Earn Daily
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nigeria's most trusted survey earning platform. Complete surveys, do tasks, spin the wheel, and withdraw to your bank instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-emerald-900/50">
              Start Earning Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all">
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: 25000, suffix: '+', label: 'Active Members' },
              { value: 150, prefix: '₦', suffix: 'M+', label: 'Total Paid Out' },
              { value: 500, suffix: '+', label: 'Daily Surveys' },
              { value: 98, suffix: '%', label: 'Satisfaction Rate' },
            ].map(({ value, prefix = '', suffix, label }) => (
              <div key={label} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 backdrop-blur">
                <div className="text-3xl font-black text-emerald-400">
                  {prefix}<CountUp end={value} duration={2.5} separator="," />{suffix}
                </div>
                <div className="text-gray-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Start earning in just 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="relative bg-gray-800/50 border border-gray-700 rounded-3xl p-8 text-center hover:border-emerald-500/50 transition-all group">
                <div className="text-6xl font-black text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors mb-4">{step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Everything You Need to Earn</h2>
            <p className="text-gray-400 text-lg">Multiple ways to maximize your earnings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all group">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ───────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">What Our Members Say</h2>
            <p className="text-gray-400 text-lg">Real people, real earnings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ name, location, amount, text, avatar }) => (
              <div key={name} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{avatar}</div>
                    <div>
                      <div className="font-bold text-white">{name}</div>
                      <div className="text-gray-400 text-sm">{location}</div>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-black text-lg">{amount}</div>
                </div>
                <p className="text-gray-300 leading-relaxed">"{text}"</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-950">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button className="w-full p-6 flex items-center justify-between text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-white">{q}</span>
                  <span className={`text-emerald-400 text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-gray-800 pt-4">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-emerald-900/50 to-gray-900 border-y border-emerald-900/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-400 text-lg mb-8">Join 25,000+ Nigerians earning daily on Smart Earn Survey</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 shadow-2xl shadow-emerald-900/50">
            Create Free Account → Get ₦50 Bonus
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center">💰</div>
                <span className="font-bold text-xl">Smart<span className="text-emerald-400">Earn</span></span>
              </div>
              <p className="text-gray-400 text-sm">Answer Surveys and Earn Daily. Nigeria's most trusted earning platform.</p>
              <p className="text-gray-500 text-xs mt-3">Powered by Lee Smart Tech</p>
            </div>
            {[
              { title: 'Platform', links: ['How It Works', 'Features', 'Testimonials', 'FAQ'] },
              { title: 'Earn', links: ['Surveys', 'Offer Wall', 'Referrals', 'Daily Bonus'] },
              { title: 'Support', links: ['Contact Us', 'Privacy Policy', 'Terms of Service', 'Help Center'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-bold text-white mb-4">{title}</h4>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link}><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2024 Smart Earn Survey. All rights reserved.</p>
            <div className="flex gap-4 text-gray-500 text-sm">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
