import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { offerwallAPI } from '../../services/api';

export default function OfferwallPage() {
  const [offerwalls, setOfferwalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    offerwallAPI.getUrls()
      .then(({ data }) => setOfferwalls(data.offerwalls || []))
      .catch(() => toast.error('Failed to load offerwalls.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white">Offer Wall</h1>
        <p className="text-gray-400 text-sm">Complete tasks, install apps, and watch videos to earn more</p>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div className="text-sm text-emerald-300">
          <strong>How it works:</strong> Click an offer wall below to open it. Complete any available offers and your rewards will be automatically credited to your wallet within minutes.
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div className="text-sm text-red-300">
          <strong>Important:</strong> Do NOT login or create account inside the survey walls. Just complete surveys directly without logging in. Logging in will break reward tracking and your earnings will not be credited to your wallet.
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offerwalls.map(ow => (
            <div key={ow.id} className={`bg-gray-900 border rounded-2xl p-6 transition-all
              ${ow.available ? 'border-gray-800 hover:border-emerald-500/30' : 'border-gray-800 opacity-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{ow.icon}</span>
                <div>
                  <h3 className="text-white font-bold">{ow.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ow.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                    {ow.available ? '● Active' : '● Setup Required'}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{ow.description}</p>
              {ow.available ? (
                <button
                  onClick={() => { setActive(ow.id); window.open(ow.url, '_blank'); }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]">
                  Open {ow.name} →
                </button>
              ) : (
                <div className="w-full bg-gray-800 text-gray-500 py-2.5 rounded-xl text-sm text-center">
                  Configure API Key in .env
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {active && offerwalls.find(o => o.id === active)?.available && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">{offerwalls.find(o => o.id === active)?.name}</h3>
            <button onClick={() => setActive(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
          </div>
          <iframe
            src={offerwalls.find(o => o.id === active)?.url}
            title="Offerwall"
            className="w-full h-[600px] border-0"
            allow="camera; microphone"
          />
        </div>
      )}
    </div>
  );
}