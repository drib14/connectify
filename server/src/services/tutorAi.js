const { queryGemini } = require("./gemini");

/**
 * Conceptual Tutor Agent.
 * Explains concepts, uses analogies, guides students, and asks follow-up questions.
 * @param {string} prompt - The student's message.
 * @param {Array} chatHistory - Previous messages in the conversation.
 * @returns {Promise<{response: string, followUp: string}>}
 */
async function getTutorExplanation(prompt, chatHistory = []) {
  const historyString = chatHistory
    .map(msg => `${msg.sender === "user" ? "Student" : "Tutor"}: ${msg.text}`)
    .join("\n");

  const systemInstruction = `
You are Tutor AI, a premium learning companion and tutor.
Your goal is to help the student understand the core concept, NOT to do their work for them.
Follow these rules strictly:
1. Explain concepts clearly and simply, tailored for a beginner.
2. Use helpful real-world analogies.
3. Keep explanations structured but conversational.
4. Do NOT give direct answers to activity questions or homework tasks. Instead, guide them on how to arrive at the solution.
5. If writing code, do not write the full solution. Write small snippets or pseudo-code to explain the concept.
6. Provide a separate, short, interactive 1-2 sentence follow-up question to test their understanding at the very end of your response.

Format your response in JSON with these exact keys:
{
  "explanation": "Your tutoring explanation here with paragraphs and analogies.",
  "followUpQuestion": "Your 1-2 interactive follow-up questions here."
}
`;

  const fullPrompt = `
${systemInstruction}

Conversation History:
${historyString}

Current Student Prompt: "${prompt}"
`;

  try {
    const rawResponse = await queryGemini(fullPrompt, true);
    let parsed;
    try {
      const { cleanAndParseJSON } = require("./gemini");
      parsed = cleanAndParseJSON(rawResponse);
    } catch (parseError) {
      console.error("Failed to parse Tutor JSON response, formatting manually", rawResponse);
      parsed = {
        explanation: rawResponse,
        followUpQuestion: "Does that make sense? What part would you like to review next?"
      };
    }

    return {
      response: parsed.explanation || "Let's review the main concept step by step.",
      followUp: parsed.followUpQuestion || "What do you think will happen if we try a quick test of this concept?"
    };
  } catch (error) {
    console.error("Tutor AI service error:", error);
    throw error;
  }
}

module.exports = { getTutorExplanation };
