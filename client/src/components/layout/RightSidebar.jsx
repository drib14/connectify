import React from 'react';
import { Flag, MapPin, Users } from 'lucide-react';

export default function RightSidebar({ 
  activeAds, 
  currentAdIndex, 
  handleAdClick, 
  rsvpedEventsList, 
  allUsers, 
  user, 
  onlineUsers, 
  onSelectProfile 
}) {
  return (
    <div className="right-sidebar-container">
      
      {/* Dynamic Sponsored Promotion Ad Campaign Widget */}
      {activeAds.length > 0 && activeAds[currentAdIndex] && (
        <div 
          className="glass-panel" 
          onClick={() => handleAdClick(activeAds[currentAdIndex])}
          style={{ padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s', border: '1px solid var(--border-glass)' }}
          title="Click to visit sponsor link"
        >
          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Sponsored</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <img src={activeAds[currentAdIndex].bannerUrl} alt="Ad banner" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-glass)' }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h5 style={{ fontSize: '12.5px', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{activeAds[currentAdIndex].title}</h5>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'block', marginTop: '2px' }}>Visit redirect site</span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming RSVPed events */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>RSVP'd Events</span>
        {rsvpedEventsList.length === 0 ? (
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>No RSVP'd events.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rsvpedEventsList.slice(0, 3).map(ev => (
              <div key={ev._id} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(99,102,241,0.08)', borderRadius: '4px', minWidth: '40px', padding: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {new Date(ev.date).toLocaleDateString([], { month: 'short' })}
                  </span>
                  <strong style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                    {new Date(ev.date).toLocaleDateString([], { day: 'numeric' })}
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{ev.title}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.location || 'Online Meetup'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact drawers */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '9.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px' }}>Contacts</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
          {allUsers.filter(u => u._id !== user.id).map(friend => {
            const isOnline = onlineUsers.includes(friend._id);
            return (
              <div
                key={friend._id}
                onClick={() => onSelectProfile(friend.username)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px' }}
                className="sidebar-link"
              >
                <div className="avatar-container">
                  <img src={friend.profilePic || '/default-avatar.png'} alt={friend.username} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  <div className={`avatar-badge ${isOnline ? 'online' : 'offline'}`} style={{ width: '9px', height: '9px' }}></div>
                </div>
                <span style={{ fontSize: '12px' }}>{friend.username}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
