import React, { useState } from 'react';
import axios from 'axios';

const AddComment = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/posts/${postId}/comment`, { text });
      onCommentAdded(data);
      setText('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '10px' }}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #dddfe2', marginRight: '10px' }}
      />
      <button type="submit" style={{ padding: '8px 15px', borderRadius: '20px', border: 'none', backgroundColor: '#1877f2', color: '#fff' }}>
        Post
      </button>
    </form>
  );
};

export default AddComment;
