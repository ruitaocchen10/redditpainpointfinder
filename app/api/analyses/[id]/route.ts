import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createServiceClient } from "../../../../lib/supabase/service";

const TIME_RANGE_LABELS: Record<string, string> = {
  week: "Last week",
  month: "Last month",
  year: "Last year",
  all: "All time",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select(
      "id, status, error_message, subreddits, time_range, post_count, created_at"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (analysisError || !analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (analysis.status !== "completed") {
    return NextResponse.json({
      status: analysis.status,
      error: analysis.error_message ?? null,
    });
  }

  // Fetch pain points with their supporting posts
  const { data: painPointRows, error: ppError } = await supabase
    .from("pain_points")
    .select(
      `id, title, severity, frequency, top_quote, categories, ai_summary, sort_order,
       pain_point_posts ( reddit_posts ( title, upvotes, excerpt, url ) )`
    )
    .eq("analysis_id", id)
    .order("sort_order");

  if (ppError) {
    return NextResponse.json({ error: ppError.message }, { status: 500 });
  }

  const painPoints = (painPointRows ?? []).map((pp) => ({
    id: pp.id,
    title: pp.title,
    severity: pp.severity,
    frequency: pp.frequency,
    topQuote: pp.top_quote,
    categories: pp.categories,
    aiSummary: pp.ai_summary,
    posts: (pp.pain_point_posts as unknown as Array<{ reddit_posts: { title: string; upvotes: number; excerpt: string; url: string } | null }>)
      .map((ppp) => ppp.reddit_posts)
      .filter(Boolean),
  }));

  const date = new Date(analysis.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return NextResponse.json({
    status: "completed",
    data: {
      subreddits: analysis.subreddits,
      date,
      postCount: analysis.post_count ?? 0,
      timeRange: TIME_RANGE_LABELS[analysis.time_range] ?? analysis.time_range,
      painPoints,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
