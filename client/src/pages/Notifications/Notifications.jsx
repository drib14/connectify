import { useState, useEffect } from 'react';
import API from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  HiBell,
  HiHeart,
  HiChat,
  HiUserAdd,
  HiLockClosed,
  HiTrendingUp,
  HiUserGroup,
  HiCalendar,
  HiExclamation,
  HiSearch,
  HiClock,
  HiShieldExclamation,
  HiHand,
  HiSparkles,
  HiInbox
} from 'react-icons/hi';
import { FaShare, FaCheckCircle, FaTrophy, FaAward, FaHandshake, FaRocket, FaAt } from 'react-icons/fa';
import SkeletonLoader from '../../components/UI/SkeletonLoader';

const typeIcons = {
  like: HiHeart,
  comment: HiChat,
  follow: HiUserAdd,
  mention: FaAt,
  share: FaShare,
  trustCircleAdd: HiLockClosed,
  goalUpdate: HiTrendingUp,
  accountabilityCheckIn: FaCheckCircle,
  challengeInvite: FaTrophy,
  communityInvite: HiUserGroup,
  eventReminder: HiCalendar,
  crisisAlert: HiExclamation,
  factCheckResult: HiSearch,
  badgeEarned: FaAward,
  timeCapsuleUnlocked: HiClock,
  burnoutWarning: HiShieldExclamation,
  partnerRequest: FaHandshake,
  volunteerMatch: HiHand,
  projectInvite: FaRocket,
  welcome: HiSparkles
};

const typeColors = {
  like: '#ef4444',
  comment: '#0ea5e9',
  follow: '#a855f7',
  mention: '#10b981',
  share: '#f59e0b',
  trustCircleAdd: '#a855f7',
  goalUpdate: '#10b981',
  accountabilityCheckIn: '#22c55e',
  challengeInvite: '#f59e0b',
  communityInvite: '#0ea5e9',
  eventReminder: '#10b981',
  crisisAlert: '#ef4444',
  factCheckResult: '#0ea5e9',
  badgeEarned: '#f59e0b',
  timeCapsuleUnlocked: '#0ea5e9',
  burnoutWarning: '#f59e0b',
  partnerRequest: '#a855f7',
  volunteerMatch: '#10b981',
  projectInvite: '#0ea5e9',
  welcome: '#00d4aa'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then(({ data }) => setNotifications(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="heading-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <HiBell /> Notifications
        </h1>
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
      </div>

      {loading ? (
        <SkeletonLoader type="notification" count={5} />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiInbox />
          </div>
          <div className="empty-state-title">No notifications</div>
          <div className="empty-state-text">You're all caught up!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          {notifications.map(n => {
            const Icon = typeIcons[n.type] || HiSparkles;
            const color = typeColors[n.type] || 'var(--text-secondary)';
            return (
              <Link
                key={n._id}
                to={n.link || '#'}
                className="card"
                onClick={() => !n.read && markRead(n._id)}
                style={{
                  padding: 'var(--space-md)',
                  textDecoration: 'none',
                  color: 'inherit',
                  opacity: n.read ? 0.6 : 1,
                  borderLeft: !n.read ? '3px solid var(--primary)' : 'none'
                }}
              >
                <div className="flex items-center gap-sm">
                  <span style={{ fontSize: 22, display: 'inline-flex', color }}>
                    <Icon />
                  </span>
                  <div className="flex-1">
                    <p style={{ fontSize: 'var(--text-sm)', marginBottom: 4 }}>{n.message}</p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></div>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
