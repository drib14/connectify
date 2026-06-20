import { useSearchParams } from 'react-router-dom';
import { HiLockClosed, HiCheckCircle } from 'react-icons/hi';
import { useState } from 'react';

const MockCheckout = () => {
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);

  const sessionId = searchParams.get('session_id') || 'cs_mock_default';
  const amount = searchParams.get('amount') || '0';
  const name = searchParams.get('name') || 'Connectify User';
  const description = searchParams.get('description') || 'Product Top-Up';
  const successUrl = searchParams.get('success_url') || '/settings/subscription';
  const cancelUrl = searchParams.get('cancel_url') || '/settings/subscription';

  const handleAuthorize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      window.location.href = successUrl;
    }, 1500);
  };

  const handleCancel = () => {
    window.location.href = cancelUrl;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#131930', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'left' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(90deg, #00d4aa, #0ea5e9)', padding: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiLockClosed style={{ fontSize: '20px', color: '#0a0e1a' }} />
          <strong style={{ color: '#0a0e1a', fontSize: '16px', letterSpacing: '0.5px' }}>Paymongo Sandbox Checkout</strong>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {isProcessing ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Authorizing payment session...</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Connecting securely back to Connectify portal</p>
            </div>
          ) : (
            <>
              {/* Customer */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Customer Details</span>
                <div style={{ fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>{name}</div>
              </div>

              {/* Order Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Item description</span>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{description}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Amount to pay</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00d4aa' }}>PHP {parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Methods */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Select Sandbox Payment Method</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'gcash', label: 'GCash e-Wallet', icon: '📱' },
                    { id: 'maya', label: 'Maya Wallet', icon: '💳' },
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳' }
                  ].map(method => (
                    <label key={method.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: paymentMethod === method.id ? 'rgba(0, 212, 170, 0.08)' : 'rgba(255,255,255,0.02)', border: paymentMethod === method.id ? '1.5px solid #00d4aa' : '1.5px solid rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="radio" name="method" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} style={{ accentColor: '#00d4aa' }} />
                      <span style={{ fontSize: '16px' }}>{method.icon}</span>
                      <strong style={{ fontSize: '13px', fontWeight: 500 }}>{method.label}</strong>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleAuthorize} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #00d4aa, #08a383)', color: '#0a0e1a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Authorize Sandbox Payment
                </button>
                <button onClick={handleCancel} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                  Cancel Checkout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 24px', fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
          <HiLockClosed /> Secure Sandbox Transaction powered by Paymongo
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MockCheckout;
