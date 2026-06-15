import React, { useContext, useEffect, useState } from 'react';
import { VibeContext } from '../../context/VibeContext.jsx';
import { X, ChevronLeft, ChevronRight, Music } from 'lucide-react';

const MomentViewer = ({ moments, startIndex, onClose }) => {
  const { playTrack, stopTrack } = useContext(VibeContext);
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const activeMoment = moments[index];

  useEffect(() => {
    setProgress(0);
    if (activeMoment?.vibe?.previewUrl) {
      playTrack({
        id: activeMoment._id,
        title: activeMoment.vibe.title,
        artist: activeMoment.vibe.artist,
        previewUrl: activeMoment.vibe.previewUrl,
        coverUrl: activeMoment.vibe.coverUrl,
      });
    } else {
      stopTrack();
    }
  }, [index, activeMoment]);

  // Slide Progress and Auto-Advance (5 seconds per slide)
  useEffect(() => {
    const duration = 5000; // 5s
    const step = 50; // update progress every 50ms
    const totalSteps = duration / step;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const percent = (currentStep / totalSteps) * 100;
      setProgress(percent);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        handleNext();
      }
    }, step);

    return () => clearInterval(timer);
  }, [index]);

  const handleNext = () => {
    if (index < moments.length - 1) {
      setIndex(index + 1);
    } else {
      // Close when finished
      stopTrack();
      onClose();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (!activeMoment) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 7, 12, 0.95)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
    }}>
      {/* Top Slide indicator bars */}
      <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', gap: '4px', zIndex: 10 }}>
        {moments.map((_, idx) => (
          <div key={idx} style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: 'var(--primary-glow)',
              width: idx < index ? '100%' : idx === index ? `${progress}%` : '0%',
              transition: idx === index ? 'none' : 'width 0.2s linear',
            }}></div>
          </div>
        ))}
      </div>

      {/* Top author details and close button */}
      <div style={{ position: 'absolute', top: '28px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={activeMoment.author.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{activeMoment.author.username}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              {new Date(activeMoment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            stopTrack();
            onClose();
          }}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Arrows */}
      <button onClick={handlePrev} disabled={index === 0} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1, zIndex: 10 }}>
        <ChevronLeft size={24} />
      </button>

      <button onClick={handleNext} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}>
        <ChevronRight size={24} />
      </button>

      {/* Slide Content */}
      <div style={{ width: '100%', maxWidth: '450px', height: '80%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        {activeMoment.mediaType === 'video' ? (
          <video src={activeMoment.media} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={activeMoment.media} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* Caption Overlay */}
        {activeMoment.caption && (
          <div style={{ position: 'absolute', bottom: '80px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '12px 16px', borderRadius: '10px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'white' }}>{activeMoment.caption}</p>
          </div>
        )}

        {/* Vibe Song overlay */}
        {activeMoment.vibe?.title && (
          <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '10px 16px', borderRadius: '30px' }}>
            <img src={activeMoment.vibe.coverUrl} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', animation: 'spinSlow 6s infinite linear' }} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Playing Vibe</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeMoment.vibe.title}</span>
            </div>
            <Music size={16} style={{ color: '#10b981' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentViewer;
