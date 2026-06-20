const Page = require('../models/Page');
const Post = require('../models/Post');

exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find().populate('owner', 'username profilePic');
    res.json({ success: true, pages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Page name is required' });
    }

    const existing = await Page.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Page name already taken' });
    }

    const newPage = new Page({
      name,
      description: description || '',
      category: category || 'Business',
      owner: req.user.id,
      followers: [req.user.id],
    });

    await newPage.save();
    res.status(201).json({ success: true, page: newPage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.followPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const isFollowing = page.followers.includes(req.user.id);
    if (isFollowing) {
      page.followers = page.followers.filter(id => id.toString() !== req.user.id);
      await page.save();
      return res.json({ success: true, message: 'Unfollowed page.' });
    } else {
      page.followers.push(req.user.id);
      await page.save();
      return res.json({ success: true, message: 'Followed page successfully!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPagePosts = async (req, res) => {
  try {
    const posts = await Post.find({ page: req.params.pageId })
      .populate('user', 'username profilePic isPremium')
      .populate('comments.user', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.postInPage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const page = await Page.findById(req.params.pageId);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (page.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only the owner can post.' });
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      page: req.params.pageId
    });

    await newPost.save();
    const populated = await Post.findById(newPost._id).populate('user', 'username profilePic isPremium');

    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
