import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const MessagePane = ({ conversation, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (conversation) {
      // Join the chat room
      socket.emit('joinRoom', conversation._id);

      // Fetch messages for the conversation
      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`/api/chat/${conversation._id}/messages`);
          setMessages(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchMessages();

      // Listen for incoming messages
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      if (conversation) {
        // Leave the chat room
        socket.emit('leaveRoom', conversation._id);
        socket.off('receiveMessage');
      }
    };
  }, [conversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data: sentMessage } = await axios.post(`/api/chat/${conversation._id}/messages`, {
        text: newMessage,
      });

      // Emit the message via Socket.IO
      socket.emit('sendMessage', sentMessage);

      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  if (!conversation) {
    return <div style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Select a conversation to start chatting</div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
        <h3>{conversation.isGroupChat ? conversation.name : conversation.participants.find(p => p._id !== user._id).name}</h3>
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div key={msg._id} style={{ marginBottom: '10px', textAlign: msg.sender._id === user._id ? 'right' : 'left' }}>
            <strong>{msg.sender.name}</strong>
            <p style={{ margin: 0, padding: '10px', backgroundColor: msg.sender._id === user._id ? '#dcf8c6' : '#fff', borderRadius: '8px' }}>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid #ddd' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }}
        />
      </form>
    </div>
  );
};

export default MessagePane;
