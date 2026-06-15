import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';
import API from '../services/api.js';
import { Award, CheckCircle, ShieldAlert, Sparkles, Zap, Music, Star } from 'lucide-react';

const Premium = () => {
  const { user, setUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  // Check query string parameters for PayMongo redirect return
  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (status === 'success' && sessionId) {
      const verifyPayment = async () => {
        setVerifying(true);
        setStatusMessage('Verifying checkout session with PayMongo...');
        try {
          const response = await API.get(`/integrations/paymongo/status/${sessionId}`);
          if (response.data.status === 'paid') {
            setStatusMessage('Upgrade success! You are now Connectify Premium.');
            
            // Refresh local profile context
            const profileRes = await API.get('/auth/me');
            setUser(profileRes.data);
          } else {
            setError('Payment verification pending or unsuccessful. Try again.');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to verify PayMongo payment session.');
        } finally {
          setVerifying(false);
        }
      };
      verifyPayment();
    } else if (status === 'cancelled') {
      setError('Checkout transaction was cancelled.');
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.post('/integrations/paymongo/checkout');
      const { checkoutUrl } = response.data;
      
      // Redirect user to PayMongo hosted payment page sandbox
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      setError('Failed to generate PayMongo billing link.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Title Header */}
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Award size={64} style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Connectify Premium</h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
              Unlock elite canvas capabilities, Aura AI assistance, and music vibes integrations.
            </p>
          </div>

          {/* Payment session check notifications alerts */}
          {(verifying || statusMessage) && (
            <div className="glass-panel" style={{
              padding: '20px',
              border: '1px solid var(--primary)',
              background: 'rgba(99,102,241,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <CheckCircle size={24} className="text-gradient" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="glass-panel" style={{
              padding: '20px',
              border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ef4444',
            }}>
              <ShieldAlert size={24} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* User status screen */}
          {user.isPremium ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid #fbbf24', background: 'rgba(251,191,36,0.04)' }}>
              <Star size={40} style={{ color: '#fbbf24', marginBottom: '12px' }} fill="#fbbf24" />
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>You are a Premium Creator!</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Your Canvas profile banner displays a glowing premium badge. All AI and Spotify features are fully unlocked.
              </p>
            </div>
          ) : (
            <>
              {/* Premium Perks Card */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Perks list</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Star size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Glowing Premium Canvas Badge</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Exhibit a gold badge next to your name on posts, chats, and comments.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Sparkles size={20} style={{ color: 'var(--primary-glow)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Aura AI Assistance</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Unlocks Gemini powered captions generating tool, posts translation, and chatbot workspace.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Music size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Featured Music Vibes</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Featured music cards set directly on your profile banner that visitors can stream.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PayMongo Checkout Button card */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Unlock Life Access</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Secure checkout with PayMongo gateway</span>
                  </div>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24' }}>₱150.00</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || verifying}
                  className="btn-primary"
                  style={{
                    background: 'var(--gold-gradient)',
                    color: 'var(--bg-primary)',
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '15px',
                  }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'Opening PayMongo Checkout...' : 'Upgrade Now'}</span>
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-dark)', textAlign: 'center' }}>
                  Supports Credit Cards, GCash, GrabPay, and Maya. Test sandbox credit cards are accepted.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Premium;
