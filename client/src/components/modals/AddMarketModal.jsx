import React from 'react';
import { X, Upload } from 'lucide-react';

export default function AddMarketModal({ 
  isOpen, 
  onClose, 
  newMarketTitle, 
  setNewMarketTitle, 
  newMarketPrice, 
  setNewMarketPrice, 
  newMarketCat, 
  setNewMarketCat, 
  newMarketLoc, 
  setNewMarketLoc, 
  newMarketDesc, 
  setNewMarketDesc, 
  newMarketImagePreview, 
  handleMarketImageChange, 
  handleCreateMarketItem 
}) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 100000 }}>
      <div className="glass-panel-heavy" style={{ width: '420px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>List Product for Sale</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        
        <form onSubmit={handleCreateMarketItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Product Title..." value={newMarketTitle} onChange={e => setNewMarketTitle(e.target.value)} required />
          <input type="number" placeholder="Price ($)..." value={newMarketPrice} onChange={e => setNewMarketPrice(e.target.value)} required />
          <select value={newMarketCat} onChange={e => setNewMarketCat(e.target.value)}>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
          <input type="text" placeholder="Location..." value={newMarketLoc} onChange={e => setNewMarketLoc(e.target.value)} />
          <textarea placeholder="Description..." value={newMarketDesc} onChange={e => setNewMarketDesc(e.target.value)} rows={2} />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', border: '1px dashed var(--border-glass)', borderRadius: '6px' }}>
            <Upload size={14} />
            <span>Upload Product Image</span>
            <input type="file" accept="image/*" onChange={handleMarketImageChange} style={{ display: 'none' }} />
          </label>

          {newMarketImagePreview && (
            <img src={newMarketImagePreview} alt="upload preview" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Post Listing</button>
        </form>
      </div>
    </div>
  );
}
