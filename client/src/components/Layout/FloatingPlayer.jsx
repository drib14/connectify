import React, { useContext, useState, useEffect } from 'react';
import { VibeContext } from '../../context/VibeContext.jsx';
import { Play, Pause, X, Music, Mic } from 'lucide-react';
import API from '../../services/api.js';

const FloatingPlayer = () => {
  const { currentTrack, isPlaying, playTrack, stopTrack } = useContext(VibeContext);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [lyricsLoading, setLyricsLoading] = useState(false);

  useEffect(() => {
    // Reset lyrics when track changes
    setLyrics('');
    if (showLyrics && currentTrack) {
      fetchLyrics();
    }
  }, [currentTrack]);

  useEffect(() => {
    if (showLyrics && !lyrics && currentTrack) {
      fetchLyrics();
    }
  }, [showLyrics]);

  const fetchLyrics = async () => {
    if (!currentTrack) return;
    setLyricsLoading(true);
    try {
      const response = await API.get('/integrations/spotify/lyrics', {
        params: {
          title: currentTrack.title,
          artist: currentTrack.artist
        }
      });
      setLyrics(response.data.lyrics);
    } catch (err) {
      console.error(err);
      setLyrics('Could not retrieve lyrics for this track.');
    } finally {
      setLyricsLoading(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <div
      className="music-playing-widget pulsing-border animate-fade-in"
      style={showLyrics ? {
        flexDirection: 'column',
        borderRadius: '16px',
        alignItems: 'stretch',
        width: '320px',
        padding: '16px',
        transition: 'all 0.3s ease',
      } : {
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top player strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {/* Cover / Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                animation: isPlaying ? 'spinSlow 8s infinite linear' : 'none',
              }}
            />
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Music size={18} className="text-gradient" />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '100px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPlaying && (
            <div className="music-wave" style={{ marginRight: '4px' }}>
              <div className="music-bar"></div>
              <div className="music-bar"></div>
              <div className="music-bar"></div>
              <div className="music-bar"></div>
            </div>
          )}

          {/* Toggle lyrics button */}
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            style={{
              background: showLyrics ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              border: 'none',
              color: showLyrics ? 'var(--primary-glow)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)',
            }}
            title={showLyrics ? "Hide Lyrics" : "Show Lyrics"}
          >
            <Mic size={15} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => playTrack(currentTrack)}
            style={{
              background: 'var(--primary-gradient)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Stop / Close */}
          <button
            onClick={stopTrack}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Expanded lyrics box */}
      {showLyrics && (
        <div style={{
          marginTop: '12px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '12px',
          maxHeight: '160px',
          overflowY: 'auto',
          fontSize: '12px',
          lineHeight: '1.6',
          color: 'var(--text-main)',
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          fontStyle: 'italic',
          scrollbarWidth: 'none',
          maskImage: 'linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, white 15%, white 85%, transparent 100%)',
        }}>
          {lyricsLoading ? (
            <span className="text-gradient" style={{ fontWeight: 600 }}>Tuning lyrics with Aura AI...</span>
          ) : (
            lyrics || 'No lyrics found.'
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingPlayer;
