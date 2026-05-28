// ===== Surveys.js =====
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { surveyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['all', 'general', 'technology', 'health', 'finance', 'lifestyle', 'entertainment', 'education', 'food', 'travel'];

const CAT_ICONS = {
  general: '📋', technology: '💻', health: '🏥', finance: '💰',
  lifestyle: '🌟', entertainment: '🎬', education: '📚', food: '🍕', travel: '✈️', all: '🔍',
};

export default function SurveysPage() {
  const { refreshUser } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [completing, setCompleting] = useState(null);

  const fetchSurveys = async (cat) => {
    setLoading(true);
    try {
      const params = cat !== 'all' ? { category: cat } : {};
      const { data } = await surveyAPI.getSurveys(params);
      setSurveys(data.surveys || []);
    } catch {
      toast.error('Failed to load surveys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSurveys(category); }, [category]);

  const handleStart = async (survey) => {
    try {
      const { data } = await surveyAPI.startSurvey(survey._id);
      window.open(data.surveyUrl, '_blank');
      // After returning, prompt to mark complete
      setTimeout(() => {
        if (window.confirm('Have you completed the survey?')) {
          handleComplete(survey._id);
        }
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start survey.');
    }
  };

  const handleComplete = async (surveyId) => {
    setCompleting(surveyId);
    try {
      const { data } = await surveyAPI.completeSurvey(surveyId);
      toast.success(`🎉 ${data.message}`);
      refreshUser();
      fetchSurveys(category);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not record completion.');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-white">Available Surveys</h1>
        <p className="text-gray-400 text-sm">Complete surveys to earn rewards</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${category === cat ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
            <span>{CAT_ICONS[cat]}</span>
            <span className="capitalize">{cat}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-800 rounded mb-4 w-1/2" />
              <div className="h-10 bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-2">No Surveys Available</h3>
          <p className="text-gray-400">Check back later for new surveys</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {surveys.map(survey => (
            <div key={survey._id} className={`bg-gray-900 border rounded-2xl p-5 transition-all
              ${survey.isCompleted ? 'border-gray-700 opacity-60' : 'border-gray-800 hover:border-emerald-500/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CAT_ICONS[survey.category] || '📋'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                    ${survey.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                      survey.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'}`}>
                    {survey.difficulty}
                  </span>
                </div>
                <div className="text-emerald-400 font-black text-lg">₦{survey.reward}</div>
              </div>

              <h3 className="text-white font-bold mb-1 line-clamp-2">{survey.title}</h3>
              {survey.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{survey.description}</p>}

              <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                <span>⏱️ {survey.estimatedTime} min</span>
                <span className="capitalize">📁 {survey.category}</span>
                {survey.totalCompletions > 0 && <span>👥 {survey.totalCompletions} done</span>}
              </div>

              {survey.isCompleted ? (
                <div className="flex items-center justify-center gap-2 bg-gray-800 rounded-xl py-2.5 text-gray-500 text-sm">
                  ✅ Completed
                </div>
              ) : (
                <button onClick={() => handleStart(survey)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]">
                  Start Survey →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
