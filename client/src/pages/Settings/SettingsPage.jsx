import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Volume2 } from 'lucide-react';

export default function SettingsPage({
  activeSettingsSubTab,
  setActiveSettingsSubTab,
  user,
  soundEffectsEnabled,
  handleToggleSound,
  playAlertChime,
  myAds,
  setShowAddAdModal
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '22px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingsIcon size={24} color="var(--color-primary)" />
        <span>Ecosystem Settings Control</span>
      </h2>

      <div className="settings-grid">
        
        {/* Left Side Selector menu */}
        <div className="settings-menu" style={{ borderRight: '1px solid var(--border-glass)', paddingRight: '16px' }}>
          <div onClick={() => setActiveSettingsSubTab('profile')} className={`settings-menu-link ${activeSettingsSubTab === 'profile' ? 'active' : ''}`}>General Settings</div>
          <div onClick={() => setActiveSettingsSubTab('security')} className={`settings-menu-link ${activeSettingsSubTab === 'security' ? 'active' : ''}`}>Security & Privacy</div>
          <div onClick={() => setActiveSettingsSubTab('notifications')} className={`settings-menu-link ${activeSettingsSubTab === 'notifications' ? 'active' : ''}`}>Notifications Sounds</div>
          <div onClick={() => setActiveSettingsSubTab('billing')} className={`settings-menu-link ${activeSettingsSubTab === 'billing' ? 'active' : ''}`}>Ad Manager billing</div>
        </div>

        {/* Right Side config content */}
        <div style={{ paddingLeft: '10px' }}>
          
          {/* General settings Profile edits */}
          {activeSettingsSubTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>General Connection Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Display User Username</label>
                <input type="text" value={user.username} disabled style={{ background: 'rgba(255,255,255,0.01)', color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Primary Email Address</label>
                <input type="text" value={user.email} disabled style={{ background: 'rgba(255,255,255,0.01)', color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>To update profile pictures or custom cover banners, please visit the My Profile settings section.</p>
            </div>
          )}

          {/* Security settings */}
          {activeSettingsSubTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Security Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Account Lock Verification</label>
                <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}>
                  <ShieldCheck size={16} /> 🛡️ Secure Active Session
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 'bold' }}>Block Connection Directory:</span>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Your block lists queue is currently empty.
                </div>
              </div>
            </div>
          )}

          {/* Notification audio sound settings toggles */}
          {activeSettingsSubTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Sounds Tones Control</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="var(--color-primary)" />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block' }}>Web Audio Synthesizer sound</span>
                    <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Chime pings when notifications arrive</small>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={soundEffectsEnabled} 
                  onChange={(e) => handleToggleSound(e.target.checked)}
                />
              </div>
              <button onClick={() => playAlertChime('message')} className="btn-secondary" style={{ width: 'fit-content', padding: '6px 12px', fontSize: '12px' }}>
                🔊 Trigger Test Chime
              </button>
            </div>
          )}

          {/* Billing Center Log */}
          {activeSettingsSubTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>Billing Center Campaigns</h3>
                <button onClick={() => setShowAddAdModal(true)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  Launch Ad
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myAds.map(ad => (
                  <div key={ad._id} className="glass-panel" style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <div>
                      <strong style={{ fontSize: '12.5px', display: 'block' }}>{ad.title}</strong>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        Budget Left: ${ad.budget.toFixed(2)} · Clicks: {ad.clicksCount}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: ad.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.1)', color: ad.status === 'active' ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                      {ad.status}
                    </span>
                  </div>
                ))}
                {myAds.length === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>You have no created advertising campaigns. Click Launch Ad above to get started.</span>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
