const Group = require('../models/Group');
const Post = require('../models/Post');

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'username profilePic');
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const existing = await Group.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Group name already taken' });
    }

    const newGroup = new Group({
      name,
      description: description || '',
      privacy: privacy || 'public',
      members: [req.user.id],
      admins: [req.user.id],
    });

    await newGroup.save();
    res.status(201).json({ success: true, group: newGroup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    group.members.push(req.user.id);
    await group.save();
    res.json({ success: true, message: 'Joined group successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    group.members = group.members.filter(m => m.toString() !== req.user.id);
    group.admins = group.admins.filter(a => a.toString() !== req.user.id);
    await group.save();
    res.json({ success: true, message: 'Left group.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGroupPosts = async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.groupId })
      .populate('user', 'username profilePic isPremium')
      .populate('comments.user', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.postInGroup = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Must be a group member to post' });
    }

    const newPost = new Post({
      user: req.user.id,
      content,
      group: req.params.groupId
    });

    await newPost.save();
    const populated = await Post.findById(newPost._id).populate('user', 'username profilePic isPremium');

    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
