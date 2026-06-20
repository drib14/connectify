import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiSparkles, HiShieldCheck, HiCreditCard } from 'react-icons/hi';
import { FaCoins } from 'react-icons/fa';
import ProgressLoader from '../../components/UI/ProgressLoader';

const SubscriptionSettings = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const status = searchParams.get('status');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (status === 'success' && sessionId) {
      verifyCheckout();
    } else if (status === 'cancel') {
      toast.error('Payment checkout was cancelled.');
      // Clean query params
      setSearchParams({});
    }
  }, [status, sessionId]);

  const verifyCheckout = async () => {
    setLoading(true);
    setStatusText('Verifying checkout session with Paymongo...');
    try {
      const { data } = await API.post('/users/verify-payment', { sessionId });
      toast.success(data.message);
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
      setSearchParams({});
    }
  };

  const handleCheckout = async (type, amount) => {
    setLoading(true);
    setStatusText('Preparing checkout session...');
    try {
      const { data } = await API.post('/users/checkout', { type, amount });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Failed to retrieve checkout URL.');
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'left' }}>
      <ProgressLoader progress={100} visible={loading} statusText={statusText} />

      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/settings')} style={{ marginBottom: 'var(--space-md)' }}>
        <HiArrowLeft /> Back to Settings
      </button>

      <h1 className="heading-2" style={{ marginBottom: 'var(--space-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <HiCreditCard style={{ color: 'var(--primary)' }} /> Subscription & Wallet Settings
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
        Connectify operates in a stress-free, privacy-first, ad-free environment. Support the community by subscribing to premium perks or topping up your balance with Paymongo.
      </p>

      {/* Wallet Status Card */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Your Wallet Balance</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(0, 212, 170, 0.05)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Coins Balance</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warm)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🪙</span> {user?.coins || 0} Peace Coins
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(147, 51, 234, 0.05)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Subscription Tier</span>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d946ef', marginTop: '4px' }}>
              {user?.isPremium ? '★ Premium Member' : 'Standard Tier (Free)'}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Features Card */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Exclusive Premium Features</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '20px', color: '#d946ef' }}>★</div>
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Pulsing Glow Border Ring</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Premium users display a gold/purple glowing boundary around their avatar throughout the platform, highlighting their support.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '20px', color: 'var(--primary)' }}><HiShieldCheck /></div>
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Zero Advertisements</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Enjoy 100% ad-free scrolling without promotional banners, cookies tracking, or algorithms forcing products.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '20px', color: 'var(--warm)' }}><HiSparkles /></div>
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Milestone Points Boost</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Get `+20` Contribution points immediately upon activation to boost your standing in search listings and trust ratings.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {/* Premium Plan */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08), rgba(236, 72, 153, 0.08))', border: '1px solid rgba(147, 51, 234, 0.25)', position: 'relative' }}>
          <span className="badge badge-accent" style={{ position: 'absolute', top: '16px', right: '16px' }}>POPULAR</span>
          <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#d946ef', marginBottom: '4px' }}>Connectify Premium</h4>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Mindfulness & customizations</span>
          <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '16px 0', color: 'var(--text-primary)' }}>
            PHP 499 <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-tertiary)' }}>/ month</span>
          </div>
          <button className="btn btn-primary w-full" disabled={loading || user?.isPremium} onClick={() => handleCheckout('premium')}>
            {user?.isPremium ? 'Active Plan' : 'Upgrade via Paymongo'}
          </button>
        </div>
      </div>

      {/* Coins Package TOP UP */}
      <div className="card">
        <h3 className="heading-4" style={{ marginBottom: 'var(--space-xs)' }}>Purchase Peace Coins</h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)' }}>
          Coins are used to tip posts and comment authors. Tipping is anonymous by default and increases the contribution score of both parties.
        </p>

        <div className="flex flex-col gap-sm">
          {[
            { amount: 100, price: 'PHP 249', pts: '+5' },
            { amount: 500, price: 'PHP 999', pts: '+5' },
            { amount: 1000, price: 'PHP 1,749', pts: '+5' },
          ].map(pack => (
            <div key={pack.amount} className="card flex items-center justify-between" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.015)', margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🪙</span>
                <div>
                  <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>{pack.amount} Peace Coins</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Earns {pack.pts} Contribution Points</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" disabled={loading} onClick={() => handleCheckout('coins', pack.amount)}>
                {pack.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
