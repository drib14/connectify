import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { HiPhotograph, HiEmojiHappy, HiGlobe, HiLockClosed, HiUsers, HiAcademicCap, HiBriefcase, HiHeart, HiLightBulb, HiThumbUp, HiChat, HiBookmark, HiDotsHorizontal, HiTrash } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import './Feed.css';

const moodEmojis = { happy: '😊', sad: '😢', anxious: '😰', excited: '🤩', neutral: '😐', grateful: '🙏', frustrated: '😤', hopeful: '🌟', tired: '😴', inspired: '💡' };
const visibilityIcons = { public: HiGlobe, family: HiHeart, friends: HiUsers, coworkers: HiBriefcase, classmates: HiAcademicCap };

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', postType: 'regular', visibility: 'public', moodTag: '', topics: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCircle, setActiveCircle] = useState('');

  useEffect(() => { fetchPosts(); }, [activeFilter, activeCircle]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('type', activeFilter);
      if (activeCircle) params.set('circle', activeCircle);
      const { data } = await API.get(`/posts/feed?${params}`);
      setPosts(data.posts);
    } catch (e) { toast.error('Failed to load feed.'); }
    finally { setLoading(false); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return toast.error('Post cannot be empty.');
    try {
      const body = { ...newPost, topics: newPost.topics ? JSON.stringify(newPost.topics.split(',').map(t => t.trim())) : '[]' };
      const { data } = await API.post('/posts', body);
      setPosts([data, ...posts]);
      setNewPost({ content: '', postType: 'regular', visibility: 'public', moodTag: '', topics: '' });
      setShowCreatePost(false);
      toast.success('Posted! 🎉');
    } catch (e) { toast.error('Failed to create post.'); }
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
    } catch (e) { toast.error('Failed to delete.'); }
  };

  const VisIcon = visibilityIcons[newPost.visibility] || HiGlobe;

  return (
    <div className="feed-page">
      <h1 className="heading-2" style={{ marginBottom: 'var(--space-lg)' }}>Feed</h1>

      {/* Create Post */}
      <div className="card create-post-card" id="create-post">
        <div className="create-post-header" onClick={() => setShowCreatePost(!showCreatePost)}>
          {user?.avatar ? <img src={user.avatar} className="avatar avatar-md" alt="" /> : <div className="avatar avatar-md avatar-placeholder">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>}
          <div className="create-post-prompt">What's on your mind, {user?.firstName}?</div>
        </div>

        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="create-post-form animate-fade-in-up">
            <textarea className="form-input form-textarea" placeholder="Share your thoughts..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={4} />

            <div className="create-post-options">
              <div className="create-post-option-group">
                <select className="create-post-select" value={newPost.visibility} onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}>
                  <option value="public">🌍 Public</option>
                  <option value="family">❤️ Family</option>
                  <option value="friends">👥 Friends</option>
                  <option value="coworkers">💼 Coworkers</option>
                  <option value="classmates">🎓 Classmates</option>
                </select>

                <select className="create-post-select" value={newPost.postType} onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}>
                  <option value="regular">📝 Regular</option>
                  <option value="realityCheck">⚖️ Reality Check</option>
                  <option value="knowledgeShare">📚 Knowledge</option>
                  <option value="moodPost">💭 Mood Post</option>
                  <option value="goalUpdate">🎯 Goal Update</option>
                  <option value="noFilter">📷 No Filter</option>
                </select>

                <select className="create-post-select" value={newPost.moodTag} onChange={(e) => setNewPost({ ...newPost, moodTag: e.target.value })}>
                  <option value="">😶 Mood (optional)</option>
                  {Object.entries(moodEmojis).map(([key, emoji]) => <option key={key} value={key}>{emoji} {key}</option>)}
                </select>
              </div>

              <input type="text" className="form-input" placeholder="Topics (comma separated)" value={newPost.topics} onChange={(e) => setNewPost({ ...newPost, topics: e.target.value })} style={{ fontSize: 'var(--text-sm)' }} />
            </div>

            <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-sm)' }}>
              <button type="button" className="btn btn-ghost btn-sm"><HiPhotograph style={{ fontSize: 20 }} /> Media</button>
              <button type="submit" className="btn btn-primary" id="submit-post">Post</button>
            </div>
          </form>
        )}
      </div>

      {/* Feed Filters */}
      <div className="feed-filters">
        <div className="tabs">
          {['all', 'regular', 'knowledgeShare', 'realityCheck', 'moodPost', 'goalUpdate'].map(f => (
            <button key={f} className={`tab ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
              {f === 'all' ? 'All' : f === 'knowledgeShare' ? '📚 Knowledge' : f === 'realityCheck' ? '⚖️ Reality' : f === 'moodPost' ? '💭 Mood' : f === 'goalUpdate' ? '🎯 Goals' : '📝 Regular'}
            </button>
          ))}
        </div>

        <div className="feed-circle-filters">
          {['', 'family', 'friends', 'coworkers', 'classmates'].map(c => (
            <button key={c} className={`tag ${activeCircle === c ? 'active' : ''}`} onClick={() => setActiveCircle(c)}>
              {c === '' ? 'All Circles' : c === 'family' ? '❤️ Family' : c === 'friends' ? '👥 Friends' : c === 'coworkers' ? '💼 Coworkers' : '🎓 Classmates'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="loader"><div className="spinner spinner-lg"></div></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No posts yet</div>
          <div className="empty-state-text">Be the first to share something! Create a post above.</div>
        </div>
      ) : (
        <div className="feed-posts">
          {posts.map((post, index) => (
            <div key={post._id} className="card post-card animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Post Header */}
              <div className="post-header">
                <div className="post-author">
                  {post.isAnonymous ? (
                    <div className="avatar avatar-md avatar-placeholder">🎭</div>
                  ) : post.author?.avatar ? (
                    <img src={post.author.avatar} className="avatar avatar-md" alt="" />
                  ) : (
                    <div className="avatar avatar-md avatar-placeholder">{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</div>
                  )}
                  <div>
                    <div className="post-author-name">
                      {post.isAnonymous ? 'Anonymous' : `${post.author?.firstName} ${post.author?.lastName}`}
                      {post.author?.contributionScore > 50 && <span className="badge badge-primary" style={{ marginLeft: 6 }}>⭐ {post.author.contributionScore}</span>}
                    </div>
                    <div className="post-meta">
                      {post.isAnonymous ? '' : `@${post.author?.username} · `}
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      {post.visibility !== 'public' && <span className="post-visibility"> · <HiLockClosed style={{ fontSize: 12 }} /> {post.visibility}</span>}
                    </div>
                  </div>
                </div>
                <div className="post-actions-menu">
                  {post.moodTag && <span className="badge badge-warm">{moodEmojis[post.moodTag]} {post.moodTag}</span>}
                  {post.postType !== 'regular' && <span className="badge badge-secondary">{post.postType}</span>}
                  {post.author?._id === user?._id && (
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(post._id)}><HiTrash /></button>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="post-content">
                <p>{post.content}</p>
                {post.contextNotes && <div className="post-context-note">📎 Context: {post.contextNotes}</div>}
                {post.realityCheckData && (
                  <div className="post-reality-check">
                    <div className="reality-success">✅ <strong>Success:</strong> {post.realityCheckData.success}</div>
                    <div className="reality-struggle">💪 <strong>Struggle:</strong> {post.realityCheckData.struggle}</div>
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
                  {post.topics.map(t => <span key={t} className="tag">#{t}</span>)}
                </div>
              )}

              {/* Post Engagement */}
              <div className="post-engagement">
                <button className={`post-engagement-btn ${post.likes?.includes(user?._id) ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
                  <HiThumbUp /> <span>{post.likes?.length || 0}</span>
                </button>
                <button className="post-engagement-btn">
                  <HiChat /> <span>{post.comments?.length || 0}</span>
                </button>
                <button className="post-engagement-btn" onClick={() => handleBookmark(post._id)}>
                  <HiBookmark />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;
