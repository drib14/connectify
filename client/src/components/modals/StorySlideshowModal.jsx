import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StorySlideshowModal({ 
  isOpen, 
  stories, 
  activeStoryIndex, 
  setActiveStoryIndex, 
  setStorySlideshowOpen 
}) {
  if (!isOpen || stories.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000000 }}>
      <button 
        onClick={() => setStorySlideshowOpen(false)} 
        style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', padding: '10px' }}
      >
        <X size={20} />
      </button>
      
      <div style={{ position: 'relative', width: '380px', height: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
        
        {/* Story slide header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <img 
            src={stories[activeStoryIndex].user.profilePic || '/default-avatar.png'} 
            alt="poster" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white' }}
          />
          <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {stories[activeStoryIndex].user.username}
          </span>
        </div>

        {/* Main story image */}
        <img 
          src={stories[activeStoryIndex].mediaUrl} 
          alt="story slide" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
        />

        {/* Slider Navigation arrows */}
        <div style={{ position: 'absolute', top: '50%', left: '-50px', transform: 'translateY(-50%)', zIndex: 10 }}>
          <button 
            onClick={() => setActiveStoryIndex(prev => prev > 0 ? prev - 1 : stories.length - 1)} 
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%', padding: '10px' }}
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div style={{ position: 'absolute', top: '50%', right: '-50px', transform: 'translateY(-50%)', zIndex: 10 }}>
          <button 
            onClick={() => setActiveStoryIndex(prev => prev < stories.length - 1 ? prev + 1 : 0)} 
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%', padding: '10px' }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

      </div>
    </div>
  );
}
