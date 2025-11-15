import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from '../PostItem/PostItem';
import CreatePost from '../CreatePost/CreatePost';
import SkeletonLoader from '../SkeletonLoader/SkeletonLoader';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get('/api/posts');
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostShared = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div>
      <CreatePost onPostCreated={handlePostCreated} />
      {loading ? (
        <SkeletonLoader type="thumbnail" count={3} />
      ) : (
        posts.map((post) => (
          <PostItem key={post._id} post={post} onPostShared={handlePostShared} />
        ))
      )}
    </div>
  );
};

export default PostList;
