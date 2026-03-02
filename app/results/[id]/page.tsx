import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import ResultsView from "./ResultsView";
import PollingView from "./PollingView";
import type { ResultData } from "./ResultsView";

const TIME_RANGE_LABELS: Record<string, string> = {
  week: "Last week",
  month: "Last month",
  "3months": "Last 3 months",
  year: "Last year",
  all: "All time",
};

type AnalysisStatus = "pending" | "fetching" | "analyzing" | "completed" | "failed";

async function fetchResultData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  analysisId: string,
  analysis: {
    subreddits: string[];
    time_range: string;
    post_count: number | null;
    created_at: string;
  }
): Promise<ResultData | null> {
  const { data: painPointRows, error } = await supabase
    .from("pain_points")
    .select(
      `id, title, severity, frequency, top_quote, categories, ai_summary, sort_order,
       pain_point_posts ( reddit_posts ( title, upvotes, excerpt, url ) )`
    )
    .eq("analysis_id", analysisId)
    .order("sort_order");

  if (error) return null;

  const painPoints = (painPointRows ?? []).map((pp) => ({
    id: pp.id,
    title: pp.title,
    severity: pp.severity as "high" | "medium" | "low",
    frequency: pp.frequency,
    topQuote: pp.top_quote,
    categories: pp.categories,
    aiSummary: pp.ai_summary,
    posts: (pp.pain_point_posts as unknown as Array<{ reddit_posts: { title: string; upvotes: number; excerpt: string; url: string } | null }>)
      .map((ppp) => ppp.reddit_posts)
      .filter(Boolean) as { title: string; upvotes: number; excerpt: string; url: string }[],
  }));

  const date = new Date(analysis.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return {
    subreddits: analysis.subreddits,
    date,
    postCount: analysis.post_count ?? 0,
    timeRange: TIME_RANGE_LABELS[analysis.time_range] ?? analysis.time_range,
    painPoints,
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("id, status, error_message, subreddits, time_range, post_count, created_at")
    .eq("id", id)
    .single();

  if (error || !analysis) notFound();

  const status = analysis.status as AnalysisStatus;

  if (status === "completed") {
    const data = await fetchResultData(supabase, id, analysis);
    if (!data) notFound();
    return <ResultsView data={data} />;
  }

  // pending / fetching / analyzing / failed → client polling component
  return <PollingView analysisId={id} initialStatus={status} />;
}
