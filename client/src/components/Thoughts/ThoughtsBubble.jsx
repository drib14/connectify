import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { VibeContext } from '../../context/VibeContext.jsx';
import API from '../../services/api.js';
import { Music, Plus, Send, X } from 'lucide-react';

const ThoughtsBubble = () => {
  const { user } = useContext(AuthContext);
  const { playTrack } = useContext(VibeContext);
  const [thoughts, setThoughts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState('');
  
  // Spotify Integration states
  const [musicQuery, setMusicQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const fetchThoughts = async () => {
    try {
      const response = await API.get('/users/thoughts');
      setThoughts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchThoughts();
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

  const handlePublish = async () => {
    try {
      await API.put('/users/thought', {
        text,
        vibe: selectedTrack ? {
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          previewUrl: selectedTrack.previewUrl,
        } : null,
      });
      setShowModal(false);
      setText('');
      setSelectedTrack(null);
      setMusicQuery('');
      setTracks([]);
      fetchThoughts();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  // Find user's own active thought
  const ownThought = thoughts.find((t) => t._id === user._id)?.thought || user.thought;

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Thoughts
      </h3>

      <div className="thoughts-section">
        {/* Own User Thought Trigger */}
        <div className="thought-bubble-wrapper" onClick={() => setShowModal(true)}>
          <div style={{ position: 'relative' }}>
            <img
              src={user.avatar}
              alt={user.username}
              className="avatar-image"
              style={{ width: '48px', height: '48px', opacity: 0.8 }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-secondary)',
              color: 'white',
            }}>
              <Plus size={10} />
            </div>

            {/* Bubble above Avatar */}
            {ownThought?.text && (
              <div className="thought-bubble">
                {ownThought.text}
              </div>
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Share thought
          </span>
        </div>

        {/* Circles Thoughts bubbles */}
        {thoughts
          .filter((t) => t._id !== user._id)
          .map((item) => (
            <div
              key={item._id}
              className="thought-bubble-wrapper"
              onClick={() => item.thought?.vibe?.previewUrl && playTrack({
                title: item.thought.vibe.title,
                artist: item.thought.vibe.artist,
                previewUrl: item.thought.vibe.previewUrl,
              })}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={item.avatar}
                  alt={item.username}
                  className="avatar-image"
                  style={{ width: '48px', height: '48px' }}
                />

                <div className="thought-bubble">
                  {item.thought.text}
                </div>

                {/* Music Badge on thought */}
                {item.thought.vibe?.previewUrl && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#10b981',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--bg-secondary)',
                    color: 'white',
                  }}>
                    <Music size={8} />
                  </div>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-main)', marginTop: '4px', fontWeight: 500, textAlign: 'center', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.username}
              </span>
            </div>
          ))}
      </div>

      {/* Thought Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '420px', padding: '24px', position: 'relative' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Leave a Thought</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                maxLength={60}
                placeholder="What is on your mind? (Max 60 chars)"
                className="input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {/* Add Vibe Track */}
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
                      placeholder="Search Spotify vibe..."
                      className="input-field"
                      value={musicQuery}
                      onChange={(e) => setMusicQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                    />
                    <button onClick={searchMusic} className="btn-secondary" style={{ padding: '10px 14px' }}>Search</button>
                  </div>
                )}

                {/* Tracks list */}
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
                disabled={!text}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={16} />
                <span>Share Thought</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtsBubble;
