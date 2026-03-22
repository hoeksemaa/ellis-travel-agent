import Anthropic from "@anthropic-ai/sdk";
import type { QuizSubmission, Option } from "../types.js";

let anthropic: Anthropic;
function getClient(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to your .env file in the project root."
      );
    }
    anthropic = new Anthropic();
    console.log("[Claude] Anthropic client initialized");
  }
  return anthropic;
}

function formatAnswers(submission: QuizSubmission): string {
  return submission.answers
    .map((a) => {
      const selected = Array.isArray(a.selected)
        ? a.selected.join(", ")
        : a.selected;
      let line = `- ${a.questionId}: ${selected}`;
      if (a.details) line += ` (additional context: "${a.details}")`;
      return line;
    })
    .join("\n");
}

export async function generateOptions(
  user1Persona: QuizSubmission,
  user1Prefs: QuizSubmission,
  user2Persona?: QuizSubmission,
  user2Prefs?: QuizSubmission
): Promise<Option[]> {
  const solo = !user2Persona || !user2Prefs;
  console.log(`[Claude] generateOptions called (${solo ? "solo" : "paired"} mode)`);
  console.log("[Claude] User 1 persona answers:", user1Persona.answers.length);
  console.log("[Claude] User 1 prefs answers:", user1Prefs.answers.length);
  if (!solo) {
    console.log("[Claude] User 2 persona answers:", user2Persona!.answers.length);
    console.log("[Claude] User 2 prefs answers:", user2Prefs!.answers.length);
  }

  const jsonFormat = `
Return exactly 5 options as a JSON array. Each option should be a real, specific place or experience (not generic). Format:

\`\`\`json
[
  {
    "name": "Specific Place or Experience Name",
    "description": "2-3 sentence description of what this is and why it's great",
    "matchReason": "1-2 sentences on why this works for BOTH travelers specifically"
  }
]
\`\`\`

Return ONLY the JSON array, no other text.`;

  const prompt = solo
    ? `Here is a solo traveler looking for trip recommendations. Analyze their profile and find 5 specific, real travel recommendations that match their interests.

## Traveler — Persona
${formatAnswers(user1Persona)}

## Traveler — Trip Preferences
${formatAnswers(user1Prefs)}

---

Use web search to find real, specific destinations, restaurants, activities, or experiences that match this traveler's profile.
${jsonFormat}`
    : `Here are two travelers planning a trip together. Analyze their profiles and find 5 specific, real travel recommendations that would make both of them happy.

## Traveler 1 — Persona
${formatAnswers(user1Persona)}

## Traveler 1 — Trip Preferences
${formatAnswers(user1Prefs)}

## Traveler 2 — Persona
${formatAnswers(user2Persona!)}

## Traveler 2 — Trip Preferences
${formatAnswers(user2Prefs!)}

---

Look for areas of overlap and complementary interests between these two travelers. Use web search to find real, specific destinations, restaurants, activities, or experiences that would work for both of them.
${jsonFormat}`;

  console.log("[Claude] Sending generateOptions request to Claude Sonnet...");
  const startTime = Date.now();

  let response;
  try {
    response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are a travel recommendation engine. Your job is to find real, specific places, activities, restaurants, and experiences that match travelers' profiles. Always recommend real places that exist. Use web search to verify and find current, accurate options. Return only valid JSON.",
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: any) {
    console.error("[Claude] API request failed:", err.message);
    if (err.status) console.error("[Claude] HTTP status:", err.status);
    if (err.error) console.error("[Claude] Error body:", JSON.stringify(err.error));
    throw new Error(`Claude API error: ${err.message}`);
  }

  const elapsed = Date.now() - startTime;
  console.log(`[Claude] Response received in ${elapsed}ms. Stop reason: ${response.stop_reason}`);
  console.log(`[Claude] Content blocks: ${response.content.length}, Usage: input=${response.usage.input_tokens} output=${response.usage.output_tokens}`);

  // Extract text from the response (may have multiple content blocks due to tool use)
  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    }
  }

  if (!text) {
    console.error("[Claude] No text content in response. Blocks:", response.content.map((b) => b.type));
    throw new Error("Claude returned no text content — response may have only contained tool use blocks");
  }

  // Parse JSON from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[Claude] Failed to find JSON array in response text:", text.substring(0, 500));
    throw new Error("Failed to parse options from Claude response — no JSON array found");
  }

  let raw: Array<{ name: string; description: string; matchReason: string }>;
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch (parseErr: any) {
    console.error("[Claude] JSON parse failed:", parseErr.message);
    console.error("[Claude] Raw JSON string:", jsonMatch[0].substring(0, 500));
    throw new Error(`Failed to parse Claude response as JSON: ${parseErr.message}`);
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    console.error("[Claude] Parsed JSON is not a non-empty array:", raw);
    throw new Error("Claude returned an empty or invalid options array");
  }

  const options = raw.map((item, i) => ({
    id: `option-${i + 1}`,
    name: item.name,
    description: item.description,
    matchReason: item.matchReason,
  }));

  console.log(`[Claude] Successfully parsed ${options.length} options:`, options.map((o) => o.name));
  return options;
}

export async function generateResult(
  winningOption: Option,
  user1Persona: QuizSubmission,
  user1Prefs: QuizSubmission,
  user2Persona?: QuizSubmission,
  user2Prefs?: QuizSubmission
): Promise<string> {
  const solo = !user2Persona || !user2Prefs;
  console.log(`[Claude] generateResult called for: "${winningOption.name}" (${solo ? "solo" : "paired"})`);

  const travelersSection = solo
    ? `## Traveler — Persona
${formatAnswers(user1Persona)}

## Traveler — Preferences
${formatAnswers(user1Prefs)}`
    : `## Traveler 1 — Persona
${formatAnswers(user1Persona)}

## Traveler 1 — Preferences
${formatAnswers(user1Prefs)}

## Traveler 2 — Persona
${formatAnswers(user2Persona!)}

## Traveler 2 — Preferences
${formatAnswers(user2Prefs!)}`;

  const prompt = `${solo ? "The traveler" : "Both travelers"} chose: "${winningOption.name}"

Description: ${winningOption.description}
Why it matched: ${winningOption.matchReason}

${travelersSection}

---

Generate a fun, detailed recommendation summary for ${solo ? "this traveler" : "these two travelers"}. Include:
- Why this is the perfect pick for both of them
- Practical tips (best time to go, what to book in advance, budget estimates)
- 2-3 specific things they should do there
- A pro tip that most people miss

Keep it conversational and enthusiastic but practical.`;

  const startTime = Date.now();

  let response;
  try {
    response = await getClient().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system:
        "You are Ellis, an enthusiastic and knowledgeable travel agent delivering a personalized recommendation to two travelers. Be specific, practical, and fun.",
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: any) {
    console.error("[Claude] generateResult API request failed:", err.message);
    if (err.status) console.error("[Claude] HTTP status:", err.status);
    throw new Error(`Claude API error during result generation: ${err.message}`);
  }

  const elapsed = Date.now() - startTime;
  console.log(`[Claude] generateResult response in ${elapsed}ms`);

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    }
  }

  if (!text) {
    console.error("[Claude] generateResult returned no text content");
    throw new Error("Claude returned no text for result summary");
  }

  console.log(`[Claude] Result summary generated (${text.length} chars)`);
  return text;
}
