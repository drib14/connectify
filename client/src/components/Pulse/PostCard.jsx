import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { VibeContext } from '../../context/VibeContext.jsx';
import API from '../../services/api.js';
import { Heart, MessageSquare, Music, Trash, Globe, Send, Share2, X } from 'lucide-react';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying } = useContext(VibeContext);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Translation state
  const [translatedText, setTranslatedText] = useState('');
  const [translating, setTranslating] = useState(false);

  // Share states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [sharing, setSharing] = useState(false);

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(''); // Toggle off
      return;
    }
    setTranslating(true);
    try {
      const response = await API.post('/integrations/gemini/aura', {
        prompt: post.content,
        action: 'translate',
      });
      setTranslatedText(response.data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const handleReact = async (type) => {
    try {
      const response = await API.post(`/posts/${post._id}/react`, { type });
      onPostUpdated(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await API.post(`/posts/${post._id}/comment`, { text: commentText });
      onPostUpdated(response.data);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await API.delete(`/posts/${post._id}`);
      onPostDeleted(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await API.post(`/posts/${post._id}/share`, { content: shareCaption });
      setShowShareModal(false);
      setShareCaption('');
      alert('Shared post to your Pulse feed!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to share post.');
    } finally {
      setSharing(false);
    }
  };

  const isSongPlaying = currentTrack?.previewUrl === post.vibe?.previewUrl && isPlaying;
  const isPostAuthor = user?._id === post.author._id;

  // Check if current user reacted
  const hasReacted = post.reactions.some((r) => r.user === user?._id);

  return (
    <article className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={post.author.avatar}
            alt=""
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: post.author.isPremium ? '2px solid #fbbf24' : '2px solid var(--primary)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{post.author.username}</span>
              {post.author.isPremium && <span className="premium-badge">Premium</span>}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {post.location?.name && (
                <span style={{ color: 'var(--primary-glow)', fontWeight: 500 }}>
                  {' '}• checking in at {post.location.name.split(',')[0]}
                </span>
              )}
            </span>
          </div>
        </div>

        {isPostAuthor && (
          <button
            onClick={handleDelete}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Delete Post"
          >
            <Trash size={16} />
          </button>
        )}
      </div>

      {/* Content description */}
      {post.content && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>

          {/* AI Translation toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <button
              onClick={handleTranslate}
              disabled={translating}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-glow)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Globe size={12} />
              <span>{translating ? 'Translating...' : translatedText ? 'Show Original' : 'Translate post'}</span>
            </button>

            {translatedText && (
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                borderLeft: '3px solid var(--primary)',
                padding: '8px 12px',
                borderRadius: '0 8px 8px 0',
                fontSize: '13px',
                fontStyle: 'italic',
                color: 'var(--text-main)',
              }}>
                {translatedText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media attachment */}
      {post.media && post.media.length > 0 && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '380px', display: 'flex', justifyContent: 'center', background: '#000' }}>
          {post.media[0].type === 'video' ? (
            <video src={post.media[0].url} controls style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }} />
          ) : (
            <img src={post.media[0].url} alt="" style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }} />
          )}
        </div>
      )}

      {/* Music Vibe Attachment */}
      {post.vibe?.title && (
        <div
          onClick={() => post.vibe.previewUrl && playTrack({
            title: post.vibe.title,
            artist: post.vibe.artist,
            previewUrl: post.vibe.previewUrl,
            coverUrl: post.vibe.coverUrl,
          })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '10px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
          }}
        >
          <img
            src={post.vibe.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=50&q=80'}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Song Vibe</span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{post.vibe.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.vibe.artist}</span>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>
            <Music size={18} style={{ animation: isSongPlaying ? 'soundWave 1.2s infinite ease-in-out' : 'none' }} />
          </button>
        </div>
      )}

      {/* Nested original shared post content */}
      {post.sharedFrom && (
        <div className="glass-panel animate-fade-in" style={{ padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={post.sharedFrom.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
              alt=""
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{post.sharedFrom.author?.username || 'Deleted User'}</span>
                {post.sharedFrom.author?.isPremium && <span className="premium-badge" style={{ fontSize: '8px' }}>Premium</span>}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {new Date(post.sharedFrom.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {post.sharedFrom.content && (
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
              {post.sharedFrom.content}
            </p>
          )}

          {post.sharedFrom.media && post.sharedFrom.media.length > 0 && (
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '240px', display: 'flex', justifyContent: 'center', background: '#000' }}>
              {post.sharedFrom.media[0].type === 'video' ? (
                <video src={post.sharedFrom.media[0].url} controls style={{ width: '100%', maxHeight: '240px', objectFit: 'contain' }} />
              ) : (
                <img src={post.sharedFrom.media[0].url} alt="" style={{ width: '100%', maxHeight: '240px', objectFit: 'contain' }} />
              )}
            </div>
          )}

          {post.sharedFrom.vibe?.title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.04)', padding: '8px 12px', borderRadius: '8px' }}>
              <img src={post.sharedFrom.vibe.coverUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{post.sharedFrom.vibe.title}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{post.sharedFrom.vibe.artist}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action / Reactions buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '10px 0' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Reaction icons selector */}
          {['Like', 'Love', 'Fire', 'Vibe'].map((reactionType) => {
            const hasType = post.reactions.some((r) => r.user === user?._id && r.type === reactionType);
            const count = post.reactions.filter((r) => r.type === reactionType).length;
            
            const reactionColors = {
              Like: '#3b82f6',
              Love: '#ef4444',
              Fire: '#f59e0b',
              Vibe: '#10b981',
            };

            return (
              <button
                key={reactionType}
                onClick={() => handleReact(reactionType)}
                style={{
                  background: hasType ? `${reactionColors[reactionType]}15` : 'transparent',
                  border: '1px solid',
                  borderColor: hasType ? reactionColors[reactionType] : 'transparent',
                  color: hasType ? reactionColors[reactionType] : 'var(--text-muted)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: '0.2s',
                }}
              >
                <span>{reactionType === 'Like' ? '👍' : reactionType === 'Love' ? '❤️' : reactionType === 'Fire' ? '🔥' : '🎵'}</span>
                <span>{count > 0 ? count : ''}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <MessageSquare size={16} />
            <span>{post.comments.length} Comments</span>
          </button>

          {!post.sharedFrom && (
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Comments section toggle layout */}
      {showComments && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Comment list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
            {post.comments.map((comm) => (
              <div key={comm._id} style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <img src={comm.author.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{comm.author.username}</span>
                    {comm.author.isPremium && <span className="premium-badge" style={{ fontSize: '7px' }}>Premium</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px' }}>{comm.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form write comments */}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              className="input-field"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ flex: 1, padding: '10px' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Share/Repost Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '440px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => {
                setShowShareModal(false);
                setShareCaption('');
              }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px' }}>Share to Pulse Feed</h2>

            <textarea
              placeholder="Say something about this post..."
              className="input-field"
              rows={3}
              value={shareCaption}
              onChange={(e) => setShareCaption(e.target.value)}
            />

            {/* Micro-preview of the post to be shared */}
            <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <img src={post.author.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{post.author.username}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                  {post.content || (post.media?.length > 0 ? 'Media Attachment' : 'Spotify track attachment')}
                </span>
              </div>
            </div>

            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Share2 size={16} />
              <span>{sharing ? 'Sharing...' : 'Share Now'}</span>
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
