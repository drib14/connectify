const { queryGemini, cleanAndParseJSON } = require("./gemini");

/**
 * Material Summarizer Agent.
 * Generates summaries, key points, vocab definitions, formulas, and objectives from lesson contents.
 * @param {string} title - Note title.
 * @param {string} content - Raw notes/text content.
 * @returns {Promise<object>} Generated summary object.
 */
async function generateNoteSummaries(title, content) {
  const prompt = `
You are Notes AI, an expert educational content writer.
Your job is to read the following student study material and generate a structured summary.
Title: "${title}"
Content:
"""
${content}
"""

Format your response in JSON with these exact keys and types:
{
  "summary": "A concise 3-4 sentence paragraph summarizing the main theme of the material.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", ...],
  "terms": [
    { "term": "Vocabulary word or term", "definition": "A clear, student-friendly explanation of the word." }
  ],
  "formulas": ["Formula 1", "Formula 2", ...] (leave as empty array if no formulas are mentioned),
  "objectives": ["Learning objective 1", "Learning objective 2", ...]
}
`;

  try {
    const rawResponse = await queryGemini(prompt, true);
    return cleanAndParseJSON(rawResponse);
  } catch (error) {
    console.error("Notes AI service error:", error);
    // Fallback if parsing fails
    return {
      summary: "Completed review of study notes.",
      keyPoints: ["Please review the core materials in detail."],
      terms: [],
      formulas: [],
      objectives: ["Understand the main concepts presented in the text."]
    };
  }
}

module.exports = { generateNoteSummaries };
