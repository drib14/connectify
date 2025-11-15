import React from 'react';

const CommentItem = ({ comment }) => {
  return (
    <div style={{ marginBottom: '10px', paddingLeft: '10px', borderLeft: '2px solid #f0f2f5' }}>
      <strong>{comment.user.name}</strong>
      <p style={{ margin: '5px 0' }}>{comment.text}</p>
      {/* Replies will be rendered here */}
    </div>
  );
};

export default CommentItem;
