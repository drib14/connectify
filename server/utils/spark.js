const User = require('../models/User');

const DAILY_GOALS = [
  { name: 'Share an update or post', type: 'post', target: 1, current: 0, completed: false },
  { name: 'React to 3 posts', type: 'like', target: 3, current: 0, completed: false },
  { name: 'Send 2 messages to friends', type: 'message', target: 2, current: 0, completed: false },
  { name: 'Cast your vote in a poll', type: 'poll_vote', target: 1, current: 0, completed: false },
];

const POINTS_MAPPING = {
  post: 10,
  like: 5,
  message: 5,
  poll_vote: 5,
};

const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const checkAndResetChallenges = (user) => {
  const lastReset = new Date(user.dailyChallenges.lastReset);
  const startOfToday = getStartOfDay();

  if (lastReset < startOfToday || !user.dailyChallenges.goals || user.dailyChallenges.goals.length === 0) {
    user.dailyChallenges.goals = JSON.parse(JSON.stringify(DAILY_GOALS));
    user.dailyChallenges.lastReset = new Date();
    return true;
  }
  return false;
};

const trackSparkProgress = async (userId, goalType, req) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let isModified = checkAndResetChallenges(user);

    const goal = user.dailyChallenges.goals.find(g => g.type === goalType);
    if (goal && !goal.completed) {
      goal.current += 1;
      if (goal.current >= goal.target) {
        goal.completed = true;
        // Award points
        const basePoints = POINTS_MAPPING[goalType] || 5;
        const multiplier = user.isPremium ? 2 : 1;
        const pointsEarned = basePoints * multiplier;
        user.sparkPoints += pointsEarned;
        
        // Notify socket of points reward
        if (req && req.io && req.activeUsers) {
          const socketId = req.activeUsers.get(userId.toString());
          if (socketId) {
            req.io.to(socketId).emit('challenge_completed', {
              goalName: goal.name,
              pointsEarned,
              totalPoints: user.sparkPoints,
            });
          }
        }
      }
      isModified = true;
    }

    if (isModified) {
      await user.save();
    }
  } catch (err) {
    console.error('Error tracking Spark progress:', err);
  }
};

module.exports = {
  trackSparkProgress,
  checkAndResetChallenges,
};
