import React from 'react';
import { Plus, X, Upload, Sparkles } from 'lucide-react';
import PostCard from '../../components/features/posts/PostCard';

export default function FeedPage({
  user,
  stories,
  openStorySlideshow,
  handleAddStory,
  newPostContent,
  setNewPostContent,
  mediaPreview,
  setMediaFile,
  setMediaPreview,
  isPollPost,
  setIsPollPost,
  pollOptionsInputs,
  handleAddPollOption,
  handlePollOptionChange,
  handleCreatePost,
  handleMediaChange,
  posts,
  handleDeletePost,
  handleSelectProfile,
  API_BASE
}) {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Stories Tray */}
      <div className="stories-tray">
        <label className="story-add-card">
          <div style={{ padding: '8px', background: 'var(--main-gradient)', borderRadius: '50%', color: 'white' }}>
            <Plus size={16} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Add Story</span>
          <input type="file" accept="image/*" onChange={handleAddStory} style={{ display: 'none' }} />
        </label>

        {stories.map((st, sidx) => (
          <div key={st._id} className="story-bubble" onClick={() => openStorySlideshow(sidx)}>
            <img src={st.mediaUrl} alt="Story cover" className="story-bubble-bg" />
            <img 
              src={st.user.profilePic || '/default-avatar.png'} 
              alt="Story poster" 
              className={`story-avatar-icon ${st.user.isPremium ? 'premium-avatar' : ''}`} 
            />
            <div className="story-bubble-overlay">
              <span className="story-username-label">{st.user.username}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create post box */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder={`What's on your mind, ${user.username}?`}
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'none', border: 'none', background: 'transparent', padding: 0 }}
          />
          
          {/* Media Attach Preview */}
          {mediaPreview && (
            <div style={{ position: 'relative', marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              <button 
                type="button"
                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', background: 'black', borderRadius: '50%', color: 'white' }}
              >
                <X size={14} />
              </button>
              <img src={mediaPreview} alt="Attached Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
            </div>
          )}

          {/* Poll Option Inputs */}
          {isPollPost && (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border-glass)', borderRadius: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Poll Options</span>
                {pollOptionsInputs.length < 5 && (
                  <button type="button" onClick={handleAddPollOption} style={{ fontSize: '11px', color: 'var(--color-primary)', background: 'none', padding: 0 }}>
                    Add Option
                  </button>
                )}
              </div>
              {pollOptionsInputs.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Choice ${idx + 1}...`}
                  value={val}
                  onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                  style={{ width: '100%', height: '32px', fontSize: '12px', marginBottom: '6px' }}
                  required
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Upload size={16} />
                <span>Photo/Video</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} style={{ display: 'none' }} />
              </label>

              <button
                type="button"
                onClick={() => setIsPollPost(!isPollPost)}
                style={{ background: 'none', color: isPollPost ? 'var(--color-primary)' : 'var(--text-muted)', fontSize: '12px' }}
              >
                <Sparkles size={16} style={{ marginRight: '4px' }} />
                <span>Create Poll</span>
              </button>

            </div>

            <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
              Post
            </button>
          </div>

        </form>
      </div>

      {/* Feed posts loops */}
      {posts.filter(p => !p.group && !p.page).map(p => (
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
  );
}
