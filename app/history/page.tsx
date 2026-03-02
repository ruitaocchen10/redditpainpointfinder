import { createClient } from "../../lib/supabase/server";
import ResearchCard from "../components/cards/ResearchCard";

export default async function HistoryPage() {
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
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold tracking-tight">Search History</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            All your past analyses
          </p>
        </div>

        {/* Grid */}
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No analyses yet. Head to the dashboard to run your first search.
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
  );
}
