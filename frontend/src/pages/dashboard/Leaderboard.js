import React, { useState, useEffect } from 'react';
import { referralAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralAPI.getStats()
      .then(({ data }) => setLeaderboard(data.leaderboard || []))
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">🏆 Leaderboard</h1>
        <p className="text-gray-400 text-sm">Top earners and referrers on Smart Earn Survey</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="flex-1"><div className="h-4 bg-gray-800 rounded w-1/3" /></div>
                <div className="h-4 bg-gray-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
          <p className="text-gray-400">Start referring friends to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((u, i) => (
            <div key={u._id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                ${i === 0 ? 'bg-yellow-500/5 border-yellow-500/20' :
                  i === 1 ? 'bg-gray-400/5 border-gray-400/20' :
                  i === 2 ? 'bg-amber-700/5 border-amber-700/20' :
                  'bg-gray-900 border-gray-800'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0
                ${i < 3 ? '' : 'bg-gray-800 text-gray-500 text-sm'}`}>
                {i < 3 ? medals[i] : i + 1}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {u.firstName?.[0]}{u.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold truncate ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-700' : 'text-white'}`}>
                  {u.firstName} {u.lastName}
                </div>
                <div className="text-gray-500 text-xs">{u.referralCount} referrals</div>
              </div>
              <div className="text-emerald-400 font-black">₦{(u.referralEarnings || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
