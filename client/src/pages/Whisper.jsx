import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { SocketContext } from '../context/SocketContext.jsx';
import Sidebar from '../components/Layout/Sidebar.jsx';
import API from '../services/api.js';
import { Send, Image, MoreVertical, Search, Check, Sparkles, MessageSquare } from 'lucide-react';

const Whisper = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);

  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null); // Selected user object or 'aura'
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  // Realtime typing indicator state
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Aura AI Chat parameters
  const [auraLoading, setAuraLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get('/messages/rooms');
        setPartners(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchRooms();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Handle active partner chat history retrieval
  useEffect(() => {
    if (!activePartner) return;
    setPartnerTyping(false);

    if (activePartner === 'aura') {
      setMessages([
        {
          _id: 'aura-welcome',
          sender: 'aura',
          content: 'Hello! I am Aura, your resident AI assistant on Connectify. How can I help you customize your vibe today?',
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await API.get(`/messages/history/${activePartner._id}`);
        setMessages(response.data);

        // Tell socket we are entering this room
        if (socket) {
          socket.emit('join_chat', activePartner._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [activePartner, socket]);

  // Real-time socket message listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('message_received', (msg) => {
      if (activePartner && activePartner !== 'aura' && msg.sender === activePartner._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        // Increment unread count or notify user
        console.log('Unread message received from:', msg.sender);
      }
    });

    socket.on('typing', (room) => {
      if (activePartner && activePartner !== 'aura' && room === activePartner._id) {
        setPartnerTyping(true);
      }
    });

    socket.on('stop_typing', (room) => {
      if (activePartner && activePartner !== 'aura' && room === activePartner._id) {
        setPartnerTyping(false);
      }
    });

    return () => {
      socket.off('message_received');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [socket, activePartner]);

  // Typing status triggers
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!socket || activePartner === 'aura') return;

    if (e.target.value.trim().length > 0) {
      socket.emit('typing', activePartner._id);
    } else {
      socket.emit('stop_typing', activePartner._id);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (activePartner === 'aura') {
      const userText = text;
      setText('');
      // Append user prompt message
      setMessages((prev) => [...prev, { _id: Date.now().toString(), sender: user._id, content: userText, createdAt: new Date().toISOString() }]);
      setAuraLoading(true);
      try {
        const response = await API.post('/integrations/gemini/aura', {
          prompt: userText,
          action: 'chat',
        });
        setMessages((prev) => [...prev, { _id: (Date.now() + 1).toString(), sender: 'aura', content: response.data.text, createdAt: new Date().toISOString() }]);
      } catch (err) {
        console.error(err);
      } finally {
        setAuraLoading(false);
      }
      return;
    }

    const payload = {
      receiverId: activePartner._id,
      content: text,
    };
    setText('');
    if (socket) {
      socket.emit('stop_typing', activePartner._id);
    }

    try {
      const response = await API.post('/messages', payload);
      setMessages((prev) => [...prev, response.data]);
      
      // Emit to server
      if (socket) {
        socket.emit('new_message', response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ paddingLeft: '24px', alignItems: 'stretch' }}>
        <div className="glass-panel" style={{
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          overflow: 'hidden',
          padding: 0,
        }}>
          {/* Left Panel: Partners */}
          <div style={{
            width: '280px',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Search Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h2 style={{ fontSize: '18px' }}>Whisper Chats</h2>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter connections..."
                  className="input-field"
                  style={{ paddingLeft: '32px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* List Scroll */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* Aura AI Chat Shortcut */}
              <div
                onClick={() => setActivePartner('aura')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-color)',
                  background: activePartner === 'aura' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  transition: '0.2s',
                }}
                className="btn-secondary"
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
                }}>
                  <Sparkles size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Aura AI Companion</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online AI help</span>
                </div>
              </div>

              {/* standard partners */}
              {partners.map((partner) => {
                const isOnline = onlineUsers.includes(partner._id);
                const isSelected = activePartner?._id === partner._id;

                return (
                  <div
                    key={partner._id}
                    onClick={() => setActivePartner(partner)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                      transition: '0.2s',
                    }}
                    className="btn-secondary"
                  >
                    <div className="avatar-container" style={{ width: '36px', height: '36px' }}>
                      <img src={partner.avatar} alt="" className="avatar-image" style={{ width: '36px', height: '36px' }} />
                      {isOnline && <div className="online-badge" style={{ bottom: 0, right: 0, width: '10px', height: '10px' }}></div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {partner.username}
                        {partner.isPremium && <span className="premium-badge" style={{ fontSize: '6px' }}>Premium</span>}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {partner.bio}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Chat Frame */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
            {activePartner ? (
              <>
                {/* Active Header */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {activePartner === 'aura' ? (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Sparkles size={16} />
                      </div>
                    ) : (
                      <img src={activePartner.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700 }}>
                        {activePartner === 'aura' ? 'Aura' : activePartner.username}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {activePartner === 'aura' ? 'Virtual AI Companion' : onlineUsers.includes(activePartner._id) ? 'active now' : 'offline'}
                      </span>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Messages feed */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map((msg) => {
                    const isOwn = msg.sender === user._id;
                    const isAura = msg.sender === 'aura';

                    return (
                      <div
                        key={msg._id}
                        style={{
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isOwn ? 'var(--primary-gradient)' : isAura ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.05)',
                          border: isAura ? '1px dashed var(--primary)' : '1px solid transparent',
                          borderColor: !isOwn && !isAura ? 'var(--border-color)' : 'transparent',
                          color: 'white',
                          borderRadius: isOwn ? '16px 16px 0 16px' : '16px 16px 16px 0',
                          padding: '10px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-end' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}

                  {/* Typing placeholder indicator */}
                  {partnerTyping && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', borderRadius: '16px 16px 16px 0', padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activePartner.username} is writing...</span>
                    </div>
                  )}

                  {auraLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(99,102,241,0.08)', border: '1px dashed var(--primary)', borderRadius: '16px 16px 16px 0', padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={12} />
                        <span>Aura is formulating a response...</span>
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Form write text */}
                <form onSubmit={handleSend} style={{ padding: '16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="input-field"
                    value={text}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <MessageSquare size={48} style={{ opacity: 0.3 }} />
                <span>Select a conversation to start Whisper chatting</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Whisper;
