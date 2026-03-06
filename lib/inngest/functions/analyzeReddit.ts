import { inngest } from "../client";
import { createServiceClient } from "../../supabase/service";
import { fetchPosts } from "../../reddit/fetchPosts";
import { analyzePosts } from "../../claude/analyzePosts";

export const analyzeReddit = inngest.createFunction(
  { id: "analyze-reddit", name: "Analyze Reddit Posts" },
  { event: "reddit/analyze" },
  async ({ event, step }) => {
    const { analysisId } = event.data as { analysisId: string };
    const supabase = createServiceClient();

    // Fetch analysis config
    const { data: analysis, error: fetchError } = await supabase
      .from("analyses")
      .select("id, subreddits, time_range, post_limit, min_upvotes, keyword_filter, exclude_keywords")
      .eq("id", analysisId)
      .single();

    if (fetchError || !analysis) {
      throw new Error(`Analysis ${analysisId} not found`);
    }

    try {
      // Step 1: Fetch Reddit posts
      const posts = await step.run("fetch-posts", async () => {
        await supabase
          .from("analyses")
          .update({ status: "fetching" })
          .eq("id", analysisId);

        const fetchedPosts = await fetchPosts({
          subreddits: analysis.subreddits as string[],
          timeRange: analysis.time_range as string,
          postLimit: analysis.post_limit as number,
          minUpvotes: analysis.min_upvotes as number,
          keywordFilter: analysis.keyword_filter as string[],
          excludeKeywords: analysis.exclude_keywords as string[],
        });

        if (fetchedPosts.length > 0) {
          // Strip top_comment before upserting (not a DB column)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const dbPosts = fetchedPosts.map(({ top_comment: _tc, ...rest }) => rest);
          await supabase
            .from("reddit_posts")
            .upsert(dbPosts, { onConflict: "reddit_post_id" });
        }

        return fetchedPosts;
      });

      // Step 2: Analyze with Claude
      const painPoints = await step.run("analyze-with-claude", async () => {
        await supabase
          .from("analyses")
          .update({ status: "analyzing" })
          .eq("id", analysisId);

        return await analyzePosts(posts);
      });

      // Step 3: Save results
      await step.run("save-results", async () => {
        // Look up internal UUIDs for upserted reddit posts
        const { data: postRows } = await supabase
          .from("reddit_posts")
          .select("id, reddit_post_id")
          .in(
            "reddit_post_id",
            posts.map((p) => p.reddit_post_id)
          );

        const postIdMap = new Map(
          (postRows ?? []).map((r) => [r.reddit_post_id, r.id])
        );

        for (let i = 0; i < painPoints.length; i++) {
          const pp = painPoints[i];

          const { data: ppRow } = await supabase
            .from("pain_points")
            .insert({
              analysis_id: analysisId,
              title: pp.title,
              severity: pp.severity,
              frequency: pp.frequency,
              top_quote: pp.top_quote,
              categories: pp.categories,
              ai_summary: pp.ai_summary,
              sort_order: i,
            })
            .select("id")
            .single();

          if (ppRow && pp.post_ids?.length) {
            const joins = pp.post_ids
              .map((rid) => ({
                pain_point_id: ppRow.id,
                post_id: postIdMap.get(rid),
              }))
              .filter((j): j is { pain_point_id: string; post_id: string } =>
                Boolean(j.post_id)
              );

            if (joins.length > 0) {
              await supabase.from("pain_point_posts").insert(joins);
            }
          }
        }

        const topPain = painPoints[0]?.title ?? null;

        await supabase
          .from("analyses")
          .update({
            status: "completed",
            post_count: posts.length,
            pain_count: painPoints.length,
            top_pain: topPain,
            completed_at: new Date().toISOString(),
          })
          .eq("id", analysisId);
      });
    } catch (err) {
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message:
            err instanceof Error ? err.message : "Unknown error occurred",
        })
        .eq("id", analysisId);

      throw err;
    }
  }
);
