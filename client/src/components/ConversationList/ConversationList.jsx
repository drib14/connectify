import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const ConversationList = ({ conversations, onSelectConversation }) => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ width: '300px', borderRight: '1px solid #ddd', padding: '10px' }}>
      <h2>Chats</h2>
      {conversations.map((convo) => (
        <div
          key={convo._id}
          onClick={() => onSelectConversation(convo)}
          style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
        >
          {convo.isGroupChat ? convo.name : convo.participants.find(p => p._id !== user._id).name}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
