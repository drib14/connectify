const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const { getIo } = require('../socket');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createPost = async (req, res) => {
  const { text, image, video } = req.body;
  try {
    let imageUrl = '', videoUrl = '';
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image, { folder: 'connectify/posts', resource_type: 'image' });
      imageUrl = uploadedImage.secure_url;
    }
    if (video) {
      const uploadedVideo = await cloudinary.uploader.upload(video, { folder: 'connectify/posts', resource_type: 'video' });
      videoUrl = uploadedVideo.secure_url;
    }
    const post = new Post({ user: req.user._id, text, image: imageUrl, video: videoUrl });
    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate('user', 'name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updatePost = async (req, res) => {
  const { text } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      post.text = text || post.text;
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await post.remove();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
        const notification = new Notification({ user: post.user, emitter: req.user._id, type: 'like', post: post._id });
        await notification.save();
        getIo().to(post.user.toString()).emit('newNotification', notification);
      } else {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      }
      await post.save();
      res.json(post.likes);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      const newComment = { user: req.user._id, text: req.body.text };
      post.comments.unshift(newComment);
      await post.save();
      const notification = new Notification({ user: post.user, emitter: req.user._id, type: 'comment', post: post._id });
      await notification.save();
      getIo().to(post.user.toString()).emit('newNotification', notification);
      res.status(201).json(post.comments);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            if (comment.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
            post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);
            await post.save();
            res.json(post.comments);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            const newReply = { user: req.user._id, text: req.body.text };
            comment.replies.unshift(newReply);
            await post.save();
            res.status(201).json(comment.replies);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
            if (!comment) return res.status(404).json({ message: 'Comment not found' });
            const reply = comment.replies.find(r => r._id.toString() === req.params.reply_id);
            if (!reply) return res.status(404).json({ message: 'Reply not found' });
            if (reply.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });
            comment.replies = comment.replies.filter(r => r._id.toString() !== req.params.reply_id);
            await post.save();
            res.json(comment.replies);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sharePost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) return res.status(404).json({ message: 'Post not found' });
    const sharedPost = new Post({ user: req.user._id, text: req.body.text, sharedFrom: originalPost._id });
    await sharedPost.save();
    originalPost.shares.push(req.user._id);
    await originalPost.save();
    res.status(201).json(sharedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
