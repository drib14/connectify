import Group from '../models/Group.js';
import Post from '../models/Post.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name,
      description: description || '',
      avatar: avatar || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=150&q=80',
      creator: req.user._id,
      members: [req.user._id],
    });

    const populated = await Group.findById(group._id)
      .populate('creator', 'username avatar isPremium')
      .populate('members', 'username avatar isPremium');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Group Error:', error.message);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'username avatar isPremium')
      .populate('members', 'username avatar isPremium')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get Groups Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve groups' });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id)
      .populate('creator', 'username avatar isPremium')
      .populate('members', 'username avatar isPremium');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get Group Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve group details' });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const memberIndex = group.members.findIndex((m) => m.toString() === req.user._id.toString());

    if (memberIndex > -1) {
      // Leave group (but creator can't leave)
      if (group.creator.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Creator cannot leave the group' });
      }
      group.members.splice(memberIndex, 1);
    } else {
      // Join group
      group.members.push(req.user._id);
    }

    await group.save();

    const populated = await Group.findById(group._id)
      .populate('creator', 'username avatar isPremium')
      .populate('members', 'username avatar isPremium');

    res.json(populated);
  } catch (error) {
    console.error('Join Group Error:', error.message);
    res.status(500).json({ message: 'Failed to toggle group membership' });
  }
};

export const createGroupPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, media, vibe, location } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can publish posts' });
    }

    if (!content && (!media || media.length === 0) && !vibe) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      media: media || [],
      vibe: vibe || null,
      location: location || null,
      group: group._id,
    });

    group.posts.push(post._id);
    await group.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Group Post Error:', error.message);
    res.status(500).json({ message: 'Failed to create group post' });
  }
};

export const getGroupPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ group: id })
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get Group Posts Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve group posts' });
  }
};
