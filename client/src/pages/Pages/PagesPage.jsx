import React from 'react';
import { Flag } from 'lucide-react';
import PostCard from '../../components/features/posts/PostCard';

export default function PagesPage({
  pages,
  selectedPage,
  setSelectedPage,
  handleCreatePage,
  newPageName,
  setNewPageName,
  newPageDesc,
  setNewPageDesc,
  newPageCat,
  setNewPageCat,
  handleFollowPage,
  handleSelectPage,
  pagePostContent,
  setPagePostContent,
  handlePostInPage,
  user,
  handleDeletePost,
  handleSelectProfile,
  API_BASE
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', height: '100%' }}>
      {/* Directory Sidebar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>Pages Hub</h3>
          <button onClick={() => setSelectedPage(null)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>Browse</button>
        </div>

        {/* Create Page Form */}
        <form onSubmit={handleCreatePage} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Launch Brand Page:</span>
          <input type="text" placeholder="Page Name..." value={newPageName} onChange={e => setNewPageName(e.target.value)} style={{ fontSize: '12px', height: '32px' }} required />
          <input type="text" placeholder="Description..." value={newPageDesc} onChange={e => setNewPageDesc(e.target.value)} style={{ fontSize: '12px', height: '32px' }} />
          <select value={newPageCat} onChange={e => setNewPageCat(e.target.value)} style={{ fontSize: '11px', height: '32px' }}>
            <option value="Creator">🎨 Creator Profile</option>
            <option value="Business">🏢 Brand / Business</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Community">🌐 Social Community</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '4px', fontSize: '11px' }}>Launch Page</button>
        </form>

        {/* Page Listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Pages Directories:</span>
          {pages.map(p => (
            <div 
              key={p._id}
              onClick={() => handleSelectPage(p._id)}
              className={`sidebar-link ${selectedPage && selectedPage._id === p._id ? 'active' : ''}`}
              style={{ padding: '8px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
            >
              <Flag size={14} style={{ marginRight: '6px' }} />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pages details timeline */}
      <div className="glass-panel" style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        {selectedPage ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '20px' }}>{selectedPage.name}</h2>
                <button onClick={() => handleFollowPage(selectedPage._id)} className={selectedPage.followers.includes(user.id) ? 'btn-secondary' : 'btn-primary'} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  {selectedPage.followers.includes(user.id) ? 'Following' : 'Follow Page'}
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{selectedPage.description || 'No description listed.'}</p>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '6px', display: 'block' }}>
                Category: {selectedPage.category} · {selectedPage.followers.length} Followers
              </span>
            </div>

            {/* Analytics panels widgets (if owner) */}
            {selectedPage.owner === user.id && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="glass-panel" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Followers Count</span>
                  <strong style={{ display: 'block', fontSize: '16px', marginTop: '2px' }}>{selectedPage.followers.length}</strong>
                </div>
                <div className="glass-panel" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Timeline Views</span>
                  <strong style={{ display: 'block', fontSize: '16px', marginTop: '2px' }}>{selectedPage.viewsCount || 1}</strong>
                </div>
                <div className="glass-panel" style={{ padding: '10px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Clicks Redirects</span>
                  <strong style={{ display: 'block', fontSize: '16px', marginTop: '2px' }}>{selectedPage.clicksCount || 0}</strong>
                </div>
              </div>
            )}

            {/* Post to Page Form (only owner) */}
            {selectedPage.owner === user.id && (
              <form onSubmit={handlePostInPage} className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.1)' }}>
                <textarea 
                  placeholder={`Publish a timeline announcement update as ${selectedPage.name}...`}
                  value={pagePostContent}
                  onChange={e => setPagePostContent(e.target.value)}
                  rows={2}
                  style={{ width: '100%', background: 'transparent', resize: 'none', border: 'none' }}
                  required
                />
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Post Update</button>
                </div>
              </form>
            )}

            {/* Page Timeline Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedPage.posts && selectedPage.posts.map(p => (
                <PostCard 
                  key={p._id} 
                  post={p} 
                  user={user} 
                  onDelete={handleDeletePost} 
                  onSelectProfile={handleSelectProfile}
                  API_BASE={API_BASE}
                />
              ))}
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '8px' }}>
            <Flag size={36} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700' }}>Discover Connection Pages</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
              Select a brand or creator page timeline, or publish your own specialized business portal today.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
