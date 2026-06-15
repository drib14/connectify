import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import { Plus, X, Upload, Send, Music } from 'lucide-react';
import MomentViewer from './MomentViewer.jsx';

const MomentsSection = () => {
  const { user } = useContext(AuthContext);
  const [moments, setMoments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Spotify integration
  const [musicQuery, setMusicQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Viewer states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const fetchMoments = async () => {
    try {
      const response = await API.get('/moments');
      setMoments(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoments();
    }
  }, [user]);

  const searchMusic = async () => {
    if (!musicQuery) return;
    try {
      const response = await API.get(`/integrations/spotify/search?query=${musicQuery}`);
      setTracks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadFile = async (e) => {
    setFile(e.target.files[0]);
  };

  const handlePublish = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // 1. Upload media to Express server upload endpoint (which pushes to Cloudinary)
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const mediaUrl = uploadRes.data.url;
      const mediaType = uploadRes.data.type; // image or video

      // 2. Publish story (moment)
      await API.post('/moments', {
        media: mediaUrl,
        mediaType,
        caption,
        vibe: selectedTrack ? {
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          previewUrl: selectedTrack.previewUrl,
          coverUrl: selectedTrack.coverUrl,
        } : null,
      });

      setShowCreateModal(false);
      setFile(null);
      setCaption('');
      setSelectedTrack(null);
      setMusicQuery('');
      setTracks([]);
      fetchMoments();
    } catch (err) {
      console.error('Publish story failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const openViewer = (index) => {
    setViewerStartIndex(index);
    setViewerOpen(true);
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="moments-strip">
        {/* Creator's add story card */}
        <div
          className="moment-card"
          onClick={() => setShowCreateModal(true)}
          style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--primary)' }}
        >
          <div style={{ width: '100%', height: '100px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} className="text-gradient" />
          </div>
          <div className="moment-overlay" style={{ height: '60px', top: 'auto', bottom: 0, justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>Share Moment</span>
          </div>
        </div>

        {/* Dynamic Moments */}
        {moments.map((moment, idx) => (
          <div
            key={moment._id}
            className="moment-card"
            onClick={() => openViewer(idx)}
          >
            {moment.mediaType === 'video' ? (
              <video src={moment.media} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={moment.media} alt="" />
            )}
            <div className="moment-overlay">
              <img src={moment.author.avatar} className="moment-user-avatar" alt="" style={{ border: moment.author.isPremium ? '2px solid #fbbf24' : '2px solid var(--primary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {moment.vibe?.title && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(16,185,129,0.8)', padding: '2px 4px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                    <Music size={8} style={{ color: 'white' }} />
                    <span style={{ fontSize: '8px', color: 'white', fontWeight: 700 }}>Vibe</span>
                  </div>
                )}
                <span className="moment-user-name">{moment.author.username}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moment Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '460px', padding: '24px', position: 'relative' }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Share a Moment</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Media File Upload */}
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleUploadFile}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                {file ? (
                  <div style={{ textAlign: 'center' }}>
                    <Upload size={32} className="text-gradient" />
                    <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>{file.name}</p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                    <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-muted)' }}>Choose Photo or Video</p>
                  </div>
                )}
              </div>

              {/* Caption */}
              <input
                type="text"
                placeholder="Write a caption..."
                className="input-field"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              {/* Attach Music */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Attach music vibe</label>
                {selectedTrack ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={16} className="text-gradient" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedTrack.title}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>- {selectedTrack.artist}</span>
                    </div>
                    <button onClick={() => setSelectedTrack(null)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Search Spotify track..."
                      className="input-field"
                      value={musicQuery}
                      onChange={(e) => setMusicQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                    />
                    <button onClick={searchMusic} className="btn-secondary" style={{ padding: '10px 14px' }}>Search</button>
                  </div>
                )}

                {!selectedTrack && tracks.length > 0 && (
                  <div style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '8px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}
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

              <button
                onClick={handlePublish}
                disabled={!file || uploading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={16} />
                <span>{uploading ? 'Sharing Vibe...' : 'Share to Moments'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full screen viewer */}
      {viewerOpen && (
        <MomentViewer
          moments={moments}
          startIndex={viewerStartIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default MomentsSection;
