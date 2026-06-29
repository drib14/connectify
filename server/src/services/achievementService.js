const User = require("../models/user");

/**
 * Checks and awards achievements for a user after any study action.
 * @param {String} userId - The user ID
 * @param {String} actionType - 'note_created' | 'quiz_completed' | 'streak_updated' | 'study_time_updated'
 * @param {Object} details - Action details (e.g. quiz score, streak count, total time)
 */
async function checkAndAwardAchievements(userId, actionType, details = {}) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let achievementName = "";
    let achievementDescription = "";

    // 1. Evaluate achievement based on action
    if (actionType === "note_created") {
      const alreadyHas = user.achievements.some((a) => a.name === "First Digest");
      if (!alreadyHas) {
        achievementName = "First Digest";
        achievementDescription = "Created your first AI lesson notes summary! 📝";
      }
    } else if (actionType === "quiz_completed") {
      const alreadyHas = user.achievements.some((a) => a.name === "Perfect Score");
      if (!alreadyHas && details.score && details.maxScore && details.score === details.maxScore) {
        achievementName = "Perfect Score";
        achievementDescription = `Earned a perfect ${details.score}/${details.maxScore} on an AI practice quiz! 🎯`;
      }
    } else if (actionType === "streak_updated") {
      const streak = details.streak || user.studyStreak || 0;
      const alreadyHas = user.achievements.some((a) => a.name === "Study Habit");
      if (!alreadyHas && streak >= 3) {
        achievementName = "Study Habit";
        achievementDescription = `Maintained a study streak of ${streak} consecutive days! 🔥`;
      }
    } else if (actionType === "study_time_updated") {
      const totalTime = details.totalTime || user.totalStudyTime || 0;
      const alreadyHas = user.achievements.some((a) => a.name === "Deep Focus");
      if (!alreadyHas && totalTime >= 60) {
        achievementName = "Deep Focus";
        achievementDescription = "Studied for a cumulative total of 60 minutes or more! ⏰";
      }
    }

    // 2. If new achievement earned, award it
    if (achievementName) {
      user.achievements.push({ name: achievementName, earnedAt: new Date() });
      await user.save();
    }
  } catch (error) {
    console.error("Failed to process achievement checks:", error);
  }
}

module.exports = {
  checkAndAwardAchievements,
};
