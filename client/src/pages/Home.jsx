import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import ThoughtsBubble from '../components/Thoughts/ThoughtsBubble.jsx';
import MomentsSection from '../components/Moments/MomentsSection.jsx';
import CreatePostModal from '../components/Pulse/CreatePostModal.jsx';
import PostCard from '../components/Pulse/PostCard.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';
import { PenTool, Image, Music, MapPin } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchFeed = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="feed-container">
          {/* Top Status notes (Thoughts) */}
          <ThoughtsBubble />

          {/* Ephemeral Stories (Moments) */}
          <MomentsSection />

          {/* Post creator mock trigger */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={user.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '30px',
                  padding: '12px 20px',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                }}
                className="input-field"
              >
                What is your vibe today, {user.username}?
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <Image size={16} className="text-gradient" />
                <span>Media</span>
              </button>
              <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <MapPin size={16} style={{ color: '#ec4899' }} />
                <span>Check-in</span>
              </button>
              <button onClick={() => setShowCreateModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <Music size={16} style={{ color: '#10b981' }} />
                <span>Music Vibe</span>
              </button>
            </div>
          </div>

          {/* Pulse Feed list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <span className="text-gradient" style={{ fontWeight: 600 }}>Syncing Pulse feed...</span>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
              />
            ))
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No activity on your Pulse yet. Add friends to your Circle to see posts!</p>
            </div>
          )}
        </div>
      </main>

      {/* Creation Modal overlay */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Home;
