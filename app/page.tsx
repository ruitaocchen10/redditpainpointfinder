import SubredditChipInput from "./components/forms/SubredditChipInput";
import ResearchCard from "./components/cards/ResearchCard";

const RESEARCH_HISTORY = [
  {
    id: "1",
    subreddits: ["startups"],
    date: "Jan 2026",
    painCount: 12,
    topPain: "No clear onboarding path — users don't know what to do after signing up",
  },
  {
    id: "2",
    subreddits: ["SaaS"],
    date: "Feb 2026",
    painCount: 8,
    topPain: "Pricing pages are opaque and make it hard to estimate monthly cost",
  },
  {
    id: "3",
    subreddits: ["productivity", "getdisciplined"],
    date: "Feb 2026",
    painCount: 21,
    topPain: "Apps add too many features and become overwhelming to use daily",
  },
];

export default function Home() {
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
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col gap-4">
          <SubredditChipInput />

          {/* Secondary filters + Analyse */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <select
                className="h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
                defaultValue="month"
              >
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="3months">Last 3 months</option>
                <option value="year">Last year</option>
                <option value="all">All time</option>
              </select>

              <select
                className="h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
                defaultValue="100"
              >
                <option value="50">50 posts</option>
                <option value="100">100 posts</option>
                <option value="250">250 posts</option>
                <option value="500">500 posts</option>
              </select>
            </div>

            <button
              type="button"
              className="bg-orange-600 dark:bg-orange-500 text-white h-11 px-7 rounded-full text-base font-semibold transition-all duration-200 hover:bg-orange-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 dark:hover:shadow-orange-400/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Analyse
            </button>
          </div>

          <button
            type="button"
            className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 w-fit transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
          >
            + Advanced options
          </button>
        </div>

        {/* Research history */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Your research
            </h2>
            {/* Free tier nudge */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RESEARCH_HISTORY.map((item, i) => (
              <ResearchCard key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
