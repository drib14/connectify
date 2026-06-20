import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiCog, HiHeart, HiLogout, HiArrowRight, HiCreditCard } from 'react-icons/hi';
import { FaUserSecret, FaBrain, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/UI/ConfirmModal';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cards = [
    {
      title: 'Profile Settings',
      description: 'Update your display names, biography details, website link, cover photo, and avatar.',
      icon: HiUser,
      path: '/settings/profile',
      color: '#0ea5e9',
    },
    {
      title: 'Subscription & Wallet',
      description: 'Upgrade to Premium, buy Peace Coins, view balance, and configure Paymongo billing.',
      icon: HiCreditCard,
      path: '/settings/subscription',
      color: '#d946ef',
    },
    {
      title: 'Wellbeing & Limits',
      description: 'Toggle Like-Free mode, configure Slow Feed scrolling limits, and daily usage warnings.',
      icon: FaBrain,
      path: '/settings/wellbeing',
      color: '#a855f7',
    },
    {
      title: 'Privacy Dashboard',
      description: 'Review visibility stats, who sees your posts, and configure trust circle sizes.',
      icon: FaUserShield,
      path: '/settings/privacy',
      color: '#00d4aa',
    },
    {
      title: 'Digital Legacy',
      description: 'Designate legatee email contacts and instructions in case of passing.',
      icon: HiHeart,
      path: '/settings/legacy',
      color: '#ef4444',
    },
    {
      title: 'Disposable Profiles',
      description: 'Generate temporary alias profiles for individual community postings.',
      icon: FaUserSecret,
      path: '/settings/disposable',
      color: '#f59e0b',
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Log Out"
        message="Are you sure you want to log out of Connectify?"
        confirmText="Log Out"
      />

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <HiCog /> Settings Portal
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="card card-interactive"
              onClick={() => navigate(card.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md) var(--space-lg)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: card.color,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <Icon />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px' }}>{card.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{card.description}</p>
                </div>
              </div>
              <HiArrowRight style={{ color: 'var(--text-tertiary)' }} />
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', textAlign: 'center' }}>
        <button className="btn btn-danger" onClick={() => setShowLogoutConfirm(true)} style={{ minWidth: '150px' }}>
          <HiLogout /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
