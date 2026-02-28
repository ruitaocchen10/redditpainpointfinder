interface ResearchCardProps {
  id: string;
  subreddits: string[];
  date: string;
  painCount: number;
  topPain: string;
}

export default function ResearchCard({
  id,
  subreddits,
  date,
  painCount,
  topPain,
}: ResearchCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200/80 dark:hover:shadow-zinc-950/60">
      {/* Subreddit chips + date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {subreddits.map((sub) => (
            <span
              key={sub}
              className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              r/{sub}
            </span>
          ))}
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
          {date}
        </span>
      </div>

      {/* Pain count */}
      <div className="flex items-center gap-1.5">
        <span className="text-3xl font-bold text-orange-600 dark:text-orange-500 tabular-nums">
          {painCount}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          pain points
        </span>
      </div>

      {/* Top insight */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        &ldquo;{topPain}&rdquo;
      </p>

      {/* CTA */}
      <a
        href={`/results/${id}`}
        className="mt-auto text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded w-fit"
      >
        View results →
      </a>
    </div>
  );
}
