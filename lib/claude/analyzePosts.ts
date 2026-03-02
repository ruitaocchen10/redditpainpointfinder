import Anthropic from "@anthropic-ai/sdk";
import type { RedditPostData } from "../reddit/fetchPosts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface PainPointResult {
  title: string;
  severity: "high" | "medium" | "low";
  frequency: number;
  top_quote: string;
  categories: string[];
  ai_summary: string;
  post_ids: string[];
}

export async function analyzePosts(
  posts: RedditPostData[]
): Promise<PainPointResult[]> {
  const postsText = posts
    .map((p) => {
      const body = p.body_text ? p.body_text.slice(0, 400) : "";
      const commentLine = p.top_comment
        ? `\nTop comment: "${p.top_comment.slice(0, 200)}"`
        : "";
      return `[ID: ${p.reddit_post_id} | Score: ${p.score} | r/${p.subreddit}] ${p.title}\n${body}${commentLine}`;
    })
    .join("\n\n---\n\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    tools: [
      {
        name: "report_pain_points",
        description:
          "Report the clustered pain points discovered in the Reddit posts",
        input_schema: {
          type: "object" as const,
          properties: {
            pain_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "A clear, concise name for this pain point",
                  },
                  severity: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description:
                      "Severity based on emotional intensity and real-world impact",
                  },
                  frequency: {
                    type: "integer",
                    description: "Number of posts that express this pain",
                  },
                  top_quote: {
                    type: "string",
                    description:
                      "An exact verbatim quote from one of the posts that best exemplifies this pain",
                  },
                  categories: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "2-4 topic tags (e.g. 'Onboarding', 'UX', 'Pricing')",
                  },
                  ai_summary: {
                    type: "string",
                    description:
                      "2-3 sentences explaining the pattern, context, and implications for founders",
                  },
                  post_ids: {
                    type: "array",
                    items: { type: "string" },
                    description:
                      "List of post IDs (the [ID: ...] values) for posts that express this pain",
                  },
                },
                required: [
                  "title",
                  "severity",
                  "frequency",
                  "top_quote",
                  "categories",
                  "ai_summary",
                  "post_ids",
                ],
              },
            },
          },
          required: ["pain_points"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "report_pain_points" },
    messages: [
      {
        role: "user",
        content: `Analyze these Reddit posts and cluster them into 5-15 distinct pain points. These may be:
- Frustrations people have with existing products or tools
- Recurring problems, struggles, or unmet needs the community faces in their work or lives
- Complaints about processes, systems, or the status quo
- Emotional or practical challenges that come up repeatedly

Extract whatever pain points are most prominent in THIS community — don't filter them out because they aren't product complaints. A founder community will surface founder pains; a productivity community will surface workflow pains; etc. All are valid.

For each pain point:
- title: Short, specific name (e.g. "Investors give soft yeses but never close")
- severity: high (urgent/blocking), medium (significant friction), low (minor annoyance)
- frequency: count of posts expressing this specific pain
- top_quote: Exact verbatim quote from a post — do not paraphrase
- categories: 2-4 concise topic tags
- ai_summary: 2-3 sentences on the pattern, why it's happening, and what it means for anyone looking to build solutions for this community
- post_ids: The reddit post IDs (the value after "ID: " in each post header, e.g. "t3_abc123") for posts that contribute to this cluster

Posts:
${postsText}`,
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  const result = toolUse.input as { pain_points: PainPointResult[] };
  return result.pain_points ?? [];
}
