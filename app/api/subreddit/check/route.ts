import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ exists: false });

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(name)}/about.json`,
      {
        headers: { "User-Agent": "RedditPains/1.0" },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return NextResponse.json({ exists: false });

    const data = await res.json();

    // kind 't5' = subreddit; absent or wrong kind means banned/not found
    if (data?.kind !== "t5") return NextResponse.json({ exists: false });

    // Private or restricted subreddits still have kind 't5' but can't be read
    const subType = data?.data?.subreddit_type;
    if (subType === "private" || subType === "restricted") {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
