import ResearchCard from "../components/cards/ResearchCard";

const HISTORY_ITEMS = [
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
  {
    id: "4",
    subreddits: ["indiehackers"],
    date: "Jan 2026",
    painCount: 15,
    topPain: "Founders struggle to get their first 10 paying customers without an existing audience",
  },
  {
    id: "5",
    subreddits: ["webdev", "freelance"],
    date: "Dec 2025",
    painCount: 18,
    topPain: "Clients consistently undervalue design work and push back on fair rates",
  },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold tracking-tight">Search History</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">All your past analyses</p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
            defaultValue="newest"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-pains">Most pains</option>
          </select>
          <input
            type="text"
            placeholder="Search analyses..."
            className="flex-1 min-w-[180px] h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HISTORY_ITEMS.map((item, i) => (
            <ResearchCard key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
