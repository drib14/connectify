import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import API from '../../services/api.js';
import { X, Image, MapPin, Music, Sparkles, Send, Upload } from 'lucide-react';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Aura AI helper state
  const [auraLoading, setAuraLoading] = useState(false);

  // Check-in state
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locQuery, setLocQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);

  // Spotify integration state
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [musicQuery, setMusicQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const searchLocations = async () => {
    if (!locQuery) return;
    try {
      const response = await API.get(`/integrations/locationiq/search?query=${locQuery}`);
      setLocations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchMusic = async () => {
    if (!musicQuery) return;
    try {
      const response = await API.get(`/integrations/spotify/search?query=${musicQuery}`);
      setTracks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const askAuraAI = async () => {
    if (!content) {
      alert('Write a rough draft first so Aura can polish it!');
      return;
    }
    setAuraLoading(true);
    try {
      const response = await API.post('/integrations/gemini/aura', {
        prompt: content,
        action: 'caption',
      });
      setContent(response.data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setAuraLoading(false);
    }
  };

  const handlePublish = async () => {
    setUploading(true);
    try {
      let mediaArray = [];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        mediaArray.push({
          url: uploadRes.data.url,
          type: uploadRes.data.type,
        });
      }

      const postRes = await API.post('/posts', {
        content,
        media: mediaArray,
        location: selectedLoc ? {
          name: selectedLoc.name,
          lat: selectedLoc.lat,
          lon: selectedLoc.lon,
        } : null,
        vibe: selectedTrack ? {
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          previewUrl: selectedTrack.previewUrl,
          coverUrl: selectedTrack.coverUrl,
        } : null,
      });

      onPostCreated(postRes.data);
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '520px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '20px' }}>Create Post</h2>

        {/* User profile identifier header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={user.avatar} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.username}</span>
            {selectedLoc && (
              <span style={{ fontSize: '11px', color: 'var(--primary-glow)' }}>
                at {selectedLoc.name.split(',')[0]}
              </span>
            )}
          </div>
        </div>

        {/* Text Input area */}
        <div style={{ position: 'relative' }}>
          <textarea
            rows={4}
            placeholder="What is your vibe today? Share updates..."
            className="input-field"
            style={{ width: '100%', resize: 'none', paddingRight: '40px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Aura AI float button inside input */}
          <button
            onClick={askAuraAI}
            disabled={auraLoading || !content}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'var(--primary-gradient)',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'white',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: content ? 1 : 0.6,
            }}
            title="Polished by Aura AI"
          >
            <Sparkles size={12} />
            <span>{auraLoading ? 'Polishing...' : 'Aura AI'}</span>
          </button>
        </div>

        {/* Selected media file status */}
        {file && (
          <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Attached: {file.name}</span>
            <button onClick={() => setFile(null)} style={{ float: 'right', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>Remove</button>
          </div>
        )}

        {/* Selected Spotify track status */}
        {selectedTrack && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={16} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{selectedTrack.title}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>- {selectedTrack.artist}</span>
            </div>
            <button onClick={() => setSelectedTrack(null)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '11px' }}>Remove</button>
          </div>
        )}

        {/* Sub-toggles search lists (Location and Spotify) */}
        {showLocationSearch && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search check-in location..."
                className="input-field"
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLocations()}
              />
              <button onClick={searchLocations} className="btn-secondary" style={{ padding: '10px 14px' }}>Search</button>
            </div>
            {locations.length > 0 && (
              <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {locations.map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedLoc(loc);
                      setShowLocationSearch(false);
                      setLocQuery('');
                      setLocations([]);
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}
                    className="btn-secondary"
                  >
                    {loc.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showMusicSearch && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            {tracks.length > 0 && (
              <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      setSelectedTrack(track);
                      setShowMusicSearch(false);
                      setMusicQuery('');
                      setTracks([]);
                    }}
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
        )}

        {/* Toolbar triggers footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* File upload trigger */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <button className="btn-secondary" style={{ padding: '8px' }} title="Add Media">
                <Image size={18} className="text-gradient" />
              </button>
            </div>

            {/* Check-in Trigger */}
            <button
              onClick={() => {
                setShowLocationSearch(!showLocationSearch);
                setShowMusicSearch(false);
              }}
              className="btn-secondary"
              style={{ padding: '8px' }}
              title="Add Location Check-in"
            >
              <MapPin size={18} style={{ color: '#ec4899' }} />
            </button>

            {/* Spotify Trigger */}
            <button
              onClick={() => {
                setShowMusicSearch(!showMusicSearch);
                setShowLocationSearch(false);
              }}
              className="btn-secondary"
              style={{ padding: '8px' }}
              title="Add Spotify Vibe"
            >
              <Music size={18} style={{ color: '#10b981' }} />
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={(!content && !file && !selectedTrack) || uploading}
            className="btn-primary"
            style={{ padding: '10px 24px' }}
          >
            <Send size={16} />
            <span>{uploading ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
