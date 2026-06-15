import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { VibeContext } from '../../context/VibeContext.jsx';
import API from '../../services/api.js';
import { Heart, MessageSquare, Music, Play, Pause, X } from 'lucide-react';

const ClipPlayer = ({ clip, isActive, onClipUpdated }) => {
  const { user } = useContext(AuthContext);
  const { playTrack } = useContext(VibeContext);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Likes and Comments states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(clip.comments || []);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Autoplay blocked:', err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error(err));
      }
    }
  };

  const handleLike = async () => {
    try {
      const response = await API.post(`/clips/${clip._id}/like`);
      onClipUpdated(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await API.post(`/clips/${clip._id}/comment`, { text: commentText });
      setComments(response.data.comments);
      setCommentText('');
      onClipUpdated(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isLiked = clip.likes.includes(user?._id);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'black',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Video stream */}
      <video
        ref={videoRef}
        src={clip.videoUrl}
        loop
        playsInline
        onClick={togglePlay}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
      />

      {/* Play/Pause state alert overlay */}
      {!isPlaying && (
        <div onClick={togglePlay} style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', pointerEvents: 'none' }}>
          <Play size={32} style={{ marginLeft: '4px' }} />
        </div>
      )}

      {/* Video bottom overlay metadata */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: '60px', // leave room for floating side actions bar
        padding: '20px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {/* Author info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          <img
            src={clip.author.avatar}
            alt=""
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: clip.author.isPremium ? '2px solid #fbbf24' : '2px solid var(--primary)' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{clip.author.username}</span>
          {clip.author.isPremium && <span className="premium-badge">Premium</span>}
        </div>

        {/* Caption */}
        {clip.caption && (
          <p style={{ fontSize: '13px', lineHeight: '1.4', margin: 0, whiteSpace: 'pre-wrap' }}>{clip.caption}</p>
        )}

        {/* Vibe track details trigger */}
        {clip.vibe?.title && (
          <div
            onClick={() => clip.vibe.previewUrl && playTrack({
              title: clip.vibe.title,
              artist: clip.vibe.artist,
              previewUrl: clip.vibe.previewUrl,
              coverUrl: clip.vibe.coverUrl,
            })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              alignSelf: 'flex-start',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            <Music size={12} />
            <marquee style={{ width: '100px' }}>{clip.vibe.title} - {clip.vibe.artist}</marquee>
          </div>
        )}
      </div>

      {/* Floating vertical actions list bar */}
      <div style={{
        position: 'absolute',
        right: '16px',
        bottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10,
      }}>
        {/* Like action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handleLike}
            style={{
              background: isLiked ? '#ef4444' : 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Heart size={20} fill={isLiked ? 'white' : 'none'} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>{clip.likes.length}</span>
        </div>

        {/* Comment toggle action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setShowComments(true)}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <MessageSquare size={20} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'white' }}>{clip.comments.length}</span>
        </div>
      </div>

      {/* Slide-up Comments Drawer overlay */}
      {showComments && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '60%',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          borderRadius: '16px 16px 0 0',
          zIndex: 20,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px' }}>Comments</h3>
            <button
              onClick={() => setShowComments(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {comments.length > 0 ? (
              comments.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <img src={c.author.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{c.author.username}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-main)', marginTop: '2px' }}>{c.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>No comments yet. Be the first!</span>
            )}
          </div>

          <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add a comment..."
              className="input-field"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClipPlayer;
