import React from 'react';
import ChatWindow from '../../components/features/chat/ChatWindow';

export default function MessagesPage({ user, socket, allUsers, API_BASE }) {
  return (
    <ChatWindow 
      user={user} 
      socket={socket} 
      allUsers={allUsers} 
      API_BASE={API_BASE} 
    />
  );
}
