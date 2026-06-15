import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { VibeContext } from '../context/VibeContext.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';
import PostCard from '../components/Pulse/PostCard.jsx';
import API from '../services/api.js';
import { Music, Plus, Edit, Send, Check, Upload, UserPlus } from 'lucide-react';

const Canvas = () => {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useContext(AuthContext);
  const { playTrack } = useContext(VibeContext);

  const [canvasUser, setCanvasUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Edit states
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [vibeSong, setVibeSong] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Music Search states
  const [musicQuery, setMusicQuery] = useState('');
  const [tracks, setTracks] = useState([]);

  const fetchCanvas = async () => {
    setLoading(true);
    try {
      const userRes = await API.get(`/users/canvas/${username}`);
      setCanvasUser(userRes.data);

      // Fetch posts written by this user. Filter local pulse or write custom endpoint
      const postsRes = await API.get('/posts');
      const filtered = postsRes.data.filter((p) => p.author.username === username);
      setPosts(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvas();
  }, [username, currentUser]);

  const searchMusic = async () => {
    if (!musicQuery) return;
    try {
      const response = await API.get(`/integrations/spotify/search?query=${musicQuery}`);
      setTracks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (type === 'avatar') setAvatar(res.data.url);
      if (type === 'banner') setBanner(res.data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const updated = await updateProfile({
        bio,
        avatar,
        banner,
        vibeSong,
      });
      setCanvasUser((prev) => ({ ...prev, ...updated }));
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const sendInvite = async () => {
    try {
      await API.post('/users/circle/request', { targetUserId: canvasUser._id });
      alert('Circle invite sent!');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-gradient" style={{ fontWeight: 600 }}>Drawing Canvas profile...</span>
        </main>
      </div>
    );
  }

  if (!canvasUser) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>User Canvas not found</span>
        </main>
      </div>
    );
  }

  const isSelf = currentUser?.username === username;
  const isFriend = currentUser?.circle.some((f) => f._id === canvasUser._id || f.username === canvasUser.username);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ flexDirection: 'column', paddingLeft: '24px', alignItems: 'stretch' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Banner & Avatar */}
          <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
            {/* Banner image */}
            <div style={{ height: '240px', width: '100%', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
              <img
                src={editMode ? banner || canvasUser.banner : canvasUser.banner}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {editMode && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="file" onChange={(e) => handleUploadImage(e, 'banner')} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Change Banner</span>
                </div>
              )}
            </div>

            {/* Canvas Info */}
            <div style={{ padding: '24px', position: 'relative', marginTop: '-60px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
              {/* Overlapping Avatar */}
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img
                  src={editMode ? avatar || canvasUser.avatar : canvasUser.avatar}
                  alt={canvasUser.username}
                  className="avatar-image"
                  style={{ width: '120px', height: '120px', border: canvasUser.isPremium ? '4px solid #fbbf24' : '4px solid var(--primary)', borderRadius: '50%' }}
                />

                {editMode && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary-gradient)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-secondary)', cursor: 'pointer' }}>
                    <input type="file" onChange={(e) => handleUploadImage(e, 'avatar')} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                    <Upload size={14} style={{ color: 'white' }} />
                  </div>
                )}
              </div>

              {/* Title & Stats */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{canvasUser.username}</h2>
                  {canvasUser.isPremium && <span className="premium-badge" style={{ fontSize: '10px' }}>Premium</span>}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {isSelf ? currentUser.email : `@${canvasUser.username}`}
                </p>
                <p style={{ fontSize: '14px', marginTop: '12px', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  "{canvasUser.bio}"
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {isSelf ? (
                  editMode ? (
                    <>
                      <button onClick={saveProfile} disabled={uploading} className="btn-primary">
                        <Check size={16} />
                        <span>Save</span>
                      </button>
                      <button onClick={() => setEditMode(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setBio(canvasUser.bio);
                        setAvatar(canvasUser.avatar);
                        setBanner(canvasUser.banner);
                        setVibeSong(canvasUser.vibeSong);
                        setEditMode(true);
                      }}
                      className="btn-secondary"
                    >
                      <Edit size={16} />
                      <span>Edit Canvas</span>
                    </button>
                  )
                ) : (
                  !isFriend ? (
                    <button onClick={sendInvite} className="btn-primary">
                      <UserPlus size={16} />
                      <span>Add to Circle</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '13px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-glow)', border: '1px solid var(--primary)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}>
                      In Circle
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Edit Panel Profile Spotify Vibe Selection */}
          {editMode && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>Customize Bio & Vibe Song</h3>
              <textarea
                placeholder="Describe your Canvas bio..."
                className="input-field"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Featured Profile Vibe Song</label>
                {vibeSong ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{vibeSong.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>- {vibeSong.artist}</span>
                    </div>
                    <button onClick={() => setVibeSong(null)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Search Spotify featured track..."
                      className="input-field"
                      value={musicQuery}
                      onChange={(e) => setMusicQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                    />
                    <button onClick={searchMusic} className="btn-secondary" style={{ padding: '10px' }}>Search</button>
                  </div>
                )}

                {/* Search result list */}
                {!vibeSong && tracks.length > 0 && (
                  <div style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '8px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setVibeSong(track)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        className="btn-secondary"
                      >
                        <img src={track.coverUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{track.title}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{track.artist}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Canvas Spotify Vibe Song rendering */}
          {canvasUser.vibeSong?.title && !editMode && (
            <div
              className="glass-panel"
              onClick={() => canvasUser.vibeSong.previewUrl && playTrack({
                title: canvasUser.vibeSong.title,
                artist: canvasUser.vibeSong.artist,
                previewUrl: canvasUser.vibeSong.previewUrl,
                coverUrl: canvasUser.vibeSong.coverUrl,
              })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 24px',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                cursor: 'pointer',
              }}
            >
              <img
                src={canvasUser.vibeSong.coverUrl}
                alt=""
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', animation: 'spinSlow 6s infinite linear' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary-glow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Featured Vibe</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{canvasUser.vibeSong.title}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{canvasUser.vibeSong.artist}</span>
              </div>
              <Music size={24} className="text-gradient" />
            </div>
          )}

          {/* Own User Posts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Posts ({posts.length})</h3>
            {posts.length > 0 ? (
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
                <span style={{ color: 'var(--text-muted)' }}>No posts yet on this Canvas profile.</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Canvas;
