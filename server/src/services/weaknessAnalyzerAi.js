const { queryGemini, cleanAndParseJSON } = require("./gemini");

/**
 * Weakness Analyzer Agent.
 * Analyzes mistakes and flashcard stats to identify concepts that require additional tutoring.
 * @param {Array} quizMistakes - Incorrect quiz questions and options.
 * @param {Array} flashcardStats - Details on flashcards marked as easy/hard.
 * @returns {Promise<object>} Weakness breakdown.
 */
async function analyzeLearningGaps(quizMistakes, flashcardStats = []) {
  const prompt = `
You are Weakness Detector AI, an expert educational psychologist and diagnostician.
Analyze the following student performance records:

Quiz Mistakes:
${JSON.stringify(quizMistakes)}

Flashcard Stats (hard cards, counts, etc.):
${JSON.stringify(flashcardStats)}

Identify:
1. Specific weak topics where the student makes frequent errors.
2. Strong topics where they excel.
3. Recommended review topics and actions they should take next.

Format your response in JSON with these exact keys:
{
  "weakTopics": [
    { "topic": "Name of weak topic", "reason": "Why we think it's weak based on logs", "recommendation": "What tutor topic or quiz to try next" }
  ],
  "strongTopics": ["Strong topic 1", "Strong topic 2"],
  "nextActionSteps": ["Action step 1", "Action step 2"]
}
`;

  try {
    const rawResponse = await queryGemini(prompt, true);
    return cleanAndParseJSON(rawResponse);
  } catch (error) {
    console.error("Weakness Detector AI error:", error);
    return {
      weakTopics: [{ topic: "General Topics", reason: "Analysis pending more inputs.", recommendation: "Continue taking quizzes." }],
      strongTopics: [],
      nextActionSteps: ["Complete at least one note summary and quiz."]
    };
  }
}

module.exports = { analyzeLearningGaps };
