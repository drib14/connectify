const { queryGemini, cleanAndParseJSON } = require("./gemini");

/**
 * Quiz Builder Agent.
 * Generates custom quizzes from note contents.
 * @param {string} noteTitle - Title of notes.
 * @param {string} noteContent - Core text contents.
 * @param {number} [numQuestions=5] - Number of questions to generate.
 * @param {string} [questionType="mixed"] - Type of questions (mcq, tf, fill, short, mixed).
 * @returns {Promise<Array>} Array of question objects.
 */
async function generateQuizQuestions(noteTitle, noteContent, numQuestions = 5, questionType = "mixed") {
  const prompt = `
You are Quiz AI, a professional educational assessment creator.
Your job is to generate a custom quiz based on the provided study notes.
Title: "${noteTitle}"
Content:
"""
${noteContent}
"""

Instructions:
1. Generate exactly ${numQuestions} questions.
2. The question type should be: ${questionType === "mixed" ? "a mixture of multiple-choice, true/false, identification/fill-in-the-blank, and short answer" : questionType}.
3. Format the options and answers correctly:
   - For multiple choice ("mcq"): provide exactly 4 options. The 'answer' must match one of the options exactly.
   - For true/false ("tf"): the options MUST be ["True", "False"]. The 'answer' must be either "True" or "False".
   - For identification/fill-in-the-blank ("fill"): the options array should be empty, and the 'answer' should be the target word.
   - For short answer ("short"): the options array should be empty, and the 'answer' should be a short reference model answer.
4. Each question MUST contain a detailed 'explanation' explaining why the answer is correct.

Format your response as a JSON array of questions, where each question has this exact shape:
[
  {
    "question": "The question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"], // or ["True", "False"] or []
    "answer": "Correct answer string",
    "questionType": "mcq" | "tf" | "fill" | "short",
    "explanation": "Explanation explaining the concepts."
  },
  ...
]
`;

  try {
    const rawResponse = await queryGemini(prompt, true);
    return cleanAndParseJSON(rawResponse);
  } catch (error) {
    console.error("Quiz AI service error:", error);
    // Fallback quiz
    return [
      {
        question: `Review question about ${noteTitle}`,
        options: ["True", "False"],
        answer: "True",
        questionType: "tf",
        explanation: "This is a fallback check. Please read the summary page contents to prepare."
      }
    ];
  }
}

module.exports = { generateQuizQuestions };
