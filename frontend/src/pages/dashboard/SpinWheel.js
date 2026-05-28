import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { walletAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PRIZES = [
  { label: '₦5', amount: 5, color: '#10b981' },
  { label: '₦10', amount: 10, color: '#3b82f6' },
  { label: '₦20', amount: 20, color: '#8b5cf6' },
  { label: '₦50', amount: 50, color: '#f59e0b' },
  { label: '₦100', amount: 100, color: '#ef4444' },
  { label: '₦200', amount: 200, color: '#ec4899' },
  { label: '₦500', amount: 500, color: '#14b8a6' },
  { label: '₦5', amount: 5, color: '#10b981' },
];

export default function SpinWheelPage() {
  const { user, refreshUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const wheelRef = useRef(null);

  const today = new Date().toDateString();
  const lastSpin = user?.lastSpinDate ? new Date(user.lastSpinDate).toDateString() : null;
  const canSpin = lastSpin !== today;

  const handleSpin = async () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const { data } = await walletAPI.spinWheel();
      const prizeIdx = data.prizeIndex;
      const segmentAngle = 360 / PRIZES.length;
      const targetAngle = 360 - (prizeIdx * segmentAngle + segmentAngle / 2);
      const newRotation = rotation + 1800 + targetAngle;

      setRotation(newRotation);

      setTimeout(() => {
        setResult(data);
        setHistory(h => [data.prize, ...h.slice(0, 9)]);
        toast.success(`🎉 ${data.message}`);
        refreshUser();
        setSpinning(false);
      }, 4500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Spin failed.');
      setSpinning(false);
    }
  };

  const segmentAngle = 360 / PRIZES.length;

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-black text-white">🎰 Spin Wheel</h1>
        <p className="text-gray-400 text-sm mt-1">Spin once daily to win bonus cash up to ₦500!</p>
      </div>

      {/* Wheel */}
      <div className="relative flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
        </div>

        {/* Wheel SVG */}
        <svg
          ref={wheelRef}
          width="300" height="300" viewBox="0 0 300 300"
          style={{
            transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.21, 1)' : 'none',
            transform: `rotate(${rotation}deg)`,
          }}
          className="drop-shadow-2xl"
        >
          {PRIZES.map((prize, i) => {
            const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);
            const cx = 150, cy = 150, r = 140;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const midAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180);
            const tx = cx + 90 * Math.cos(midAngle);
            const ty = cy + 90 * Math.sin(midAngle);

            return (
              <g key={i}>
                <path
                  d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                  fill={prize.color}
                  stroke="#1a1a2e"
                  strokeWidth="2"
                />
                <text
                  x={tx} y={ty}
                  textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${(i + 0.5) * segmentAngle}, ${tx}, ${ty})`}
                  fill="white" fontSize="13" fontWeight="bold"
                >
                  {prize.label}
                </text>
              </g>
            );
          })}
          <circle cx="150" cy="150" r="20" fill="#1a1a2e" stroke="#10b981" strokeWidth="3" />
          <circle cx="150" cy="150" r="10" fill="#10b981" />
        </svg>
      </div>

      {/* Result */}
      {result && !spinning && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center animate-bounce-once">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-emerald-400 font-black text-3xl">{result.prize.label}</div>
          <div className="text-emerald-300 mt-1">Added to your wallet!</div>
        </div>
      )}

      {/* Spin Button */}
      <div className="text-center">
        {canSpin ? (
          <button onClick={handleSpin} disabled={spinning}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white px-10 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-lg shadow-emerald-900/50">
            {spinning ? '🌀 Spinning...' : '🎰 SPIN NOW!'}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-10 py-4 text-gray-400 font-bold text-lg inline-block">
              ✅ Already Spun Today
            </div>
            <p className="text-gray-500 text-sm mt-2">Come back tomorrow for another spin!</p>
          </div>
        )}
      </div>

      {/* Prizes Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-white font-bold mb-4">Prize Table</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { prize: '₦5', chance: 'Common' },
            { prize: '₦10', chance: 'Common' },
            { prize: '₦20', chance: 'Uncommon' },
            { prize: '₦50', chance: 'Uncommon' },
            { prize: '₦100', chance: 'Rare' },
            { prize: '₦200', chance: 'Very Rare' },
            { prize: '₦500', chance: 'Jackpot' },
          ].map(({ prize, chance }) => (
            <div key={prize} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-3 py-2">
              <span className="text-emerald-400 font-bold text-sm">{prize}</span>
              <span className="text-gray-500 text-xs">{chance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
