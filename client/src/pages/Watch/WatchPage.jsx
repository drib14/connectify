import React from 'react';
import { Video } from 'lucide-react';
import PostCard from '../../components/features/posts/PostCard';

export default function WatchPage({
  posts,
  user,
  handleDeletePost,
  handleSelectProfile,
  API_BASE
}) {
  const videoPosts = posts.filter(p => p.mediaUrl && p.mediaType === 'video');

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <Video size={20} color="var(--color-primary)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px' }}>Watch Timeline updates</h3>
      </div>

      {videoPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No video timeline posts found in your connection feed.
        </div>
      ) : (
        videoPosts.map(p => (
          <PostCard 
            key={p._id} 
            post={p} 
            user={user} 
            onDelete={handleDeletePost} 
            onSelectProfile={handleSelectProfile}
            API_BASE={API_BASE}
          />
        ))
      )}
    </div>
  );
}
