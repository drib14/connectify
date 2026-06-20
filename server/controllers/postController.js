const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/upload');
const { trackSparkProgress } = require('../utils/spark');

exports.createPost = async (req, res) => {
  try {
    const { content, isPoll, pollOptions } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newPost = new Post({
      user: req.user.id,
      content: content || '',
    });

    if (isPoll === 'true' && pollOptions) {
      newPost.isPoll = true;
      const parsedOptions = JSON.parse(pollOptions);
      newPost.pollOptions = parsedOptions.map(opt => ({ optionText: opt, votes: [] }));
    }

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const mediaType = isVideo ? 'video' : 'image';
      const mediaUrl = await uploadToCloudinary(req.file.buffer, mediaType);
      newPost.mediaUrl = mediaUrl;
      newPost.mediaType = mediaType;
    }

    await newPost.save();

    await trackSparkProgress(req.user.id, 'post', req);

    const populatedPost = await Post.findById(newPost._id).populate('user', 'username profilePic isPremium');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const peopleToFetch = [req.user.id, ...currentUser.friends, ...currentUser.following];

    const posts = await Post.find({ user: { $in: peopleToFetch } })
      .populate('user', 'username profilePic isPremium')
      .populate({
        path: 'originalPost',
        populate: { path: 'user', select: 'username profilePic isPremium' }
      })
      .populate('comments.user', 'username profilePic isPremium')
      .populate('comments.replies.user', 'username profilePic isPremium')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username profilePic isPremium')
      .populate({
        path: 'originalPost',
        populate: { path: 'user', select: 'username profilePic isPremium' }
      })
      .populate('comments.user', 'username profilePic isPremium')
      .populate('comments.replies.user', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reactToPost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const sender = await User.findById(req.user.id);
    const existingReactionIndex = post.reactions.findIndex(r => r.user.toString() === req.user.id);

    let updatedReactionType = null;

    if (existingReactionIndex > -1) {
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1);
        post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      } else {
        post.reactions[existingReactionIndex].type = type;
        updatedReactionType = type;
      }
    } else {
      post.reactions.push({ user: req.user.id, type });
      if (!post.likes.includes(req.user.id)) {
        post.likes.push(req.user.id);
      }
      updatedReactionType = type;
    }

    await post.save();

    await trackSparkProgress(req.user.id, 'like', req);

    if (post.user.toString() !== req.user.id && updatedReactionType) {
      const notification = new Notification({
        recipient: post.user,
        sender: req.user.id,
        type: 'like',
        post: post._id,
        content: `${sender.username} reacted with "${type}" to your post.`,
      });
      await notification.save();

      if (req.io && req.activeUsers) {
        const socketId = req.activeUsers.get(post.user.toString());
        if (socketId) {
          req.io.to(socketId).emit('notification_received', {
            id: notification._id,
            sender: { id: sender._id, username: sender.username, profilePic: sender.profilePic },
            type: 'like',
            content: notification.content,
            isRead: false,
            createdAt: notification.createdAt,
            post: { id: post._id }
          });
        }
      }
    }

    res.json({ success: true, reactions: post.reactions, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const sender = await User.findById(req.user.id);

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
      replies: []
    };

    post.comments.push(newComment);
    await post.save();

    const savedPost = await Post.findById(post._id).populate('comments.user', 'username profilePic isPremium');
    const addedComment = savedPost.comments[savedPost.comments.length - 1];

    if (post.user.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        content: `${sender.username} commented on your post: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`,
      });
      await notification.save();

      if (req.io && req.activeUsers) {
        const socketId = req.activeUsers.get(post.user.toString());
        if (socketId) {
          req.io.to(socketId).emit('notification_received', {
            id: notification._id,
            sender: { id: sender._id, username: sender.username, profilePic: sender.profilePic },
            type: 'comment',
            content: notification.content,
            isRead: false,
            createdAt: notification.createdAt,
            post: { id: post._id }
          });
        }
      }
    }

    res.json({ success: true, comment: addedComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const newReply = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await post.save();

    const savedPost = await Post.findById(post._id)
      .populate('comments.replies.user', 'username profilePic isPremium');
    
    const updatedComment = savedPost.comments.id(req.params.commentId);
    const addedReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.json({ success: true, reply: addedReply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const postToShare = await Post.findById(req.params.postId);
    if (!postToShare) {
      return res.status(404).json({ success: false, message: 'Original post not found' });
    }

    const newPost = new Post({
      user: req.user.id,
      content: req.body.content || '',
      isShared: true,
      originalPost: postToShare._id,
    });

    await newPost.save();

    await trackSparkProgress(req.user.id, 'post', req);

    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'username profilePic isPremium')
      .populate({
        path: 'originalPost',
        populate: { path: 'user', select: 'username profilePic isPremium' }
      });

    res.status(201).json({ success: true, post: populatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Go through options and toggle/assign user votes
    post.pollOptions = post.pollOptions.map(opt => {
      const votesFiltered = opt.votes.filter(v => v.toString() !== req.user.id);
      if (opt._id.toString() === optionId) {
        // Toggle vote on selected option
        const votedBefore = opt.votes.some(v => v.toString() === req.user.id);
        return {
          ...opt,
          votes: votedBefore ? votesFiltered : [...opt.votes, req.user.id]
        };
      } else {
        // Remove vote from other options (single vote restriction)
        return { ...opt, votes: votesFiltered };
      }
    });

    await post.save();
    res.json({ success: true, pollOptions: post.pollOptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
