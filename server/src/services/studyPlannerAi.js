const { queryGemini, cleanAndParseJSON } = require("./gemini");

/**
 * Calendar Planner Agent.
 * Generates structured calendar tasks and schedules based on exam dates and available study hours.
 * @param {Array<string>} subjects - List of subjects.
 * @param {string} examDates - Description of exam dates.
 * @param {number} studyHours - Daily study hour target.
 * @returns {Promise<Array>} List of daily schedules.
 */
async function generateStudySchedule(subjects, examDates, studyHours) {
  const today = new Date().toISOString().split("T")[0];

  const prompt = `
You are Study Planner AI, a productivity coach.
Design a highly effective 7-day study schedule starting from today (${today}).
Subjects: ${JSON.stringify(subjects)}
Exam Schedule details: "${examDates}"
Daily Study target: ${studyHours} hours

Instructions:
1. Divide the daily hours into focused blocks (e.g. 30 to 60 mins each).
2. Schedule specific tasks like "Review chapter 1", "Practice problems", "Take mock quiz" rather than generic "Study".
3. Prioritize subjects with closer exam dates.
4. Distribute study load logically to avoid burnout.

Format your response as a JSON array of daily schedules, where each day has this exact shape:
[
  {
    "date": "YYYY-MM-DD",
    "tasks": [
      { "subject": "Subject Name", "taskName": "Specific task to complete", "duration": 45, "completed": false }
    ]
  },
  ...
]
`;

  try {
    const rawResponse = await queryGemini(prompt, true);
    return cleanAndParseJSON(rawResponse);
  } catch (error) {
    console.error("Study Planner AI error:", error);
    // Fallback schedule
    const fallbackSchedules = [];
    const dateObj = new Date();
    for (let i = 0; i < 7; i++) {
      const dateString = dateObj.toISOString().split("T")[0];
      fallbackSchedules.push({
        date: dateString,
        tasks: subjects.map(sub => ({
          subject: sub,
          taskName: `Read textbook and review flashcards for ${sub}`,
          duration: Math.round((studyHours * 60) / Math.max(subjects.length, 1)),
          completed: false
        }))
      });
      dateObj.setDate(dateObj.getDate() + 1);
    }
    return fallbackSchedules;
  }
}

module.exports = { generateStudySchedule };
