import React, { useState, useEffect, useRef } from 'react';
import { Send, Tv, Plus, Users, Play, Pause, RefreshCw, X, Minimize2, Maximize2, Bot } from 'lucide-react';
import api from '../../../utils/api';
import CreateGroupChatModal from '../../modals/CreateGroupChatModal';

export default function ChatWindow({ user, socket, allUsers }) {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState({}); // { [username]: boolean }
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  // Co-Watching Lounge states
  const [showLounge, setShowLounge] = useState(false);
  const [loungeVideoUrl, setLoungeVideoUrl] = useState('');
  const [inputVideoUrl, setInputVideoUrl] = useState('');
  const [loungeIsPlaying, setLoungeIsPlaying] = useState(false);
  const [loungePlaybackTime, setLoungePlaybackTime] = useState(0);

  const messagesEndRef = useRef(null);
  const playerRef = useRef(null);
  const skipLoungeSyncRef = useRef(false);

  // Load Rooms list
  const loadRooms = async () => {
    try {
      const res = await api.get('/messages/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  // Load Messages inside Room
  const loadMessages = async (roomId) => {
    try {
      const res = await api.get(`/messages/room/${roomId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('message_received', ({ roomId, message }) => {
      if (activeRoom && activeRoom._id === roomId) {
        setMessages(prev => [...prev, message]);
      }
      loadRooms();
    });

    socket.on('typing', ({ userId, username }) => {
      setTypingUsers(prev => ({ ...prev, [username]: true }));
    });

    socket.on('stop_typing', ({ userId, username }) => {
      const typedUser = allUsers.find(u => u._id === userId);
      if (typedUser) {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[typedUser.username];
          return next;
        });
      }
    });

    socket.on('lounge_sync', ({ action, videoUrl, time, isPlaying }) => {
      console.log('Lounge Sync event received:', action, videoUrl, time, isPlaying);
      skipLoungeSyncRef.current = true;
      
      if (videoUrl !== undefined) {
        setLoungeVideoUrl(videoUrl);
        setInputVideoUrl(videoUrl);
      }
      if (isPlaying !== undefined) {
        setLoungeIsPlaying(isPlaying);
      }
      if (time !== undefined) {
        setLoungePlaybackTime(time);
        if (playerRef.current) {
          playerRef.current.currentTime = time;
        }
      }

      if (action === 'load_video') {
        setShowLounge(true);
      }
    });

    return () => {
      socket.off('message_received');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('lounge_sync');
    };
  }, [socket, activeRoom, allUsers]);

  // Join Room Socket Channel
  useEffect(() => {
    if (activeRoom && socket) {
      socket.emit('join_chat', activeRoom._id);
      loadMessages(activeRoom._id);
      
      if (activeRoom.coWatchVideoUrl) {
        setLoungeVideoUrl(activeRoom.coWatchVideoUrl);
        setInputVideoUrl(activeRoom.coWatchVideoUrl);
        setLoungeIsPlaying(activeRoom.coWatchIsPlaying);
        setLoungePlaybackTime(activeRoom.coWatchPlaybackTime);
        setShowLounge(true);
      } else {
        setShowLounge(false);
        setLoungeVideoUrl('');
        setInputVideoUrl('');
      }
    }
  }, [activeRoom, socket]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket || !activeRoom) return;

    if (e.target.value.trim().length > 0) {
      socket.emit('typing', { chatRoomId: activeRoom._id, userId: user.id, username: user.username });
    } else {
      socket.emit('stop_typing', { chatRoomId: activeRoom._id, userId: user.id });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    try {
      const res = await api.post(`/messages/room/${activeRoom._id}`, {
        content: inputText
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message]);
        setInputText('');
        loadRooms();
        if (socket) {
          socket.emit('stop_typing', { chatRoomId: activeRoom._id, userId: user.id });
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleCreateRoom = async (targetUserId) => {
    try {
      const res = await api.post('/messages/room', {
        targetUserId,
        isGroup: false
      });

      if (res.data.success) {
        setActiveRoom(res.data.room);
        loadRooms();
      }
    } catch (err) {
      console.error('Room create error:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedParticipants.length === 0) return;

    try {
      const res = await api.post('/messages/room', {
        isGroup: true,
        groupName,
        participantsList: selectedParticipants
      });

      if (res.data.success) {
        setActiveRoom(res.data.room);
        loadRooms();
        setShowGroupModal(false);
        setGroupName('');
        setSelectedParticipants([]);
      }
    } catch (err) {
      console.error('Group create error:', err);
    }
  };

  const handleParticipantToggle = (id) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const broadcastLoungeAction = (action, extraData = {}) => {
    if (!socket || !activeRoom) return;
    if (skipLoungeSyncRef.current) {
      skipLoungeSyncRef.current = false;
      return;
    }
    
    socket.emit('lounge_action', {
      chatRoomId: activeRoom._id,
      action,
      ...extraData
    });
  };

  const handleLoadLoungeVideo = (e) => {
    e.preventDefault();
    if (!inputVideoUrl.trim()) return;
    
    let embedUrl = inputVideoUrl;
    if (inputVideoUrl.includes('youtube.com/watch')) {
      const videoId = new URL(inputVideoUrl).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    } else if (inputVideoUrl.includes('youtu.be/')) {
      const videoId = inputVideoUrl.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    }

    setLoungeVideoUrl(embedUrl);
    setLoungeIsPlaying(true);
    setLoungePlaybackTime(0);
    setShowLounge(true);

    broadcastLoungeAction('load_video', {
      videoUrl: embedUrl,
      time: 0,
      isPlaying: true
    });
  };

  const toggleLoungePlay = () => {
    const nextPlaying = !loungeIsPlaying;
    setLoungeIsPlaying(nextPlaying);
    broadcastLoungeAction(nextPlaying ? 'play' : 'pause', {
      isPlaying: nextPlaying,
      time: playerRef.current ? playerRef.current.currentTime : loungePlaybackTime
    });
  };

  const handleVideoTimeUpdate = () => {
    if (playerRef.current) {
      setLoungePlaybackTime(playerRef.current.currentTime);
    }
  };

  const handleVideoSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setLoungePlaybackTime(seekTime);
    if (playerRef.current) {
      playerRef.current.currentTime = seekTime;
    }
    broadcastLoungeAction('seek', {
      time: seekTime,
      isPlaying: loungeIsPlaying
    });
  };

  const handleCloseLounge = () => {
    setShowLounge(false);
    setLoungeVideoUrl('');
    setInputVideoUrl('');
    broadcastLoungeAction('close_video', {
      videoUrl: '',
      time: 0,
      isPlaying: false
    });
  };

  const isYoutube = loungeVideoUrl.includes('youtube.com/embed/');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: '100%', minHeight: '500px' }}>
      
      {/* Rooms Side list */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>Conversations</h3>
          <button 
            onClick={() => setShowGroupModal(true)}
            style={{ padding: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', color: 'var(--text-main)' }}
            title="Create Group Chat"
          >
            <Plus size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '120px', overflowY: 'auto', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Start New Chat:</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {allUsers.filter(u => u._id !== user.id).map(u => (
              <img 
                key={u._id}
                src={u.profilePic || '/default-avatar.png'}
                alt={u.username}
                onClick={() => handleCreateRoom(u._id)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
                title={`Chat with ${u.username}`}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {rooms.map(room => {
            let title = room.name || 'Direct Connection';
            let pic = '/default-avatar.png';

            if (!room.isGroup) {
              const other = room.participants.find(p => p._id !== user.id);
              if (other) {
                title = other.username;
                pic = other.profilePic || '/default-avatar.png';
              }
            } else {
              pic = '/group-avatar.png';
            }

            return (
              <div
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className={`sidebar-link ${activeRoom && activeRoom._id === room._id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <img src={pic} alt={title} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {room.lastMessage ? `${room.lastMessage.sender.username}: ${room.lastMessage.content}` : 'No messages yet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Main chat window panels */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {activeRoom ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <h4 style={{ fontWeight: '700', fontSize: '15px' }}>
                  {activeRoom.isGroup ? activeRoom.name : activeRoom.participants.find(p => p._id !== user.id)?.username}
                </h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {activeRoom.isGroup ? `${activeRoom.participants.length} members` : 'Direct Messaging'}
                </span>
              </div>
              <button 
                onClick={() => setShowLounge(!showLounge)}
                className={showLounge ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 12px', fontSize: '12px' }}
                title="Lounge Co-Watching"
              >
                <Tv size={14} />
                <span>Video Lounge</span>
              </button>
            </div>

            {/* Synced Co-Watching lounge box */}
            {showLounge && (
              <div className="hangout-lounge-overlay">
                
                <div className="lounge-controls">
                  <form onSubmit={handleLoadLoungeVideo} style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '16px' }}>
                    <input
                      type="text"
                      placeholder="Paste YouTube or MP4 video URL..."
                      value={inputVideoUrl}
                      onChange={(e) => setInputVideoUrl(e.target.value)}
                      style={{ flex: 1, height: '28px', fontSize: '11px', padding: '4px 8px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '2px 10px', fontSize: '11px', height: '28px' }}>
                      Load Video
                    </button>
                  </form>
                  <button onClick={handleCloseLounge} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>

                {loungeVideoUrl ? (
                  <div style={{ background: '#000', padding: '8px' }}>
                    {isYoutube ? (
                      <div className="video-player-container">
                        <iframe 
                          src={`${loungeVideoUrl}`}
                          title="YouTube player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <video
                           ref={playerRef}
                           src={loungeVideoUrl}
                           onTimeUpdate={handleVideoTimeUpdate}
                           style={{ width: '100%', maxHeight: '250px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={toggleLoungePlay} style={{ background: 'none', padding: 0 }}>
                            {loungeIsPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={playerRef.current ? playerRef.current.duration || 100 : 100}
                            value={loungePlaybackTime}
                            onChange={handleVideoSeek}
                            style={{ flex: 1, height: '4px' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Enter a video link above to start co-watching with your group in sync!
                  </div>
                )}

              </div>
            )}

            {/* Messages Scroll list */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {messages.map(msg => {
                  const isSelf = msg.sender._id === user.id;
                  return (
                    <div 
                      key={msg._id}
                      className={`chat-bubble ${isSelf ? 'sent' : 'received'}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: '700', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{msg.sender.username}</span>
                        {msg.sender.isPremium && <span style={{ fontSize: '9px' }}>👑</span>}
                      </div>
                      <span style={{ fontSize: '13px' }}>{msg.content}</span>
                      <small style={{ display: 'block', fontSize: '8.5px', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {Object.keys(typingUsers).length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', italic: 'true', padding: '4px 8px' }}>
                  {Object.keys(typingUsers).join(', ')} typing...
                </div>
              )}

            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', padding: '14px', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={handleInputChange}
                style={{ flex: 1, height: '40px' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', height: '40px' }}>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', padding: '24px' }}>
            <Tv size={48} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-muted)' }}>No Chat Room Selected</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px' }}>
              Select a friend from the side list to start direct messaging or co-watching videos in real-time.
            </p>
          </div>
        )}

      </div>

      {/* Group Create Modal */}
      <CreateGroupChatModal 
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        groupName={groupName}
        setGroupName={setGroupName}
        allUsers={allUsers}
        user={user}
        selectedParticipants={selectedParticipants}
        handleParticipantToggle={handleParticipantToggle}
        handleCreateGroup={handleCreateGroup}
      />

    </div>
  );
}
