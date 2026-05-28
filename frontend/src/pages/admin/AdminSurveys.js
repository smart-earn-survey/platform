import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const EMPTY_FORM = {
  title: '', description: '', category: 'general', reward: '',
  estimatedTime: '', url: '', provider: 'manual', difficulty: 'easy',
  isActive: true, completionLimit: '',
};

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getSurveys();
      setSurveys(data.surveys || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSurveys(); }, []);

  const set = (key) => (e) => setForm(p => ({
    ...p,
    [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('form'); };
  const openEdit = (survey) => {
    setForm({ ...survey, reward: survey.reward?.toString(), estimatedTime: survey.estimatedTime?.toString() });
    setEditId(survey._id);
    setModal('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.reward || !form.estimatedTime || !form.url) {
      return toast.error('Please fill all required fields.');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        reward: parseFloat(form.reward),
        estimatedTime: parseInt(form.estimatedTime),
        completionLimit: form.completionLimit ? parseInt(form.completionLimit) : null,
      };
      if (editId) {
        await adminAPI.updateSurvey(editId, payload);
        toast.success('Survey updated!');
      } else {
        await adminAPI.createSurvey(payload);
        toast.success('Survey created!');
      }
      setModal(null);
      fetchSurveys();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save survey.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this survey? This cannot be undone.')) return;
    try {
      await adminAPI.deleteSurvey(id);
      toast.success('Survey deleted.');
      fetchSurveys();
    } catch {
      toast.error('Failed to delete survey.');
    }
  };

  const handleToggleActive = async (survey) => {
    try {
      await adminAPI.updateSurvey(survey._id, { isActive: !survey.isActive });
      toast.success(`Survey ${survey.isActive ? 'deactivated' : 'activated'}.`);
      fetchSurveys();
    } catch {
      toast.error('Failed to update survey.');
    }
  };

  const CAT_ICONS = { general: '📋', technology: '💻', health: '🏥', finance: '💰', lifestyle: '🌟', entertainment: '🎬', education: '📚', food: '🍕', travel: '✈️' };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Survey Management</h1>
          <p className="text-gray-400 text-sm">{surveys.length} surveys total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105">
          + Create Survey
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-800 rounded mb-4 w-1/2" />
              <div className="h-8 bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-white mb-2">No Surveys Yet</h3>
          <p className="text-gray-400 mb-6">Create your first survey to get started</p>
          <button onClick={openCreate}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            + Create Survey
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map(survey => (
            <div key={survey._id}
              className={`bg-gray-900 border rounded-2xl p-5 transition-all
                ${survey.isActive ? 'border-gray-800 hover:border-emerald-500/30' : 'border-gray-800 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CAT_ICONS[survey.category] || '📋'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${survey.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                    {survey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-emerald-400 font-black">₦{survey.reward}</div>
              </div>

              <h3 className="text-white font-bold mb-1 line-clamp-2 text-sm">{survey.title}</h3>
              <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                <span>⏱️ {survey.estimatedTime}m</span>
                <span className="capitalize">📁 {survey.category}</span>
                <span>👥 {survey.totalCompletions || 0} done</span>
              </div>

              <div className="text-xs text-gray-600 mb-4 capitalize">
                Provider: <span className="text-gray-400">{survey.provider}</span> · 
                Difficulty: <span className="text-gray-400">{survey.difficulty}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(survey)}
                  className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold transition-all">
                  ✏️ Edit
                </button>
                <button onClick={() => handleToggleActive(survey)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                    ${survey.isActive ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'}`}>
                  {survey.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
                <button onClick={() => handleDelete(survey._id)}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-all">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-white font-bold text-lg mb-5">
              {editId ? 'Edit Survey' : 'Create New Survey'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input value={form.title} onChange={set('title')} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Survey title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={form.description} onChange={set('description')}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  rows={2} placeholder="Brief description..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reward (₦) *</label>
                  <input type="number" value={form.reward} onChange={set('reward')} required min={1}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time (min) *</label>
                  <input type="number" value={form.estimatedTime} onChange={set('estimatedTime')} required min={1}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. 10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Survey URL *</label>
                <input type="url" value={form.url} onChange={set('url')} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="https://..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select value={form.category} onChange={set('category')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                    {['general', 'technology', 'health', 'finance', 'lifestyle', 'entertainment', 'education', 'food', 'travel'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select value={form.difficulty} onChange={set('difficulty')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                  <select value={form.provider} onChange={set('provider')}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                    <option value="manual">Manual</option>
                    <option value="cpx_research">CPX Research</option>
                    <option value="bitlabs">BitLabs</option>
                    <option value="offertoro">OfferToro</option>
                    <option value="adgate">AdGate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Completion Limit</label>
                  <input type="number" value={form.completionLimit} onChange={set('completionLimit')} min={0}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Blank = unlimited" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={set('isActive')}
                  className="w-4 h-4 accent-emerald-500" />
                <label htmlFor="isActive" className="text-sm text-gray-300">Active (visible to users)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-sm transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-all">
                  {saving ? 'Saving...' : editId ? 'Update Survey' : 'Create Survey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
