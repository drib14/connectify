import React, { createContext, useState, useEffect, useRef } from 'react';

export const VibeContext = createContext();

export const VibeProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Stop playing when track changes
    audioRef.current.pause();
    setIsPlaying(false);

    if (currentTrack?.previewUrl) {
      audioRef.current.src = currentTrack.previewUrl;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio playback failed or was interrupted:', err));

      const handleEnded = () => {
        setIsPlaying(false);
      };
      
      const audioInstance = audioRef.current;
      audioInstance.addEventListener('ended', handleEnded);
      return () => {
        audioInstance.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentTrack]);

  const playTrack = (track) => {
    if (!track.previewUrl) {
      alert("No audio preview available for this track (Spotify limits previews for some regions).");
      return;
    }
    
    if (currentTrack?.id === track.id || currentTrack?.previewUrl === track.previewUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error(err));
      }
    } else {
      setCurrentTrack(track);
    }
  };

  const stopTrack = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <VibeContext.Provider value={{ currentTrack, isPlaying, playTrack, stopTrack }}>
      {children}
    </VibeContext.Provider>
  );
};
