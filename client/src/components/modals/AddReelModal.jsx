import React from 'react';
import { X, Upload } from 'lucide-react';

export default function AddReelModal({ 
  isOpen, 
  onClose, 
  reelCaption, 
  setReelCaption, 
  reelVideoFile, 
  setReelVideoFile, 
  handleUploadReel 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000 }}>
      <div className="glass-panel-heavy" style={{ width: '400px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Publish Video Reel</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleUploadReel} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Caption details..." 
            value={reelCaption} 
            onChange={e => setReelCaption(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px', border: '1px dashed var(--border-glass)', borderRadius: '6px' }}>
            <Upload size={14} />
            <span>{reelVideoFile ? `Selected: ${reelVideoFile.name.substring(0, 18)}` : 'Select Reel Video file'}</span>
            <input type="file" accept="video/*" onChange={e => setReelVideoFile(e.target.files[0])} style={{ display: 'none' }} required />
          </label>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Post Reel</button>
        </form>
      </div>
    </div>
  );
}
