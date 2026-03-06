const REDDIT_API_BASE = "https://www.reddit.com";
const USER_AGENT = "RedditPains/1.0";

// Reddit public API only supports: week, month, year, all
const TIME_MAP: Record<string, string> = {
  week: "week",
  month: "month",
  year: "year",
  all: "all",
};

export interface RedditPostData {
  reddit_post_id: string;
  subreddit: string;
  title: string;
  url: string;
  upvotes: number;
  excerpt: string | null;
  author: string | null;
  score: number;
  num_comments: number;
  body_text: string | null;
  posted_at: string | null;
  // Not stored in DB, used for Claude analysis
  top_comment?: string;
}

async function fetchSubredditPosts(
  subreddit: string,
  limit: number,
  timeFilter: string,
  minUpvotes: number
): Promise<RedditPostData[]> {
  const url = `${REDDIT_API_BASE}/r/${subreddit}/top.json?limit=${limit}&t=${timeFilter}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    console.warn(`Failed to fetch r/${subreddit}: ${res.status}`);
    return [];
  }

  const data = await res.json();
  const children = data?.data?.children ?? [];

  return children
    .filter((child: { data: { is_self?: boolean; score?: number; selftext?: string } }) => {
      const post = child.data;
      // Filter out link-only posts (no self-text) and low-score posts
      if (!post.is_self) return false;
      if ((post.score ?? 0) < minUpvotes) return false;
      if (!post.selftext || post.selftext === "[deleted]" || post.selftext === "[removed]") return false;
      return true;
    })
    .map((child: { data: Record<string, unknown> }) => {
      const post = child.data;
      const bodyText = typeof post.selftext === "string" ? post.selftext : null;
      return {
        reddit_post_id: post.name as string, // e.g. "t3_abc123"
        subreddit,
        title: post.title as string,
        url: `https://reddit.com${post.permalink as string}`,
        upvotes: (post.ups as number) ?? 0,
        excerpt: bodyText ? bodyText.slice(0, 500) : null,
        author: (post.author as string) ?? null,
        score: (post.score as number) ?? 0,
        num_comments: (post.num_comments as number) ?? 0,
        body_text: bodyText,
        posted_at: post.created_utc
          ? new Date((post.created_utc as number) * 1000).toISOString()
          : null,
      } as RedditPostData;
    });
}

async function fetchTopComment(
  subreddit: string,
  postId: string
): Promise<string | null> {
  // postId is like "t3_abc123", strip the "t3_" prefix
  const id = postId.replace(/^t3_/, "");
  const url = `${REDDIT_API_BASE}/r/${subreddit}/comments/${id}.json?limit=3&depth=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const comments = data?.[1]?.data?.children ?? [];
    const topComment = comments.find(
      (c: { kind: string; data: { body?: string; score?: number } }) =>
        c.kind === "t1" && c.data.body && c.data.body !== "[deleted]"
    );

    return topComment ? (topComment.data.body as string).slice(0, 300) : null;
  } catch {
    return null;
  }
}

function engagementScore(post: RedditPostData): number {
  return post.score * Math.log(post.num_comments + 1);
}

export async function fetchPosts({
  subreddits,
  timeRange,
  postLimit,
  minUpvotes = 2,
  keywordFilter = [],
  excludeKeywords = [],
}: {
  subreddits: string[];
  timeRange: string;
  postLimit: number;
  minUpvotes?: number;
  keywordFilter?: string[];
  excludeKeywords?: string[];
}): Promise<RedditPostData[]> {
  const redditTimeFilter = TIME_MAP[timeRange] ?? "month";

  // Budget per subreddit: at least 50, evenly distributed
  const perSubBudget = Math.max(50, Math.floor(postLimit / subreddits.length));

  // Fetch posts from each subreddit in parallel
  const subResults = await Promise.all(
    subreddits.map((sub) =>
      fetchSubredditPosts(sub, perSubBudget, redditTimeFilter, minUpvotes)
    )
  );

  // Fail fast if every subreddit returned nothing (all failed or are empty)
  const allEmpty = subResults.every((r) => r.length === 0);
  if (allEmpty) {
    throw new Error(
      `Could not fetch posts from any of the requested subreddits: ${subreddits.join(", ")}`
    );
  }

  // Pool all posts, deduplicate by reddit_post_id
  const seen = new Set<string>();
  const pooled: RedditPostData[] = [];
  for (const posts of subResults) {
    for (const post of posts) {
      if (!seen.has(post.reddit_post_id)) {
        seen.add(post.reddit_post_id);
        pooled.push(post);
      }
    }
  }

  // Apply keyword filters
  let filtered = pooled;
  if (keywordFilter.length > 0 || excludeKeywords.length > 0) {
    const lowerIncludes = keywordFilter.map((k) => k.toLowerCase());
    const lowerExcludes = excludeKeywords.map((k) => k.toLowerCase());
    filtered = pooled.filter((post) => {
      const text = (post.title + " " + (post.body_text ?? "")).toLowerCase();
      if (lowerIncludes.length > 0 && !lowerIncludes.some((k) => text.includes(k))) return false;
      if (lowerExcludes.some((k) => text.includes(k))) return false;
      return true;
    });
  }

  // Sort by engagement and take top postLimit
  filtered.sort((a, b) => engagementScore(b) - engagementScore(a));
  const topPosts = filtered.slice(0, postLimit);

  // Fetch top comment for the top 30 posts sequentially to respect public API rate limits (~10 req/min)
  const commentCandidates = topPosts.slice(0, 30);
  for (const post of commentCandidates) {
    await new Promise((r) => setTimeout(r, 100));
    post.top_comment = (await fetchTopComment(post.subreddit, post.reddit_post_id)) ?? undefined;
  }

  return topPosts;
}
