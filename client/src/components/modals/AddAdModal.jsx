import React from 'react';
import { X, Upload } from 'lucide-react';

export default function AddAdModal({ 
  isOpen, 
  onClose, 
  newAdTitle, 
  setNewAdTitle, 
  newAdBudget, 
  setNewAdBudget, 
  newAdRedirect, 
  setNewAdRedirect, 
  newAdBannerPreview, 
  setNewAdBannerFile, 
  setNewAdBannerPreview, 
  handleCreateAd 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}>
      <div className="glass-panel-heavy" style={{ width: '400px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Launch Advertising Banner</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Campaign Title..." value={newAdTitle} onChange={e => setNewAdTitle(e.target.value)} required />
          <input type="number" placeholder="Budget budget ($)..." value={newAdBudget} onChange={e => setNewAdBudget(e.target.value)} required />
          <input type="text" placeholder="Landing redirect site URL..." value={newAdRedirect} onChange={e => setNewAdRedirect(e.target.value)} />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', border: '1px dashed var(--border-glass)', borderRadius: '6px' }}>
            <Upload size={14} />
            <span>Upload Ad Banner Banner</span>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (file) {
                setNewAdBannerFile(file);
                setNewAdBannerPreview(URL.createObjectURL(file));
              }
            }} style={{ display: 'none' }} required />
          </label>

          {newAdBannerPreview && (
            <img src={newAdBannerPreview} alt="banner preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
          )}
          
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Launch Campaign</button>
        </form>
      </div>
    </div>
  );
}
