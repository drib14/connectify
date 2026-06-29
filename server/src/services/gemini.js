const dotenv = require("dotenv");
dotenv.config();

/**
 * Clean and parse JSON from Gemini's response, handling possible markdown wrapping.
 * @param {string} text - The raw text from the model.
 * @returns {object|array} Parsed JSON.
 */
function cleanAndParseJSON(text) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  return JSON.parse(cleanText.trim());
}

/**
 * Queries the Gemini API with automatic model and version fallback, supporting both query and header auth.
 * @param {string} prompt - The prompt to send.
 * @param {boolean} [jsonMode=false] - Whether to request JSON formatted output.
 * @returns {Promise<string>} Raw text or JSON string from the model.
 */
async function queryGemini(prompt, jsonMode = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  // Priority order: latest/safest free-tier models (2.5 flash/pro) followed by 1.5 versions
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];

  let lastError = null;

  for (const model of models) {
    const apiVersions = ["v1beta", "v1"];
    for (const apiVer of apiVersions) {
      // Loop through both header authentication and query authentication to ensure coverage
      const authTypes = ["header", "query"];
      
      for (const authType of authTypes) {
        const hasQueryKey = authType === "query";
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent${
          hasQueryKey ? `?key=${apiKey}` : ""
        }`;
        
        let finalPrompt = prompt;
        if (jsonMode) {
          finalPrompt += "\n\nRespond ONLY with a valid JSON block. Do not include any markdown backticks or explanations.";
        }

        const payload = {
          contents: [{ parts: [{ text: finalPrompt }] }]
        };

        const headers = {
          "Content-Type": "application/json"
        };
        if (!hasQueryKey) {
          headers["x-goog-api-key"] = apiKey; // Set secure authorization header
        }

        try {
          const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (resultText) {
              return resultText;
            }
          } else {
            const errorText = await response.text();
            console.warn(`[AI] Attempt failed: model "${model}" (${apiVer}) via ${authType} auth with status ${response.status}`);
            lastError = new Error(`Gemini API request failed with status ${response.status}: ${errorText}`);
          }
        } catch (err) {
          console.warn(`[AI] Network exception: model "${model}" (${apiVer}) via ${authType} auth:`, err.message);
          lastError = err;
        }
      }
    }
  }

  console.error("[AI] All attempts to reach Gemini API failed.");
  throw lastError || new Error("Gemini API request failed for all available models.");
}

module.exports = {
  queryGemini,
  cleanAndParseJSON
};
