import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiPhotograph,
  HiEmojiHappy,
  HiGlobe,
  HiLockClosed,
  HiUsers,
  HiAcademicCap,
  HiBriefcase,
  HiHeart,
  HiLightBulb,
  HiThumbUp,
  HiChat,
  HiBookmark,
  HiTrash,
  HiDocumentText,
  HiScale,
  HiBookOpen,
  HiCamera,
  HiTrendingUp,
  HiInbox,
  HiShieldCheck,
  HiPaperClip,
  HiX,
  HiReply,
  HiPlus
} from 'react-icons/hi';
import {
  FaSmile,
  FaFrown,
  FaGrimace,
  FaLaughBeam,
  FaMeh,
  FaPray,
  FaAngry,
  FaRegSmile,
  FaTired,
  FaLightbulb,
  FaStar,
  FaUserSecret,
  FaCheckCircle,
  FaFistRaised,
  FaTrash
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import ProgressLoader from '../../components/UI/ProgressLoader';
import Modal from '../../components/UI/Modal';
import ConfirmModal from '../../components/UI/ConfirmModal';
import EmojiPicker from '../../components/UI/EmojiPicker';
import './Feed.css';

const moodIcons = {
  happy: FaSmile,
  sad: FaFrown,
  anxious: FaGrimace,
  excited: FaLaughBeam,
  neutral: FaMeh,
  grateful: FaPray,
  frustrated: FaAngry,
  hopeful: FaRegSmile,
  tired: FaTired,
  inspired: FaLightbulb
};

const visibilityIcons = {
  public: HiGlobe,
  family: HiHeart,
  friends: HiUsers,
  coworkers: HiBriefcase,
  classmates: HiAcademicCap
};

const postTypeIcons = {
  regular: HiDocumentText,
  realityCheck: HiScale,
  knowledgeShare: HiBookOpen,
  moodPost: HiEmojiHappy,
  goalUpdate: HiTrendingUp,
  noFilter: HiCamera
};

const filterIcons = {
  all: HiGlobe,
  regular: HiDocumentText,
  knowledgeShare: HiBookOpen,
  realityCheck: HiScale,
  moodPost: HiEmojiHappy,
  goalUpdate: HiTrendingUp
};

const Feed = () => {
  const { user, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', postType: 'regular', visibility: 'public', moodTag: '', topics: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCircle, setActiveCircle] = useState('');
  
  // Comment & replies states
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  // Deletion state
  const [postToDelete, setPostToDelete] = useState(null);
  
  // Progress states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);

  // Tipping states
  const [activeTipPostId, setActiveTipPostId] = useState(null);
  const [activeTipCommentId, setActiveTipCommentId] = useState(null);

  // Upcoming events
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const getEventBadge = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : null;

    if (eventDate <= now && (!eventEndDate || eventEndDate >= now)) {
      return { text: 'ONGOING', bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' };
    } else {
      return { text: 'UPCOMING', bg: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFilter, activeCircle]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (activeCircle) params.set('circle', activeCircle);
      const { data } = await API.get(`/posts/feed?${params}`);
      setPosts(data.posts);
    } catch (e) {
      toast.error('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const { data } = await API.get('/events?upcoming=true');
      setUpcomingEvents(data.slice(0, 5));
    } catch (e) {
      console.error('Failed to load upcoming events for feed.');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return toast.error('Post cannot be empty.');
    
    setUploadVisible(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('postType', newPost.postType);
      formData.append('visibility', newPost.visibility);
      formData.append('moodTag', newPost.moodTag);
      formData.append('topics', newPost.topics ? JSON.stringify(newPost.topics.split(',').map(t => t.trim())) : '[]');
      
      selectedFiles.forEach(file => {
        formData.append('postMedia', file);
      });

      const { data } = await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      });
      
      setPosts([data, ...posts]);
      setNewPost({ content: '', postType: 'regular', visibility: 'public', moodTag: '', topics: '' });
      setSelectedFiles([]);
      setShowCreatePost(false);
      toast.success('Posted!');
      refreshUser();
    } catch (e) {
      toast.error('Failed to create post.');
    } finally {
      setTimeout(() => {
        setUploadVisible(false);
      }, 600);
    }
  };
 
  const handleLike = async (postId) => {
    try {
      const { data } = await API.post(`/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (e) {}
  };
 
  const handleBookmark = async (postId) => {
    try {
      await API.post(`/posts/${postId}/bookmark`);
      toast.success('Bookmarked!');
    } catch (e) {}
  };
 
  const handleDelete = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      toast.success('Post deleted.');
    } catch (e) {
      toast.error('Failed to delete.');
    }
  };
 
  const handleAddComment = async (postId) => {
    if (!commentContent.trim()) return;
    try {
      const { data } = await API.post(`/posts/${postId}/comment`, { content: commentContent });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      setCommentContent('');
      toast.success('Comment added!');
      refreshUser();
    } catch (e) {
      toast.error('Failed to comment.');
    }
  };
 
  const handleAddReply = async (postId, commentId) => {
    if (!replyContent.trim()) return;
    try {
      const { data } = await API.post(`/posts/${postId}/comments/${commentId}/replies`, { content: replyContent });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      setReplyContent('');
      setReplyingToCommentId(null);
      toast.success('Reply added!');
      refreshUser();
    } catch (e) {
      toast.error('Failed to reply.');
    }
  };

  const handleTipPost = async (postId, amount) => {
    try {
      const { data } = await API.post(`/posts/${postId}/tip`, { amount });
      toast.success(data.message);
      setActiveTipPostId(null);
      refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send tip.');
    }
  };

  const handleTipComment = async (postId, commentId, amount) => {
    try {
      const { data } = await API.post(`/posts/${postId}/comments/${commentId}/tip`, { amount });
      toast.success(data.message);
      setActiveTipCommentId(null);
      refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send tip.');
    }
  };

  return (
    <div className="feed-page">
      <ProgressLoader progress={uploadProgress} visible={uploadVisible} statusText="Uploading post media..." />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => handleDelete(postToDelete)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action is permanent."
        confirmText="Delete"
      />

      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="heading-2">Feed</h1>
        <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>
          <HiPlus /> Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      <Modal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} title="Create New Post">
        <form onSubmit={handleCreatePost} className="create-post-form flex flex-col gap-md">
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-input form-textarea"
              placeholder="Share your thoughts..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              style={{ paddingBottom: '36px' }}
            />
            <div style={{ position: 'absolute', right: 12, bottom: 12 }}>
              <EmojiPicker onSelect={(emoji) => setNewPost(prev => ({ ...prev, content: prev.content + emoji }))} />
            </div>
          </div>

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="selected-files-preview animate-fade-in" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedFiles.map((f, i) => (
                <div key={i} className="file-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  <HiPaperClip />
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <HiX />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-sm">
            <label className="form-label">Visibility</label>
            <select className="form-input" value={newPost.visibility} onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}>
              <option value="public">Public</option>
              <option value="family">Family Circle</option>
              <option value="friends">Friends Circle</option>
              <option value="coworkers">Coworkers Circle</option>
              <option value="classmates">Classmates Circle</option>
            </select>
          </div>

          <div className="flex flex-col gap-sm">
            <label className="form-label">Post Type</label>
            <select className="form-input" value={newPost.postType} onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}>
              <option value="regular">Regular Post</option>
              <option value="realityCheck">Reality Check</option>
              <option value="knowledgeShare">Knowledge Share</option>
              <option value="moodPost">Mood Post</option>
              <option value="goalUpdate">Goal Update</option>
              <option value="noFilter">No Filter Challenge</option>
            </select>
          </div>

          <div className="flex flex-col gap-sm">
            <label className="form-label">Mood Tag</label>
            <select className="form-input" value={newPost.moodTag} onChange={(e) => setNewPost({ ...newPost, moodTag: e.target.value })}>
              <option value="">None</option>
              {Object.keys(moodIcons).map((key) => (
                <option key={key} value={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-sm">
            <label className="form-label">Topics</label>
            <input
              type="text"
              className="form-input"
              placeholder="Topics (comma separated)"
              value={newPost.topics}
              onChange={(e) => setNewPost({ ...newPost, topics: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => document.getElementById('post-media-input').click()}
            >
              <HiPhotograph style={{ fontSize: 20 }} /> Add Media
            </button>
            <input
              type="file"
              id="post-media-input"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button type="submit" className="btn btn-primary">
              Post
            </button>
          </div>
        </form>
      </Modal>

      {/* Feed Filters */}
      <div className="feed-filters">
        <div className="tabs">
          {['all', 'regular', 'knowledgeShare', 'realityCheck', 'moodPost', 'goalUpdate'].map((f) => {
            const Icon = filterIcons[f] || HiDocumentText;
            return (
              <button
                key={f}
                className={`tab ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon />
                <span>
                  {f === 'all'
                    ? 'All'
                    : f === 'knowledgeShare'
                    ? 'Knowledge'
                    : f === 'realityCheck'
                    ? 'Reality'
                    : f === 'moodPost'
                    ? 'Moods'
                    : f === 'goalUpdate'
                    ? 'Goals'
                    : 'Regular'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="feed-circle-filters">
          {['', 'family', 'friends', 'coworkers', 'classmates'].map((c) => {
            const Icon = visibilityIcons[c] || HiGlobe;
            return (
              <button
                key={c}
                className={`tag ${activeCircle === c ? 'active' : ''}`}
                onClick={() => setActiveCircle(c)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Icon />
                <span>
                  {c === ''
                    ? 'All Circles'
                    : c === 'family'
                    ? 'Family'
                    : c === 'friends'
                    ? 'Friends'
                    : c === 'coworkers'
                    ? 'Coworkers'
                    : 'Classmates'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events Slider */}
      {upcomingEvents.length > 0 && (
        <div className="feed-upcoming-events animate-fade-in" style={{ marginBottom: 'var(--space-lg)', textAlign: 'left' }}>
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <HiCalendar style={{ color: 'var(--primary)' }} /> Ongoing & Upcoming Events
          </h3>
          <div className="events-slider" style={{ display: 'flex', gap: 'var(--space-md)', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'thin' }}>
            {upcomingEvents.map(event => {
              const badge = getEventBadge(event);
              return (
                <div key={event._id} className="card event-slide-card" style={{ flex: '0 0 240px', padding: 0, overflow: 'hidden', margin: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '90px', background: event.coverImage ? `url(${event.coverImage}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary-dark), var(--secondary-dark))', position: 'relative' }}>
                    <span className="badge badge-primary" style={{ position: 'absolute', top: 8, left: 8, fontSize: '9px', textTransform: 'uppercase', background: 'rgba(0,212,170,0.85)' }}>{event.type}</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 2 }}>
                      <strong style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', margin: 0 }}>{event.title}</strong>
                      <span style={{
                        fontSize: '8px',
                        fontWeight: 700,
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        whiteSpace: 'nowrap'
                      }}>
                        {badge.text}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
                      {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{event.attendees?.length || 0} attending</span>
                      <button
                        className="btn btn-primary btn-xs"
                        style={{ padding: '2px 8px', fontSize: '10px', marginLeft: 'auto' }}
                        onClick={async () => {
                          try {
                            await API.post(`/events/${event._id}/attend`, { status: 'going' });
                            toast.success("RSVP'd!");
                            fetchUpcomingEvents();
                            refreshUser();
                          } catch (e) {
                            toast.error('Failed to RSVP');
                          }
                        }}
                      >
                        RSVP
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <SkeletonLoader type="feed" count={3} />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <HiInbox />
          </div>
          <div className="empty-state-title">No posts yet</div>
          <div className="empty-state-text">Be the first to share something! Create a post above.</div>
        </div>
      ) : (
        <div className="feed-posts">
          {posts.map((post, index) => {
            const VisIcon = visibilityIcons[post.visibility] || HiGlobe;
            const MoodIcon = moodIcons[post.moodTag];
            const PostTypeIcon = postTypeIcons[post.postType];
            const isCommentsOpen = openCommentsPostId === post._id;

            return (
              <div
                key={post._id}
                className="card post-card animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Post Header */}
                <div className="post-header">
                  <div className="post-author">
                    {post.isAnonymous ? (
                      <div className="avatar avatar-md avatar-placeholder">
                        <FaUserSecret />
                      </div>
                    ) : post.author?.avatar ? (
                      <img src={post.author.avatar} className="avatar avatar-md" alt="" />
                    ) : (
                      <div className="avatar avatar-md avatar-placeholder">
                        {post.author?.firstName?.[0]}
                        {post.author?.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="post-author-name">
                        {post.isAnonymous ? 'Anonymous' : `${post.author?.firstName} ${post.author?.lastName}`}
                        {post.author?.contributionScore > 50 && (
                          <span className="badge badge-primary" style={{ marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <FaStar style={{ fontSize: '10px' }} /> {post.author.contributionScore}
                          </span>
                        )}
                      </div>
                      <div className="post-meta">
                        {post.isAnonymous ? '' : `@${post.author?.username} · `}
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        {post.visibility !== 'public' && (
                          <span className="post-visibility" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                            · <VisIcon style={{ fontSize: 12 }} /> {post.visibility}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="post-actions-menu" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {post.moodTag && MoodIcon && (
                      <span className="badge badge-warm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MoodIcon /> {post.moodTag}
                      </span>
                    )}
                    {post.postType !== 'regular' && PostTypeIcon && (
                      <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <PostTypeIcon /> {post.postType === 'knowledgeShare' ? 'Knowledge' : post.postType === 'realityCheck' ? 'Reality' : post.postType}
                      </span>
                    )}
                    {post.author?._id === user?._id && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setPostToDelete(post._id)}>
                        <HiTrash />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.contextNotes && (
                    <div className="post-context-note" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <HiPaperClip /> Context: {post.contextNotes}
                    </div>
                  )}
                  {post.realityCheckData && (
                    <div className="post-reality-check">
                      <div className="reality-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCheckCircle style={{ color: 'var(--success)' }} />
                        <span>
                          <strong>Success:</strong> {post.realityCheckData.success}
                        </span>
                      </div>
                      <div className="reality-struggle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <FaFistRaised style={{ color: 'var(--warm)' }} />
                        <span>
                          <strong>Struggle:</strong> {post.realityCheckData.struggle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Media */}
                {post.media?.length > 0 && (
                  <div className="post-media">
                    {post.media.map((m, i) => (
                      <img key={i} src={m.url} alt="Post media" className="post-media-img" />
                    ))}
                  </div>
                )}

                {/* Topics */}
                {post.topics?.length > 0 && (
                  <div className="post-topics">
                    {post.topics.map((t) => (
                      <span key={t} className="tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Engagement */}
                <div className="post-engagement" style={{ position: 'relative' }}>
                  <button
                    className={`post-engagement-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`}
                    onClick={() => handleLike(post._id)}
                  >
                    <HiThumbUp /> <span>{post.likes?.length || 0}</span>
                  </button>
                  <button className={`post-engagement-btn ${isCommentsOpen ? 'active' : ''}`} onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post._id)}>
                    <HiChat /> <span>{post.comments?.length || 0}</span>
                  </button>
                  
                  {post.author?._id !== user?._id && (
                    <button className={`post-engagement-btn ${activeTipPostId === post._id ? 'active' : ''}`} onClick={() => setActiveTipPostId(activeTipPostId === post._id ? null : post._id)}>
                      <span>🪙 Tip</span>
                    </button>
                  )}

                  {activeTipPostId === post._id && (
                    <div className="tip-popover animate-fade-in" style={{ position: 'absolute', left: '140px', bottom: '40px', background: '#131930', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 100 }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tip:</span>
                      {[5, 10, 20, 50].map(amt => (
                        <button key={amt} className="btn btn-primary btn-xs" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleTipPost(post._id, amt)}>
                          {amt}
                        </button>
                      ))}
                    </div>
                  )}

                  <button className="post-engagement-btn" onClick={() => handleBookmark(post._id)}>
                    <HiBookmark />
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {isCommentsOpen && (
                  <div className="post-comments-drawer animate-fade-in">
                    <div className="comments-divider"></div>
                    
                    {/* Add Comment Input */}
                    <div className="comment-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                      {user?.avatar ? (
                        <img src={user.avatar} className="avatar avatar-sm" alt="" />
                      ) : (
                        <div className="avatar avatar-sm avatar-placeholder">{user?.firstName?.[0]}</div>
                      )}
                      <div className="comment-input-wrapper" style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Write a comment..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          style={{ paddingRight: '40px' }}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                        />
                        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                          <EmojiPicker onSelect={(emoji) => setCommentContent(prev => prev + emoji)} align="right" />
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(post._id)}>Send</button>
                    </div>

                    {/* Comments List */}
                    {post.comments?.length === 0 ? (
                      <p className="no-comments-text" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>No comments yet. Start the conversation!</p>
                    ) : (
                      <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="comment-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                            <div className="comment-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <div className="comment-author" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {comment.isAnonymous ? (
                                  <div className="avatar avatar-xs avatar-placeholder"><FaUserSecret /></div>
                                ) : comment.author?.avatar ? (
                                  <img src={comment.author.avatar} className="avatar avatar-xs" alt="" />
                                ) : (
                                  <div className="avatar avatar-xs avatar-placeholder">{comment.author?.firstName?.[0]}</div>
                                )}
                                <div>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {comment.isAnonymous ? 'Anonymous' : `${comment.author?.firstName} ${comment.author?.lastName}`}
                                  </span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {comment.author?._id !== user?._id && (
                                  <>
                                    <button
                                      className="btn btn-ghost btn-sm"
                                      style={{ padding: '2px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      onClick={() => setActiveTipCommentId(activeTipCommentId === comment._id ? null : comment._id)}
                                    >
                                      <span>🪙 Tip</span>
                                    </button>
                                    {activeTipCommentId === comment._id && (
                                      <div className="tip-popover animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#131930', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>
                                        {[5, 10, 20].map(amt => (
                                          <button key={amt} className="btn btn-primary btn-xs" style={{ padding: '1px 4px', fontSize: '9px', minWidth: 'auto' }} onClick={() => handleTipComment(post._id, comment._id, amt)}>
                                            {amt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ padding: '2px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => setReplyingToCommentId(replyingToCommentId === comment._id ? null : comment._id)}
                                >
                                  <HiReply /> Reply
                                </button>
                              </div>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px 28px' }}>{comment.content}</p>

                            {/* Reply Input Form */}
                            {replyingToCommentId === comment._id && (
                              <div className="reply-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0 8px 28px' }}>
                                <div className="reply-input-wrapper" style={{ flex: 1, position: 'relative' }}>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    style={{ paddingRight: '40px', fontSize: '12px' }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id, comment._id)}
                                    autoFocus
                                  />
                                  <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                                    <EmojiPicker onSelect={(emoji) => setReplyContent(prev => prev + emoji)} align="right" />
                                  </div>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleAddReply(post._id, comment._id)}>Reply</button>
                              </div>
                            )}

                            {/* Nested Replies List */}
                            {comment.replies?.length > 0 && (
                              <div className="comment-replies-list" style={{ marginLeft: '28px', borderLeft: '2px solid rgba(255,255,255,0.05)', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="reply-item">
                                    <div className="reply-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                      {reply.isAnonymous ? (
                                        <div className="avatar avatar-xs avatar-placeholder"><FaUserSecret /></div>
                                      ) : reply.author?.avatar ? (
                                        <img src={reply.author.avatar} className="avatar avatar-xs" alt="" />
                                      ) : (
                                        <div className="avatar avatar-xs avatar-placeholder">{reply.author?.firstName?.[0]}</div>
                                      )}
                                      <div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                          {reply.isAnonymous ? 'Anonymous' : `${reply.author?.firstName} ${reply.author?.lastName}`}
                                        </span>
                                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                        </span>
                                      </div>
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 0 24px' }}>{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
