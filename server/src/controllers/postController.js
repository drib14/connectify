import Post from '../models/Post.js';
import User from '../models/User.js';

export const createPost = async (req, res) => {
  try {
    const { content, media, location, vibe } = req.body;
    
    if (!content && (!media || media.length === 0) && !vibe) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      media: media || [],
      location: location || null,
      vibe: vibe || null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar isPremium')
      .populate({
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: 'username avatar isPremium' }
        ]
      })
      .populate('comments.author', 'username avatar isPremium');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Failed to upload post' });
  }
};

export const getPulseFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Feed consists of the user's posts and user's circle posts
    const authorIds = [req.user._id, ...user.circle];

    const posts = await Post.find({ author: { $in: authorIds } })
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium')
      .populate({
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: 'username avatar isPremium' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get Feed Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve Pulse feed' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    await post.deleteOne();
    res.json({ message: 'Post successfully deleted' });
  } catch (error) {
    console.error('Delete Post Error:', error.message);
    res.status(500).json({ message: 'Failed to remove post' });
  }
};

export const reactPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'Like', 'Love', 'Fire', 'Vibe', 'Haha'
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already reacted
    const existingIndex = post.reactions.findIndex((r) => r.user.toString() === userId.toString());

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === type) {
        // Toggle reaction off
        post.reactions.splice(existingIndex, 1);
      } else {
        // Update reaction type
        post.reactions[existingIndex].type = type;
      }
    } else {
      // Add new reaction
      post.reactions.push({ user: userId, type });
    }

    await post.save();
    
    const updatedPost = await Post.findById(id)
      .populate('author', 'username avatar isPremium')
      .populate({
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: 'username avatar isPremium' }
        ]
      })
      .populate('comments.author', 'username avatar isPremium');

    res.json(updatedPost);
  } catch (error) {
    console.error('React Post Error:', error.message);
    res.status(500).json({ message: 'Failed to register reaction' });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      author: req.user._id,
      text,
    });

    await post.save();

    const updatedPost = await Post.findById(id)
      .populate('author', 'username avatar isPremium')
      .populate({
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: 'username avatar isPremium' }
        ]
      })
      .populate('comments.author', 'username avatar isPremium');

    res.json(updatedPost);
  } catch (error) {
    console.error('Comment Post Error:', error.message);
    res.status(500).json({ message: 'Failed to post comment' });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const originalPost = await Post.findById(id);
    if (!originalPost) {
      return res.status(404).json({ message: 'Original post not found' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      sharedFrom: originalPost._id,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar isPremium')
      .populate({
        path: 'sharedFrom',
        populate: [
          { path: 'author', select: 'username avatar isPremium' }
        ]
      })
      .populate('comments.author', 'username avatar isPremium');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Share Post Error:', error.message);
    res.status(500).json({ message: 'Failed to share post' });
  }
};
