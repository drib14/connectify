import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setVideo(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/posts', { text, image, video });
      onPostCreated(data);
      setText('');
      setImage(null);
      setVideo(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          style={{ width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label htmlFor="image-upload" style={{ cursor: 'pointer', marginRight: '10px' }}>
              📷 Image
            </label>
            <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            <label htmlFor="video-upload" style={{ cursor: 'pointer' }}>
              📹 Video
            </label>
            <input id="video-upload" type="file" accept="video/*" onChange={handleVideoChange} style={{ display: 'none' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1877f2', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold' }}>
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
