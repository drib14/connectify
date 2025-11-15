import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import ConversationList from '../../components/ConversationList/ConversationList';
import MessagePane from '../../components/MessagePane/MessagePane';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/chat');
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchConversations();
  }, []);

  const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

  useEffect(() => {
    if (user) {
      socket.emit('joinUserRoom', user._id);
    }
  }, [user]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <ConversationList
        conversations={conversations}
        onSelectConversation={setSelectedConversation}
      />
      <MessagePane
        conversation={selectedConversation}
        socket={socket}
      />
    </div>
  );
};

export default ChatPage;
