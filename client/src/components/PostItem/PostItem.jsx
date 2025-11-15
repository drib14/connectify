import React, { useState } from 'react';
import axios from 'axios';
import CommentList from '../CommentList/CommentList';

const PostItem = ({ post, onPostShared }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments);

  const handleLike = async () => {
    try {
      await axios.put(`/api/posts/${post._id}/like`);
      // Optionally update the UI to reflect the new like count
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      const { data } = await axios.post(`/api/posts/${post._id}/share`);
      onPostShared(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentAdded = (newComments) => {
    setComments(newComments);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
      <h4>{post.user.name}</h4>
      <p>{post.text}</p>
      {post.sharedFrom && (
        <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '8px', margin: '10px 0' }}>
          <strong>Shared from {post.sharedFrom.user.name}</strong>
          <p>{post.sharedFrom.text}</p>
          {post.sharedFrom.image && <img src={post.sharedFrom.image} alt="Shared Post" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
          {post.sharedFrom.video && <video src={post.sharedFrom.video} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />}
        </div>
      )}
      {post.image && <img src={post.image} alt="Post" style={{ maxWidth: '100%', borderRadius: '8px' }} />}
      {post.video && <video src={post.video} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />}
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Like ({post.likes.length})
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Comment ({comments.length})
        </button>
        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Share ({post.shares.length})
        </button>
      </div>
      {showComments && <CommentList postId={post._id} comments={comments} onCommentAdded={handleCommentAdded} />}
    </div>
  );
};

export default PostItem;
