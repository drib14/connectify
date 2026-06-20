import React from 'react';
import { Crown } from 'lucide-react';

export default function PremiumPage({
  user,
  handleUpgradeToPremium,
  premiumThemeColor,
  setPremiumThemeColor,
  premiumNeonOutline,
  setPremiumNeonOutline
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '24px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crown size={26} color="var(--premium-gold)" />
          <span>Connectify Premium Tier</span>
        </h2>
        
        {user.isPremium ? (
          <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--premium-gold)', fontWeight: '700', fontSize: '16px' }}>🛡️ Premium Status Active</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>
              Thank you for supporting Connectify! You have successfully unlocked all VIP styling badges and double point multipliers.
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              Support the developer and unlock exclusive customization options and reward multipliers on Connectify. Upgrade today for just <strong>$4.99/mo</strong>.
            </p>
            <button onClick={handleUpgradeToPremium} className="btn-premium" style={{ width: '100%', marginTop: '14px', padding: '10px' }}>
              Upgrade to Premium
            </button>
          </div>
        )}

        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>Exclusive Perks Summary</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', paddingLeft: '16px', lineHeight: 1.6 }}>
          <li>👑 **Golden Avatar Frame**: Displays a custom crown badge on all your posts, map pins and comments.</li>
          <li>🚀 **Double Spark points**: Earn 2x points for completing daily goal challenges, leveling you up on leaderboards.</li>
          <li>🎨 **Custom Colors**: Choose unique visual accent presets (Gold, Pink, Cyan) syncable on your browser.</li>
          <li>✨ **Interactive Neon Outlines**: Toggle glowing borders on your feed cards.</li>
        </ul>
      </div>

      {/* Theme Customizer widget */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '14px' }}>Theme Customizer</h3>
        
        {user.isPremium ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Visual Color Accent</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {['indigo', 'pink', 'purple', 'cyan', 'gold'].map(color => (
                  <div
                    key={color}
                    onClick={() => setPremiumThemeColor(color)}
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: color === 'gold' ? '#f59e0b' : color === 'pink' ? '#ec4899' : color === 'purple' ? '#8b5cf6' : color === 'cyan' ? '#06b6d4' : '#6366f1',
                      cursor: 'pointer',
                      border: premiumThemeColor === color ? '2px solid white' : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>Glowing Card Borders</span>
              <input 
                type="checkbox" 
                checked={premiumNeonOutline} 
                onChange={() => setPremiumNeonOutline(!premiumNeonOutline)}
              />
            </div>

          </div>
        ) : (
          <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            🔒 Upgrade to Premium to unlock custom profile color settings and visual dashboard effects.
          </div>
        )}
      </div>

    </div>
  );
}
