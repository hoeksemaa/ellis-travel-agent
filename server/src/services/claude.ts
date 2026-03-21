import Anthropic from "@anthropic-ai/sdk";
import type { QuizSubmission, Option } from "../types.js";

let anthropic: Anthropic;
function getClient() {
  if (!anthropic) anthropic = new Anthropic();
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
  user2Persona: QuizSubmission,
  user2Prefs: QuizSubmission
): Promise<Option[]> {
  const prompt = `Here are two travelers planning a trip together. Analyze their profiles and find 5 specific, real travel recommendations that would make both of them happy.

## Traveler 1 — Persona
${formatAnswers(user1Persona)}

## Traveler 1 — Trip Preferences
${formatAnswers(user1Prefs)}

## Traveler 2 — Persona
${formatAnswers(user2Persona)}

## Traveler 2 — Trip Preferences
${formatAnswers(user2Prefs)}

---

Look for areas of overlap and complementary interests between these two travelers. Use web search to find real, specific destinations, restaurants, activities, or experiences that would work for both of them.

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

  const response = await getClient().messages.create({
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

  // Extract text from the response (may have multiple content blocks due to tool use)
  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    }
  }

  // Parse JSON from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse options from Claude response");
  }

  const raw = JSON.parse(jsonMatch[0]) as Array<{
    name: string;
    description: string;
    matchReason: string;
  }>;

  return raw.map((item, i) => ({
    id: `option-${i + 1}`,
    name: item.name,
    description: item.description,
    matchReason: item.matchReason,
  }));
}

export async function generateResult(
  winningOption: Option,
  user1Persona: QuizSubmission,
  user1Prefs: QuizSubmission,
  user2Persona: QuizSubmission,
  user2Prefs: QuizSubmission
): Promise<string> {
  const prompt = `Both travelers chose: "${winningOption.name}"

Description: ${winningOption.description}
Why it matched: ${winningOption.matchReason}

## Traveler 1 — Persona
${formatAnswers(user1Persona)}

## Traveler 1 — Preferences
${formatAnswers(user1Prefs)}

## Traveler 2 — Persona
${formatAnswers(user2Persona)}

## Traveler 2 — Preferences
${formatAnswers(user2Prefs)}

---

Generate a fun, detailed recommendation summary for these two travelers. Include:
- Why this is the perfect pick for both of them
- Practical tips (best time to go, what to book in advance, budget estimates)
- 2-3 specific things they should do there
- A pro tip that most people miss

Keep it conversational and enthusiastic but practical.`;

  const response = await getClient().messages.create({
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

  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    }
  }

  return text;
}
