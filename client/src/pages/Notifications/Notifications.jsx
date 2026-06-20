import { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const typeIcons = { like: '❤️', comment: '💬', follow: '👤', mention: '@', share: '🔄', trustCircleAdd: '🔒', goalUpdate: '🎯', accountabilityCheckIn: '✅', challengeInvite: '🏆', communityInvite: '🌍', eventReminder: '📅', crisisAlert: '🚨', factCheckResult: '🔍', badgeEarned: '🏅', timeCapsuleUnlocked: '⏰', burnoutWarning: '🧘', partnerRequest: '🤝', volunteerMatch: '🤲', projectInvite: '🚀', welcome: '🎉' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { API.get('/notifications').then(({ data }) => setNotifications(data.notifications)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(n => n.map(x => x._id === id ? { ...x, read: true } : x));
  };

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2">🔔 Notifications</h1>
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
      </div>

      {loading ? <div className="loader"><div className="spinner spinner-lg"></div></div> : notifications.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-title">No notifications</div><div className="empty-state-text">You're all caught up!</div></div>
      ) : (
        <div className="flex flex-col gap-xs">
          {notifications.map(n => (
            <Link key={n._id} to={n.link || '#'} className="card" onClick={() => !n.read && markRead(n._id)} style={{ padding: 'var(--space-md)', textDecoration: 'none', color: 'inherit', opacity: n.read ? 0.6 : 1, borderLeft: !n.read ? '3px solid var(--primary)' : 'none' }}>
              <div className="flex items-center gap-sm">
                <span style={{ fontSize: 22 }}>{typeIcons[n.type] || '📌'}</span>
                <div className="flex-1">
                  <p style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>{n.message}</p>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
