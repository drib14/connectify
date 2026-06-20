import React from 'react';
import { Plus, Heart, MessageCircle, Share2, X, Send } from 'lucide-react';

export default function ReelsPage({
  reels,
  activeReelIndex,
  setActiveReelIndex,
  setShowAddReelModal,
  handleLikeReel,
  showReelComments,
  setShowReelComments,
  handleCommentReel,
  newReelComment,
  setNewReelComment,
  user,
  showToast
}) {
  return (
    <div className="reels-viewer-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        
        {/* Reels Upload Trigger */}
        <div style={{ width: '330px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>Short Reels</span>
          <button onClick={() => setShowAddReelModal(true)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
            <Plus size={12} /> List Reel
          </button>
        </div>

        {reels.length === 0 ? (
          <div className="glass-panel" style={{ width: '330px', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No Reels shared yet.
          </div>
        ) : (
          <div className="reel-card-container">
            
            {/* Video Player */}
            {reels[activeReelIndex] && (
              <video 
                src={reels[activeReelIndex].videoUrl} 
                className="reel-video" 
                controls={false}
                autoPlay
                loop
                onClick={(e) => {
                  if (e.target.paused) e.target.play();
                  else e.target.pause();
                }}
              />
            )}

            {/* Right side floating buttons */}
            {reels[activeReelIndex] && (
              <div className="reel-sidebar-actions">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button 
                    className="reel-action-btn"
                    onClick={() => handleLikeReel(reels[activeReelIndex]._id)}
                    style={{ color: reels[activeReelIndex].likes.includes(user.id) ? 'var(--color-danger)' : 'white' }}
                  >
                    <Heart size={18} fill={reels[activeReelIndex].likes.includes(user.id) ? 'var(--color-danger)' : 'none'} />
                  </button>
                  <span className="reel-action-count">{reels[activeReelIndex].likes.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button 
                    className="reel-action-btn"
                    onClick={() => setShowReelComments(!showReelComments)}
                  >
                    <MessageCircle size={18} />
                  </button>
                  <span className="reel-action-count">{reels[activeReelIndex].comments.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <button 
                    className="reel-action-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(reels[activeReelIndex].videoUrl);
                      showToast('Link copied to clipboard!', 'success');
                    }}
                  >
                    <Share2 size={18} />
                  </button>
                  <span className="reel-action-count">Share</span>
                </div>
              </div>
            )}

            {/* Bottom Details overlay */}
            {reels[activeReelIndex] && (
              <div className="reel-overlay-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={reels[activeReelIndex].user.profilePic || '/default-avatar.png'} 
                    alt="owner" 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid white' }}
                  />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{reels[activeReelIndex].user.username}</strong>
                  {reels[activeReelIndex].user.isPremium && <span style={{ color: 'var(--premium-gold)', fontSize: '10px' }}>👑</span>}
                </div>
                <p style={{ fontSize: '12px', color: '#eaeaea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reels[activeReelIndex].caption}</p>
              </div>
            )}

            {/* Up / Down navigation arrows */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
              <button 
                disabled={activeReelIndex === 0}
                onClick={() => setActiveReelIndex(prev => prev - 1)}
                style={{ padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', opacity: activeReelIndex === 0 ? 0.3 : 1 }}
              >
                ▲
              </button>
              <button 
                disabled={activeReelIndex === reels.length - 1}
                onClick={() => setActiveReelIndex(prev => prev + 1)}
                style={{ padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', opacity: activeReelIndex === reels.length - 1 ? 0.3 : 1 }}
              >
                ▼
              </button>
            </div>

            {/* Reels expandable comment thread sidebar overlay */}
            {showReelComments && reels[activeReelIndex] && (
              <div className="glass-panel-heavy" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', zIndex: 100, borderTop: '1px solid var(--border-glass)', padding: '14px', display: 'flex', flexDirection: 'column', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Reel Comments</span>
                  <button onClick={() => setShowReelComments(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {reels[activeReelIndex].comments.map((c, cidx) => (
                    <div key={cidx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <img src={c.user.profilePic || '/default-avatar.png'} alt="user" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '6px', flex: 1 }}>
                        <strong style={{ fontSize: '10px', display: 'block' }}>{c.user.username}</strong>
                        <span style={{ fontSize: '11px' }}>{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleCommentReel(e, reels[activeReelIndex]._id)} style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="text" 
                    placeholder="Add comment..." 
                    value={newReelComment} 
                    onChange={e => setNewReelComment(e.target.value)}
                    style={{ flex: 1, height: '28px', fontSize: '11px', padding: '4px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '4px 8px', height: '28px' }}><Send size={10} /></button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
