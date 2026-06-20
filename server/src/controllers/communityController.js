const Community = require('../models/Community');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create community
const createCommunity = async (req, res) => {
  try {
    const { name, description, type, isTemporary, expiresInDays, location, allowAnonymous, isPrivate, tags, sharedGoal, problemData } = req.body;

    const community = new Community({
      name, description, type: type || 'general',
      creator: req.user._id,
      isTemporary: isTemporary === 'true',
      expiresAt: isTemporary === 'true' ? new Date(Date.now() + (expiresInDays || 30) * 24 * 60 * 60 * 1000) : undefined,
      allowAnonymous: allowAnonymous === 'true',
      isPrivate: isPrivate === 'true',
      tags: tags ? JSON.parse(tags) : [],
      members: [{ user: req.user._id, role: 'admin' }],
      memberCount: 1,
    });

    if (location) {
      const loc = JSON.parse(location);
      community.location = { type: 'Point', coordinates: [loc.lng, loc.lat], address: loc.address, radius: loc.radius || 5 };
    }

    if (sharedGoal) community.sharedGoal = JSON.parse(sharedGoal);
    if (problemData) community.problemData = JSON.parse(problemData);

    if (req.files?.communityMedia) {
      community.avatar = req.files.communityMedia[0]?.path;
    }

    await community.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 10 } });

    res.status(201).json(community);
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get communities
const getCommunities = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20, lat, lng, radius } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    // Neighborhood filter
    if (lat && lng) {
      query['location'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (parseFloat(radius) || 5) * 1000,
        },
      };
    }

    // Exclude expired temporary communities
    query.$or = [
      { isTemporary: false },
      { isTemporary: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ];

    const communities = await Community.find(query)
      .populate('creator', 'firstName lastName username avatar')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Community.countDocuments(query);

    res.json({ communities, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get single community
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'firstName lastName username avatar')
      .populate('members.user', 'firstName lastName username avatar contributionScore')
      .populate('problemData.solutions.author', 'firstName lastName username avatar');

    if (!community) return res.status(404).json({ message: 'Community not found.' });
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Join community
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found.' });

    const isMember = community.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ message: 'Already a member.' });

    community.members.push({ user: req.user._id, role: 'member' });
    community.memberCount += 1;
    await community.save();

    res.json({ message: 'Joined community!', memberCount: community.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Leave community
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found.' });

    community.members = community.members.filter(m => m.user.toString() !== req.user._id.toString());
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.json({ message: 'Left community.', memberCount: community.memberCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Community Voting (Feature #13)
const createVote = async (req, res) => {
  try {
    const { title, description, options, endsInDays } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found.' });

    const vote = {
      title, description,
      options: options.map(o => ({ text: o, votes: [] })),
      createdBy: req.user._id,
      endsAt: new Date(Date.now() + (endsInDays || 7) * 24 * 60 * 60 * 1000),
    };

    community.votes.push(vote);
    await community.save();

    res.json(community.votes);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Cast vote
const castVote = async (req, res) => {
  try {
    const { voteId, optionIndex } = req.body;
    const community = await Community.findById(req.params.id);
    const vote = community.votes.id(voteId);
    if (!vote) return res.status(404).json({ message: 'Vote not found.' });

    // Remove existing vote
    vote.options.forEach(opt => { opt.votes.pull(req.user._id); });
    vote.options[optionIndex].votes.push(req.user._id);
    await community.save();

    res.json(vote);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add solution to problem-solving hub (Feature #50)
const addSolution = async (req, res) => {
  try {
    const { content } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community || community.type !== 'problemSolving') {
      return res.status(400).json({ message: 'Not a problem-solving community.' });
    }

    community.problemData.solutions.push({ author: req.user._id, content });
    community.impactMetrics.problemsSolved += 1;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 15 } });

    const updated = await Community.findById(req.params.id)
      .populate('problemData.solutions.author', 'firstName lastName username avatar');

    res.json(updated.problemData);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Wiki operations (Feature #19)
const addWikiPage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found.' });

    community.wiki.push({ title, content, lastEditedBy: req.user._id });
    community.impactMetrics.knowledgeArticles += 1;
    await community.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 5 } });

    res.json(community.wiki);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update wiki page
const updateWikiPage = async (req, res) => {
  try {
    const { content } = req.body;
    const community = await Community.findById(req.params.id);
    const page = community.wiki.id(req.params.pageId);
    if (!page) return res.status(404).json({ message: 'Wiki page not found.' });

    page.editHistory.push({ editor: req.user._id, content: page.content });
    page.content = content;
    page.lastEditedBy = req.user._id;
    await community.save();

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Volunteer opportunities (Feature #14)
const addVolunteerOpportunity = async (req, res) => {
  try {
    const { title, description, date, location, spotsAvailable } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found.' });

    community.volunteerData.opportunities.push({ title, description, date, location, spotsAvailable });
    await community.save();

    res.json(community.volunteerData);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Sign up for volunteer opportunity
const signUpVolunteer = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    const opportunity = community.volunteerData.opportunities.id(req.params.oppId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });

    if (!opportunity.signedUp.includes(req.user._id)) {
      opportunity.signedUp.push(req.user._id);
      community.impactMetrics.volunteersEngaged += 1;
      await community.save();
    }

    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createCommunity, getCommunities, getCommunity,
  joinCommunity, leaveCommunity,
  createVote, castVote,
  addSolution, addWikiPage, updateWikiPage,
  addVolunteerOpportunity, signUpVolunteer,
};
