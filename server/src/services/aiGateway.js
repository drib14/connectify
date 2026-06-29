const { queryGemini, cleanAndParseJSON } = require("./gemini");
const { getTutorExplanation } = require("./tutorAi");
const User = require("../models/user");

/**
 * Audit student prompt to detect direct answer cheating.
 * If they ask for direct solutions, we suspend their token.
 * @param {string} prompt - The student prompt.
 * @param {string} userId - The user's database ID.
 * @returns {Promise<boolean>} True if prompt is flagged as cheating.
 */
async function auditCheatingPrompt(prompt, userId) {
  // 1. Perform AI audit using Gemini for smart semantic checks of prompt structure & intent
  const auditPrompt = `
You are a prompt safety auditor for an AI educational tutor platform.
Your task is to determine if the student's prompt is a direct request to do their work (cheating), e.g., asking for the final answers directly, requesting the exact code for an assignment to copy-paste, or asking for direct solutions to exam/homework problems without explaining the process.

If the student is asking for:
- Explanation of steps or conceptual processes (e.g. "how do I solve this", "explain this equation")
- Hints, debugging help, or practice problems
- General educational concept summaries
Then it is NOT cheating (isCheating should be false).

Analyze the prompt: "${prompt}"

Respond in JSON format:
{
  "isCheating": true, // or false
  "reason": "Short explanation of why it is cheating or safe"
}
`;

  let isCheating = false;
  let reason = "";

  try {
    const rawAudit = await queryGemini(auditPrompt, true);
    const result = cleanAndParseJSON(rawAudit);
    if (result.isCheating === true) {
      isCheating = true;
      reason = result.reason || "Asking for direct homework answers.";
    }
  } catch (error) {
    console.error("AI prompt audit failed, falling back to safe status: ", error);
  }

  if (isCheating) {
    return true;
  }

  return false;
}

/**
 * AI Gateway router.
 * Dispatches the requested type to the appropriate specialized AI service.
 */
async function processAiRequest(type, params, userId) {
  // Check if user session exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User session not found.");
  }

  switch (type) {
    case "tutor": {
      const { prompt, chatHistory } = params;
      // Perform prompt check
      const isCheat = await auditCheatingPrompt(prompt, userId);
      if (isCheat) {
        return {
          response: "I am here to help you learn and understand the concepts! As your AI study companion, I cannot write the direct answers or solve homework questions for you. However, I would be happy to explain the step-by-step process or explain any concepts behind this problem if you ask! Let's study smarter together. 📚",
          followUp: "Would you like me to explain the core concepts of this problem step-by-step instead?"
        };
      }
      return await getTutorExplanation(prompt, chatHistory);
    }

    case "homeworkHelper": {
      const { problem, studentSolution } = params;
      // Perform prompt check
      const isCheat = await auditCheatingPrompt(`${problem} ${studentSolution || ""}`, userId);
      if (isCheat) {
        return {
          steps: ["I cannot provide direct solutions or complete answers for assignment questions."],
          hints: ["Try breaking down the concept or asking me to explain how the formulas work step-by-step instead! Let's build your understanding together."],
          feedbackOnSolution: "Request flagged as seeking direct answers. Connectify is here to guide your learning, not to do your homework."
        };
      }

      const prompt = `
You are AI Homework Helper, a study companion.
The student has presented this homework problem:
"${problem}"
Student's proposed solution or notes:
"${studentSolution || "None provided yet"}"

Instructions:
1. Do NOT solve the problem for the student or give them the final answers.
2. Break down the steps required to solve it.
3. Identify mistakes in their proposed solution, if any.
4. Give hints and ask guide questions.

Format your response in JSON:
{
  "steps": ["Step 1 explanation", "Step 2 explanation", ...],
  "hints": ["Hint 1", "Hint 2"],
  "feedbackOnSolution": "Feedback on student's solution."
}
`;
      const rawRes = await queryGemini(prompt, true);
      return cleanAndParseJSON(rawRes);
    }

    case "conceptMap": {
      const { topic } = params;
      const prompt = `
You are Concept Map AI.
Generate a structured conceptual hierarchy map for the topic: "${topic}".
Create a visual learning path showing the key components and how they link.

Format your response as a JSON object representing nodes and edges (links):
{
  "nodes": [
    { "id": "1", "label": "Main Topic" },
    { "id": "2", "label": "Subtopic A" }
  ],
  "links": [
    { "source": "1", "target": "2", "label": "consists of" }
  ]
}
`;
      const rawRes = await queryGemini(prompt, true);
      return cleanAndParseJSON(rawRes);
    }

    default:
      throw new Error(`Unsupported AI gateway route: ${type}`);
  }
}

module.exports = {
  processAiRequest,
  auditCheatingPrompt
};
