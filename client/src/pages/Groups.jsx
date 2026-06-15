import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';
import PostCard from '../components/Pulse/PostCard.jsx';
import API from '../services/api.js';
import { Users, Plus, X, Search, Send } from 'lucide-react';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Group creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Group post creation states
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await API.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroupPosts = async (groupId) => {
    setLoadingPosts(true);
    try {
      const res = await API.get(`/groups/${groupId}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPosts(selectedGroup._id);
    }
  }, [selectedGroup]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setCreating(true);
    try {
      const res = await API.post('/groups', {
        name: groupName,
        description: groupDesc,
      });
      setGroups((prev) => [res.data, ...prev]);
      setSelectedGroup(res.data);
      setShowCreateModal(false);
      setGroupName('');
      setGroupDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinToggle = async (group) => {
    try {
      const res = await API.post(`/groups/${group._id}/join`);
      setGroups((prev) => prev.map((g) => (g._id === group._id ? res.data : g)));
      setSelectedGroup(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !selectedGroup) return;
    setPublishing(true);
    try {
      const res = await API.post(`/groups/${selectedGroup._id}/posts`, {
        content: postContent,
      });
      setPosts((prev) => [res.data, ...prev]);
      setPostContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMember = selectedGroup && selectedGroup.members.some((m) => m._id === user._id);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ paddingLeft: '24px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Left Split Explorer list */}
          <div className="glass-panel" style={{ width: '300px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Groups</h3>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search groups..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredGroups.length > 0 ? (
                filteredGroups.map((g) => (
                  <div
                    key={g._id}
                    onClick={() => setSelectedGroup(g)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedGroup?._id === g._id ? '1px solid var(--primary)' : '1px solid transparent',
                      background: selectedGroup?._id === g._id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      transition: 'var(--transition-smooth)',
                    }}
                    className="btn-secondary"
                  >
                    <img src={g.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{g.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.members.length} members</span>
                    </div>
                  </div>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No groups found.</span>
              )}
            </div>
          </div>

          {/* Right Split Group Detail */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedGroup ? (
              <>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={selectedGroup.avatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedGroup.name}</h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Community • {selectedGroup.members.length} members
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinToggle(selectedGroup)}
                      className={isMember ? "btn-secondary" : "btn-primary"}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {isMember ? "Leave Group" : "Join Group"}
                    </button>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {selectedGroup.description || "No description provided for this community."}
                  </p>
                </div>

                {isMember ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <form onSubmit={handleCreatePost} className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder={`Publish a post in ${selectedGroup.name}...`}
                        className="input-field"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" disabled={publishing || !postContent.trim()} className="btn-primary" style={{ padding: '12px' }}>
                        <Send size={16} />
                      </button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {loadingPosts ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <span className="text-gradient" style={{ fontWeight: 600 }}>Syncing group feed...</span>
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
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No posts in this community yet. Be the first to share!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Users size={40} className="text-gradient" style={{ opacity: 0.5 }} />
                    <h3 style={{ fontSize: '16px' }}>Private Community</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                      Join this group to see post updates, communicate with other members, and publish content.
                    </p>
                    <button onClick={() => handleJoinToggle(selectedGroup)} className="btn-primary" style={{ marginTop: '8px' }}>
                      Join Group
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px', textAlign: 'center' }}>
                <Users size={48} className="text-gradient" />
                <h3 style={{ fontSize: '18px' }}>Welcome to Connectify Communities</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px' }}>
                  Explore list tags, search communities on the left panel, join discussions, or build a new group of your own.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <form onSubmit={handleCreateGroup} className="glass-panel" style={{ width: '90%', maxWidth: '440px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px' }}>Create Group</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript Developers"
                  className="input-field"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  placeholder="What is this group about?"
                  className="input-field"
                  rows={4}
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !groupName.trim()}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>{creating ? 'Creating...' : 'Create Community'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Groups;
