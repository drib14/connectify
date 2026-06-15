import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import Sidebar from '../components/Layout/Sidebar.jsx';
import ClipPlayer from '../components/Clips/ClipPlayer.jsx';
import { Film, Plus, X, Upload, Send, Music } from 'lucide-react';

const Clips = () => {
  const { user } = useContext(AuthContext);
  const [clips, setClips] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Spotify search states
  const [musicQuery, setMusicQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const fetchClips = async () => {
    try {
      const response = await API.get('/clips');
      setClips(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClips();
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

  const handleUploadClip = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const videoUrl = uploadRes.data.url;

      const response = await API.post('/clips', {
        videoUrl,
        caption,
        vibe: selectedTrack ? {
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          previewUrl: selectedTrack.previewUrl,
          coverUrl: selectedTrack.coverUrl,
        } : null,
      });

      setClips((prev) => [response.data, ...prev]);
      setShowUploadModal(false);
      setFile(null);
      setCaption('');
      setSelectedTrack(null);
      setMusicQuery('');
      setTracks([]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const containerHeight = e.target.clientHeight;
    const currentIdx = Math.round(scrollTop / containerHeight);
    if (currentIdx !== activeIdx) {
      setActiveIdx(currentIdx);
    }
  };

  const handleClipUpdated = (updatedClip) => {
    setClips((prev) => prev.map((c) => (c._id === updatedClip._id ? updatedClip : c)));
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        
        {/* Top title and upload trigger */}
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={22} className="text-gradient" />
            <h2 style={{ fontSize: '18px' }}>Connectify Clips</h2>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: '12px' }}
          >
            <Plus size={14} />
            <span>Create Clip</span>
          </button>
        </div>

        {/* Scroll snapping viewport container */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span className="text-gradient" style={{ fontWeight: 600 }}>Streaming Clips feed...</span>
          </div>
        ) : clips.length > 0 ? (
          <div
            onScroll={handleScroll}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: 'calc(100vh - 180px)',
              overflowY: 'scroll',
              scrollSnapType: 'y mandatory',
              borderRadius: '16px',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE
            }}
            className="clips-scroll-container"
          >
            {clips.map((clip, idx) => (
              <div
                key={clip._id}
                style={{
                  width: '100%',
                  height: '100%',
                  scrollSnapAlign: 'start',
                  paddingBottom: '10px',
                }}
              >
                <ClipPlayer
                  clip={clip}
                  isActive={idx === activeIdx}
                  onClipUpdated={handleClipUpdated}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '40px', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>No clips shared yet. Be the first to share!</span>
          </div>
        )}
      </main>

      {/* Clip Upload Modal */}
      {showUploadModal && (
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
              onClick={() => setShowUploadModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px' }}>Create Clip</h2>

            {/* Video file upload selector */}
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
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
                  <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-muted)' }}>Choose Short Video</p>
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

            {/* Spotify Audio integration */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Clip Vibe Song</label>
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
                    placeholder="Search track..."
                    className="input-field"
                    value={musicQuery}
                    onChange={(e) => setMusicQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                  />
                  <button onClick={searchMusic} className="btn-secondary" style={{ padding: '10px' }}>Search</button>
                </div>
              )}

              {!selectedTrack && tracks.length > 0 && (
                <div style={{ maxHeight: '120px', overflowY: 'auto', marginTop: '8px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
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

            <button
              onClick={handleUploadClip}
              disabled={!file || uploading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Send size={16} />
              <span>{uploading ? 'Uploading Clip...' : 'Publish Clip'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clips;
