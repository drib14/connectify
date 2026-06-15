import React, { useContext } from 'react';
import { VibeContext } from '../../context/VibeContext.jsx';
import { Play, Pause, X, Music } from 'lucide-react';

const FloatingPlayer = () => {
  const { currentTrack, isPlaying, playTrack, stopTrack } = useContext(VibeContext);

  if (!currentTrack) return null;

  return (
    <div className="music-playing-widget pulsing-border">
      {/* Cover / Music Icon */}
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

      {/* Track Info */}
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '140px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentTrack.title}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentTrack.artist}
        </span>
      </div>

      {/* Soundwave animation */}
      {isPlaying && (
        <div className="music-wave">
          <div className="music-bar"></div>
          <div className="music-bar"></div>
          <div className="music-bar"></div>
          <div className="music-bar"></div>
        </div>
      )}

      {/* Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
  );
};

export default FloatingPlayer;
