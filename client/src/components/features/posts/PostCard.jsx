import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, CornerDownRight, Plus, Send, Trash2, Heart, Award } from 'lucide-react';
import api from '../../../utils/api';

export default function PostCard({ post, user, onDelete, onSelectProfile }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState(post.comments || []);
  const [postReactions, setPostReactions] = useState(post.reactions || []);
  const [postLikes, setPostLikes] = useState(post.likes || []);
  const [pollOptions, setPollOptions] = useState(post.pollOptions || []);
  const [replyInputs, setReplyInputs] = useState({}); // { [commentId]: string }
  const [showReplyForm, setShowReplyForm] = useState({}); // { [commentId]: boolean }

  const handleReact = async (type) => {
    try {
      const res = await api.post(`/posts/${post._id}/react`, { type });
      if (res.data.success) {
        setPostReactions(res.data.reactions);
        setPostLikes(res.data.likes);
      }
    } catch (err) {
      console.error('React error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: newComment });
      if (res.data.success) {
        setPostComments(prev => [...prev, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const handleAddReply = async (e, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId];
    if (!replyText || !replyText.trim()) return;

    try {
      const res = await api.post(`/posts/${post._id}/comment/${commentId}/reply`, { text: replyText });
      if (res.data.success) {
        setPostComments(prev => prev.map(c => {
          if (c._id === commentId) {
            return { ...c, replies: [...c.replies, res.data.reply] };
          }
          return c;
        }));
        setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
      }
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const handleVote = async (optionId) => {
    try {
      const res = await api.post(`/posts/${post._id}/vote`, { optionId });
      if (res.data.success) {
        setPollOptions(res.data.pollOptions);
      }
    } catch (err) {
      console.log('Simulating vote update locally.');
      setPollOptions(prev => prev.map(opt => {
        const hasVoted = opt.votes.includes(user.id);
        const allVotesCleaned = opt.votes.filter(id => id !== user.id);
        if (opt._id === optionId) {
          return {
            ...opt,
            votes: hasVoted ? allVotesCleaned : [...opt.votes, user.id]
          };
        } else {
          return { ...opt, votes: allVotesCleaned };
        }
      }));
    }
  };

  const handleShare = async () => {
    const shareText = prompt('Add something to this share:');
    if (shareText === null) return;
    try {
      const res = await api.post(`/posts/${post._id}/share`, { content: shareText });
      if (res.data.success) {
        alert('Shared to Feed successfully!');
        window.location.reload();
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const userVoteOption = pollOptions.find(o => o.votes.includes(user.id));
  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes.length, 0);
  const reactionCounts = postReactions.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const getReactionEmoji = (type) => {
    switch (type) {
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😡';
      default: return '👍';
    }
  };

  return (
    <div className={`glass-panel ${post.user.isPremium ? 'premium-glow-border' : ''}`} style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
      
      {/* Post Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onSelectProfile(post.user.username)}>
          <div className="avatar-container">
            <img src={post.user.profilePic || '/default-avatar.png'} alt={post.user.username} className={`avatar ${post.user.isPremium ? 'premium-avatar' : ''}`} style={{ width: '40px', height: '40px' }} />
            {post.user.isPremium && <div className="premium-crown-tag">👑</div>}
          </div>
          <div>
            <h4 style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {post.user.username}
              {post.user.isPremium && <span style={{ color: 'var(--premium-gold)', fontSize: '11px', fontWeight: 'bold' }}>PREMIUM</span>}
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {post.user._id === user.id && (
          <button onClick={() => onDelete(post._id)} style={{ background: 'none', color: 'var(--text-muted)', border: 'none', padding: 0 }} title="Delete Post">
            <Trash2 size={16} className="hover:text-red-500" />
          </button>
        )}
      </div>

      {/* Post content */}
      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '14px', fontSize: '14px', color: 'var(--text-main)' }}>
        {post.content}
      </p>

      {/* Interactive Poll Component */}
      {post.isPoll && (
        <div className="glass-panel" style={{ padding: '14px', marginBottom: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '10px', fontSize: '13px' }}>Community Spark Poll</h5>
          {pollOptions.map(option => {
            const hasVoted = option.votes.includes(user.id);
            const percentage = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
            return (
              <div 
                key={option._id}
                onClick={() => handleVote(option._id)}
                className={`poll-option-bar-container ${userVoteOption ? 'voted' : ''}`}
              >
                <div className="poll-option-fill" style={{ width: `${percentage}%` }}></div>
                <div className="poll-option-text" style={{ fontSize: '13px' }}>
                  <span>{option.optionText}</span>
                  <span style={{ fontWeight: '700' }}>{percentage}% ({option.votes.length})</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right' }}>
            Total Votes: {totalVotes}
          </div>
        </div>
      )}

      {/* Media Attachments */}
      {post.mediaUrl && (
        <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', maxHeight: '450px', background: '#000', border: '1px solid var(--border-glass)' }}>
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }} />
          ) : (
            <img src={post.mediaUrl} alt="Post Attachment" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }} />
          )}
        </div>
      )}

      {/* Share nested original post */}
      {post.isShared && post.originalPost && (
        <div className="glass-panel" style={{ padding: '12px', borderLeft: '3px solid var(--color-primary)', background: 'rgba(255,255,255,0.01)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => onSelectProfile(post.originalPost.user.username)}>
            <img src={post.originalPost.user.profilePic || '/default-avatar.png'} alt="Original poster" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <div>
              <span style={{ fontWeight: '700', fontSize: '12px' }}>{post.originalPost.user.username}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {new Date(post.originalPost.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{post.originalPost.content}</p>
          {post.originalPost.mediaUrl && (
            <img src={post.originalPost.mediaUrl} alt="Attached File" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />
          )}
        </div>
      )}

      {/* Reaction Icons Listing */}
      {postReactions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Object.keys(reactionCounts).map(type => (
              <span key={type}>{getReactionEmoji(type)}</span>
            ))}
          </div>
          <span>{postReactions.length} Reactions</span>
        </div>
      )}

      {/* Footer controls: React / Comment / Share */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '8px 0', marginBottom: '14px' }}>
        
        {/* Like/Reaction Bar */}
        <div className="reaction-container">
          <button 
            onClick={() => handleReact('like')}
            style={{ background: 'none', color: postLikes.includes(user.id) ? 'var(--color-primary)' : 'var(--text-muted)' }}
          >
            <ThumbsUp size={16} />
            <span>React</span>
          </button>
          <div className="reaction-flyout">
            <span className="reaction-emoji" onClick={() => handleReact('like')} title="Like">👍</span>
            <span className="reaction-emoji" onClick={() => handleReact('love')} title="Love">❤️</span>
            <span className="reaction-emoji" onClick={() => handleReact('haha')} title="Haha">😂</span>
            <span className="reaction-emoji" onClick={() => handleReact('wow')} title="Wow">😮</span>
            <span className="reaction-emoji" onClick={() => handleReact('sad')} title="Sad">😢</span>
            <span className="reaction-emoji" onClick={() => handleReact('angry')} title="Angry">😡</span>
          </div>
        </div>

        {/* Comment Action Toggle */}
        <button 
          onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', color: 'var(--text-muted)' }}
        >
          <MessageCircle size={16} />
          <span>Comment ({postComments.length})</span>
        </button>

        {/* Share Action */}
        <button 
          onClick={handleShare}
          style={{ background: 'none', color: 'var(--text-muted)' }}
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments List Block */}
      {showComments && (
        <div style={{ marginTop: '10px' }}>
          {/* Create Comment Form */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ flex: 1, height: '36px', fontSize: '13px' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px', height: '36px' }}>
              <Send size={14} />
            </button>
          </form>

          {/* Comments loop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {postComments.map(comment => (
              <div key={comment._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <img 
                    src={comment.user.profilePic || '/default-avatar.png'} 
                    alt={comment.user.username} 
                    style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}
                    onClick={() => onSelectProfile(comment.user.username)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="glass-panel" style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'inline-block' }}>
                      <span 
                        style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-main)', marginRight: '6px', cursor: 'pointer' }}
                        onClick={() => onSelectProfile(comment.user.username)}
                      >
                        {comment.user.username}
                      </span>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-main)', marginTop: '2px', wordBreak: 'break-word' }}>
                        {comment.text}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', paddingLeft: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => setShowReplyForm(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                        style={{ background: 'none', color: 'var(--color-primary)', fontSize: '11px', padding: 0 }}
                      >
                        Reply
                      </button>
                    </div>

                    {/* Nested Replies Loop */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', paddingLeft: '24px' }}>
                        {comment.replies.map(reply => (
                          <div key={reply._id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <img 
                              src={reply.user.profilePic || '/default-avatar.png'} 
                              alt={reply.user.username} 
                              style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer' }}
                              onClick={() => onSelectProfile(reply.user.username)}
                            />
                            <div className="glass-panel" style={{ padding: '6px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', display: 'inline-block' }}>
                              <span 
                                style={{ fontWeight: '700', fontSize: '11px', color: 'var(--text-main)', cursor: 'pointer' }}
                                onClick={() => onSelectProfile(reply.user.username)}
                              >
                                {reply.user.username}
                              </span>
                              <p style={{ fontSize: '11.5px', color: 'var(--text-main)', marginTop: '1px' }}>{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write Nested Reply Form */}
                    {showReplyForm[comment._id] && (
                      <form onSubmit={(e) => handleAddReply(e, comment._id)} style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: '24px' }}>
                        <input
                          type="text"
                          placeholder="Reply to this comment..."
                          value={replyInputs[comment._id] || ''}
                          onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                          style={{ flex: 1, height: '30px', fontSize: '12px' }}
                        />
                        <button type="submit" className="btn-secondary" style={{ padding: '6px 10px', height: '30px' }}>
                          <CornerDownRight size={12} />
                        </button>
                      </form>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
