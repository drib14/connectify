const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createAndSendNotification } = require('../services/notificationService');

// Create post
const createPost = async (req, res) => {
  try {
    const { content, postType, visibility, moodTag, contextNotes, isAnonymous, anonymousCommunity, topics, isDeepDiscussion, knowledgeData, realityCheckData, contentLifespan, timeCapsuleData } = req.body;

    const media = req.files?.postMedia?.map(f => ({
      url: f.path,
      type: f.mimetype.startsWith('image/') ? 'image' : 'video',
      publicId: f.filename,
    })) || [];

    const post = new Post({
      author: req.user._id,
      content,
      media,
      postType: postType || 'regular',
      visibility: visibility || 'public',
      moodTag: moodTag || '',
      contextNotes: contextNotes || '',
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      anonymousCommunity: anonymousCommunity || null,
      topics: topics ? JSON.parse(topics) : [],
      isDeepDiscussion: isDeepDiscussion === 'true',
      knowledgeData: knowledgeData ? JSON.parse(knowledgeData) : undefined,
      realityCheckData: realityCheckData ? JSON.parse(realityCheckData) : undefined,
    });

    if (contentLifespan) {
      const parsed = JSON.parse(contentLifespan);
      post.contentLifespan = { enabled: true, expiresAt: new Date(parsed.expiresAt) };
    }

    if (timeCapsuleData) {
      const parsed = JSON.parse(timeCapsuleData);
      post.timeCapsuleData = { unlockDate: new Date(parsed.unlockDate), isUnlocked: false };
    }

    await post.save();

    // Increase contribution score
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 2 } });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName username avatar contributionScore');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get feed posts
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, sort = 'newest', circle } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    // Filter by post type
    if (type && type !== 'all') query.postType = type;

    // Filter time capsules
    query.$or = [
      { 'timeCapsuleData.unlockDate': { $exists: false } },
      { 'timeCapsuleData.isUnlocked': true },
      { 'timeCapsuleData.unlockDate': { $lte: new Date() } },
    ];

    // Filter expired content
    query.$and = [
      { $or: [{ 'contentLifespan.enabled': false }, { 'contentLifespan.enabled': { $exists: false } }, { 'contentLifespan.expiresAt': { $gt: new Date() } }] },
    ];

    if (req.user) {
      const user = await User.findById(req.user._id);
      const followingIds = [...user.following, req.user._id];

      if (circle && circle !== 'public') {
        const circleMembers = user.trustCircles[circle] || [];
        query.author = { $in: circleMembers };
        query.visibility = { $in: [circle, 'public'] };
      } else {
        query.$or = [
          { visibility: 'public' },
          { author: { $in: followingIds } },
          { author: req.user._id },
        ];
      }
    } else {
      query.visibility = 'public';
      query.isAnonymous = false;
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : sort === 'popular' ? { 'likes.length': -1 } : { createdAt: -1 };

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName username avatar contributionScore authenticityBadges likeFreeModeEnabled')
      .populate('comments.author', 'firstName lastName username avatar')
      .populate('comments.replies.author', 'firstName lastName username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName username avatar contributionScore')
      .populate('comments.author', 'firstName lastName username avatar')
      .populate('comments.replies.author', 'firstName lastName username avatar');

    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Like/unlike post
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await createAndSendNotification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          message: `${req.user.firstName} liked your post.`,
          link: `/post/${post._id}`,
        });
        await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 1 } });
      }
    }

    await post.save();
    res.json({ likes: post.likes, liked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = {
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false,
    };

    post.comments.push(comment);
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      await createAndSendNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.firstName} commented on your post.`,
        link: `/post/${post._id}`,
      });
      await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 2, constructiveFeedbackScore: 1 } });
    }

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'firstName lastName username avatar')
      .populate('comments.replies.author', 'firstName lastName username avatar');

    res.json(updatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Bookmark post
const toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const isBookmarked = post.bookmarks.includes(req.user._id);
    if (isBookmarked) {
      post.bookmarks.pull(req.user._id);
    } else {
      post.bookmarks.push(req.user._id);
    }

    await post.save();
    res.json({ bookmarked: !isBookmarked });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Fact check request (Feature #43)
const requestFactCheck = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    post.factCheckRequests.push({ requestedBy: req.user._id });
    await post.save();

    res.json({ message: 'Fact check requested.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get user posts
const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const posts = await Post.find({ author: user._id, isAnonymous: false })
      .populate('author', 'firstName lastName username avatar contributionScore')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add reply to a comment (Feature Commenting upgrade)
const addCommentReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const reply = {
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false,
    };

    comment.replies.push(reply);
    await post.save();

    if (comment.author.toString() !== req.user._id.toString()) {
      await createAndSendNotification({
        recipient: comment.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.firstName} replied to your comment.`,
        link: `/post/${post._id}`,
      });
      await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 2, constructiveFeedbackScore: 1 } });
    }

    const updatedPost = await Post.findById(post._id)
      .populate('comments.author', 'firstName lastName username avatar')
      .populate('comments.replies.author', 'firstName lastName username avatar');

    res.json(updatedPost.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tip a post author
const tipPost = async (req, res) => {
  try {
    const { amount } = req.body;
    const tipAmount = parseInt(amount, 10);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      return res.status(400).json({ message: 'Invalid tip amount.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const sender = await User.findById(req.user._id);
    if (sender.coins < tipAmount) {
      return res.status(400).json({ message: 'Insufficient Peace Coins balance.' });
    }

    if (post.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot tip your own post.' });
    }

    // Debit sender
    sender.coins -= tipAmount;
    sender.contributionScore = (sender.contributionScore || 0) + 5;
    await sender.save();

    // Credit receiver
    await User.findByIdAndUpdate(
      post.author,
      { $inc: { coins: tipAmount, contributionScore: 10 } }
    );

    // Send notification
    const { createAndSendNotification } = require('../services/notificationService');
    await createAndSendNotification({
      recipient: post.author,
      sender: req.user._id,
      type: 'tip',
      message: `${req.user.firstName} tipped your post ${tipAmount} Peace Coins! 🪙`,
      link: `/profile/${req.user.username}`,
    });

    res.json({
      message: `Successfully tipped ${tipAmount} coins!`,
      coins: sender.coins,
      contributionScore: sender.contributionScore,
    });
  } catch (error) {
    console.error('Tip post error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Tip a comment author
const tipComment = async (req, res) => {
  try {
    const { amount } = req.body;
    const tipAmount = parseInt(amount, 10);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      return res.status(400).json({ message: 'Invalid tip amount.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const sender = await User.findById(req.user._id);
    if (sender.coins < tipAmount) {
      return res.status(400).json({ message: 'Insufficient Peace Coins balance.' });
    }

    if (comment.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot tip your own comment.' });
    }

    // Debit sender
    sender.coins -= tipAmount;
    sender.contributionScore = (sender.contributionScore || 0) + 5;
    await sender.save();

    // Credit receiver
    await User.findByIdAndUpdate(
      comment.author,
      { $inc: { coins: tipAmount, contributionScore: 10 } }
    );

    // Send notification
    const { createAndSendNotification } = require('../services/notificationService');
    await createAndSendNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'tip',
      message: `${req.user.firstName} tipped your comment ${tipAmount} Peace Coins! 🪙`,
      link: `/profile/${req.user.username}`,
    });

    res.json({
      message: `Successfully tipped ${tipAmount} coins!`,
      coins: sender.coins,
      contributionScore: sender.contributionScore,
    });
  } catch (error) {
    console.error('Tip comment error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createPost, getFeed, getPost, toggleLike, addComment,
  toggleBookmark, requestFactCheck, deletePost, getUserPosts,
  addCommentReply, tipPost, tipComment,
};
