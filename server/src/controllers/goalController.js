const Goal = require('../models/Goal');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create goal
const createGoal = async (req, res) => {
  try {
    const { title, description, category, targetDate, isPublic, milestones, communityId } = req.body;

    const goal = new Goal({
      user: req.user._id,
      title, description,
      category: category || 'personal',
      targetDate: targetDate ? new Date(targetDate) : undefined,
      isPublic: isPublic !== false,
      milestones: milestones ? JSON.parse(milestones) : [],
      community: communityId || undefined,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get user goals
const getMyGoals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate('accountabilityPartner', 'firstName lastName username avatar')
      .sort({ createdAt: -1 });

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get public goals feed
const getPublicGoals = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = { isPublic: true, status: 'active' };
    if (category) query.category = category;

    const goals = await Goal.find(query)
      .populate('user', 'firstName lastName username avatar')
      .populate('accountabilityPartner', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update goal progress
const updateGoalProgress = async (req, res) => {
  try {
    const { progress, milestoneId, timelineEntry } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    if (progress !== undefined) goal.progress = progress;

    if (milestoneId) {
      const milestone = goal.milestones.id(milestoneId);
      if (milestone) {
        milestone.completed = true;
        milestone.completedAt = new Date();
      }
    }

    if (timelineEntry) {
      goal.timeline.push(JSON.parse(timelineEntry));
    }

    if (progress >= 100) {
      goal.status = 'completed';
      goal.completedAt = new Date();
      await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 20 } });
    }

    await goal.save();

    // Notify accountability partner
    if (goal.accountabilityPartner) {
      await Notification.create({
        recipient: goal.accountabilityPartner,
        sender: req.user._id,
        type: 'goalUpdate',
        message: `${req.user.firstName} updated progress on "${goal.title}" (${goal.progress}%)`,
        link: `/goals/${goal._id}`,
      });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Check in (Feature #30)
const checkIn = async (req, res) => {
  try {
    const { status, note } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    goal.checkIns.push({ status, note });
    await goal.save();

    if (goal.accountabilityPartner) {
      await Notification.create({
        recipient: goal.accountabilityPartner,
        sender: req.user._id,
        type: 'accountabilityCheckIn',
        message: `${req.user.firstName} checked in on "${goal.title}": ${status}`,
        link: `/goals/${goal._id}`,
      });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Set accountability partner
const setAccountabilityPartner = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    goal.accountabilityPartner = partnerId;
    await goal.save();

    await Notification.create({
      recipient: partnerId,
      sender: req.user._id,
      type: 'partnerRequest',
      message: `${req.user.firstName} assigned you as accountability partner for "${goal.title}"`,
      link: `/goals/${goal._id}`,
    });

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete goal
const deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Goal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createGoal, getMyGoals, getPublicGoals, updateGoalProgress, checkIn, setAccountabilityPartner, deleteGoal };
