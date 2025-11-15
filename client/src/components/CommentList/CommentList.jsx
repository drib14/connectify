import React from 'react';
import CommentItem from '../CommentItem/CommentItem.jsx';
import AddComment from '../AddComment/AddComment';

const CommentList = ({ postId, comments, onCommentAdded }) => {
  return (
    <div style={{ marginTop: '10px' }}>
      <AddComment postId={postId} onCommentAdded={onCommentAdded} />
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
