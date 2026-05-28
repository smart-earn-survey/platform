// ===== Notifications.js =====
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../../services/api';

const TYPE_ICONS = { survey: '📋', payment: '💸', referral: '👥', system: '📢', bonus: '🎁', warning: '⚠️' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-gray-400 text-sm">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            ✓ Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded mb-2 w-1/3" />
              <div className="h-3 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-2xl">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
          <p className="text-gray-400">Complete surveys to start receiving notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div key={notif._id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all
                ${!notif.isRead ? 'bg-gray-900 border-emerald-500/20 bg-emerald-500/5' : 'bg-gray-900/50 border-gray-800'}`}>
              <span className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className={`text-sm font-semibold ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>{notif.title}</div>
                  {!notif.isRead && <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{notif.message}</p>
                <p className="text-gray-600 text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
