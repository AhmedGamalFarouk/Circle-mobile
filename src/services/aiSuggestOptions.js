import Constants from "expo-constants";

export async function getAiPollOptions(prompt) {
  try {
    const apiKey = Constants.expoConfig?.extra?.aiSuggestOptionsKey;
    
    if (!apiKey) {
      console.error("AI_SUGGEST_OPTIONS_KEY not found in environment variables");
      return null;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-website.com",
        "X-Title": "Poll Suggestion Tool",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: `
Generate exactly 3 poll options for this question: "${prompt}"
- Each option must be ONLY 1-3 words maximum
- Keep options short, simple, and actionable
- The options must be friendly and natural for a group of friends
- Return ONLY a numbered list like:
1. Gaming Night
2. Movie Marathon
3. Food Festival
Do NOT include any extra explanation or text.
`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert the numbered list string into an array of options
    return data.choices[0].message.content
      .trim()
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim().replace(/\.$/, ""));
  } catch (error) {
    console.error("AI suggestion error:", error);
    return null;
  }
}
