import { createClient } from "../../lib/supabase/server";
import DashboardSearchForm from "../components/forms/DashboardSearchForm";
import ResearchCard from "../components/cards/ResearchCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = user
    ? await supabase
        .from("analyses")
        .select("id, subreddits, created_at, status, pain_count, top_pain")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: null };

  const history = (analyses ?? []).map((row) => ({
    id: row.id as string,
    subreddits: row.subreddits as string[],
    date: new Date(row.created_at as string).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    painCount: (row.pain_count as number) ?? 0,
    topPain:
      (row.top_pain as string) ??
      (row.status === "completed" ? "No pains found" : (row.status as string)),
  }));

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-10">
        {/* Hero */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Reddit Pain Point Finder
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Discover what your target audience complains about
          </p>
        </div>

        {/* Search card */}
        <DashboardSearchForm />

        {/* Research history */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Your research
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Free plan: 2 of 3 saves used ·{" "}
              <a
                href="#"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                Upgrade
              </a>
            </span>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No analyses yet. Run your first search above.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item) => (
                <ResearchCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
