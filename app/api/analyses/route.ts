import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { inngest } from "../../../lib/inngest/client";

const VALID_TIME_RANGES = ["week", "month", "year", "all"];
const VALID_POST_LIMITS = [50, 100, 250, 500];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subreddits, timeRange, postLimit } = body;

  if (
    !Array.isArray(subreddits) ||
    subreddits.length === 0 ||
    subreddits.length > 5
  ) {
    return NextResponse.json(
      { error: "subreddits must be an array of 1–5 items" },
      { status: 400 }
    );
  }

  if (!VALID_TIME_RANGES.includes(timeRange)) {
    return NextResponse.json({ error: "Invalid timeRange" }, { status: 400 });
  }

  if (!VALID_POST_LIMITS.includes(postLimit)) {
    return NextResponse.json({ error: "Invalid postLimit" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      subreddits,
      time_range: timeRange,
      post_limit: postLimit,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await inngest.send({
    name: "reddit/analyze",
    data: { analysisId: data.id },
  });

  return NextResponse.json({ id: data.id });
}
