import React from 'react';
import { Plus } from 'lucide-react';

export default function MarketplacePage({
  marketCategoryFilter,
  setMarketCategoryFilter,
  marketSearchText,
  setMarketSearchText,
  loadMarketplace,
  setShowAddMarketModal,
  marketItems,
  user,
  handleStartMarketChat,
  handleDeleteMarketItem
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Filters block */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={marketCategoryFilter} onChange={e => { setMarketCategoryFilter(e.target.value); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Search product..."
            value={marketSearchText}
            onChange={e => setMarketSearchText(e.target.value)}
            style={{ fontSize: '12px', height: '34px', width: '220px' }}
          />
          <button onClick={loadMarketplace} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Search</button>
        </div>

        <button onClick={() => setShowAddMarketModal(true)} className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
          <Plus size={14} />
          <span>List Product</span>
        </button>
      </div>

      {/* Items loops grid */}
      {marketItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No listed items found for category query.
        </div>
      ) : (
        <div className="market-grid">
          {marketItems.map(item => (
            <div key={item._id} className="glass-panel market-card">
              <div className="market-image-wrap">
                <img src={item.image || '/default-marketplace.png'} alt={item.title} />
                <span className="market-price-tag">${item.price.toFixed(2)}</span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 'bold' }}>{item.category}</span>
                <h4 style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', maxHeight: '48px' }}>{item.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px', marginTop: '4px' }}>
                  <img src={item.seller.profilePic || '/default-avatar.png'} alt={item.seller.username} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>Seller: {item.seller.username}</span>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {item.seller._id !== user.id ? (
                    <button onClick={() => handleStartMarketChat(item.seller._id)} className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '11px' }}>Message Seller</button>
                  ) : (
                    <button onClick={() => handleDeleteMarketItem(item._id)} className="btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '11px', color: 'var(--color-danger)' }}>Delete Listing</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
