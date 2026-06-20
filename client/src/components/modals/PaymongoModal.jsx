import React from 'react';
import { X, Shield, Info } from 'lucide-react';

export default function PaymongoModal({ paymongoCheckoutUrl, onClose }) {
  if (!paymongoCheckoutUrl) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}>
      <div className="glass-panel-heavy" style={{ width: '90%', maxWidth: '850px', height: '80%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--premium-gold)" />
            <strong style={{ fontFamily: 'var(--font-display)' }}>Paymongo Secure Sandbox Checkout Portal</strong>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sandbox simulated helper alert bar */}
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px 20px', fontSize: '11px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Info size={14} color="var(--premium-gold)" />
          <span>
            <strong>Sandbox Testing:</strong> Click GCash/Maya/Card to pay. The checkout session automatically triggers Webhooks and updates Premium flags inside database models on success.
          </span>
        </div>

        {/* Iframe */}
        <iframe 
          src={paymongoCheckoutUrl} 
          style={{ width: '100%', flex: 1, border: 'none' }}
          title="Paymongo Checkout Sandbox Frame"
        />

      </div>
    </div>
  );
}
