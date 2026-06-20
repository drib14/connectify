import React from 'react';
import { Home, MessageSquare, MapPin, Award, Crown, Bot, User, Users, Flag, ShoppingBag, Calendar, Video, Film, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onlineUsers, allUsers, onSelectProfile }) {
  // Get other online users list
  const onlineFriendList = allUsers.filter(u => 
    u._id !== user.id && onlineUsers.includes(u._id)
  );

  return (
    <div className="sidebar-container glass-panel">
      {/* Navigation Block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        <div 
          onClick={() => setActiveTab('feed')}
          className={`sidebar-link ${activeTab === 'feed' ? 'active' : ''}`}
        >
          <Home size={18} />
          <span>News Feed</span>
        </div>

        <div 
          onClick={() => setActiveTab('messages')}
          className={`sidebar-link ${activeTab === 'messages' ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>Chat Lounges</span>
        </div>

        <div 
          onClick={() => setActiveTab('spaces')}
          className={`sidebar-link ${activeTab === 'spaces' ? 'active' : ''}`}
        >
          <MapPin size={18} />
          <span>Spaces Map</span>
        </div>

        <div 
          onClick={() => setActiveTab('reels')}
          className={`sidebar-link ${activeTab === 'reels' ? 'active' : ''}`}
        >
          <Film size={18} />
          <span>Reels Feed</span>
        </div>

        <div 
          onClick={() => setActiveTab('groups')}
          className={`sidebar-link ${activeTab === 'groups' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Groups Hub</span>
        </div>

        <div 
          onClick={() => setActiveTab('pages')}
          className={`sidebar-link ${activeTab === 'pages' ? 'active' : ''}`}
        >
          <Flag size={18} />
          <span>Pages Hub</span>
        </div>

        <div 
          onClick={() => setActiveTab('marketplace')}
          className={`sidebar-link ${activeTab === 'marketplace' ? 'active' : ''}`}
        >
          <ShoppingBag size={18} />
          <span>Marketplace</span>
        </div>

        <div 
          onClick={() => setActiveTab('events')}
          className={`sidebar-link ${activeTab === 'events' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>Events</span>
        </div>

        <div 
          onClick={() => setActiveTab('watch')}
          className={`sidebar-link ${activeTab === 'watch' ? 'active' : ''}`}
        >
          <Video size={18} />
          <span>Watch Feed</span>
        </div>

        <div 
          onClick={() => setActiveTab('spark')}
          className={`sidebar-link ${activeTab === 'spark' ? 'active' : ''}`}
        >
          <Award size={18} />
          <span>Spark Sparkle</span>
        </div>

        <div 
          onClick={() => setActiveTab('premium')}
          className={`sidebar-link ${activeTab === 'premium' ? 'active' : ''}`}
        >
          <Crown size={18} />
          <span>Premium Hub</span>
        </div>

        <div 
          onClick={() => setActiveTab('ai')}
          className={`sidebar-link ${activeTab === 'ai' ? 'active' : ''}`}
        >
          <Bot size={18} />
          <span>Antigravity AI</span>
        </div>

        <div 
          onClick={() => setActiveTab('settings')}
          className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </div>

        <div 
          onClick={() => onSelectProfile(user.username)}
          className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={18} />
          <span>My Profile</span>
        </div>
      </div>

      {/* Online Users Section */}
      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Users size={14} />
          <span>Online Connects ({onlineFriendList.length})</span>
        </div>
        
        {onlineFriendList.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 8px' }}>
            No users online.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
            {onlineFriendList.map(friend => (
              <div 
                key={friend._id}
                onClick={() => onSelectProfile(friend.username)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                className="sidebar-link"
              >
                <div className="avatar-container">
                  <img src={friend.profilePic || '/default-avatar.png'} alt={friend.username} className={`avatar ${friend.isPremium ? 'premium-avatar' : ''}`} style={{ width: '22px', height: '22px' }} />
                  <div className="avatar-badge online" style={{ width: '8px', height: '8px' }}></div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-main)' }}>{friend.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
