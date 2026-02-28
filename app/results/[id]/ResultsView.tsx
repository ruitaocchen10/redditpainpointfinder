"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PainPointCard, { PainPoint } from "../../components/cards/PainPointCard";

export interface ResultData {
  subreddits: string[];
  date: string;
  postCount: number;
  timeRange: string;
  painPoints: PainPoint[];
}

type SortKey = "frequency" | "severity" | "recent";

const SEVERITY_ORDER: Record<PainPoint["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export default function ResultsView({ data }: { data: ResultData }) {
  const [sort, setSort] = useState<SortKey>("frequency");

  const sorted = useMemo(() => {
    const pts = [...data.painPoints];
    if (sort === "frequency") return pts.sort((a, b) => b.frequency - a.frequency);
    if (sort === "severity") return pts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    return pts; // "recent" = original order
  }, [data.painPoints, sort]);

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-8">

        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {data.subreddits.map((sub) => (
                <span
                  key={sub}
                  className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  r/{sub}
                </span>
              ))}
            </div>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">{data.date}</span>
          </div>

          {/* Stat row */}
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data.painPoints.length}</span>
            <span>pain points</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{data.postCount}</span>
            <span>posts analyzed</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>{data.timeRange}</span>
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <option value="frequency">Frequency</option>
            <option value="severity">Severity</option>
            <option value="recent">Most recent</option>
          </select>
        </div>

        {/* Pain points list */}
        <div className="flex flex-col gap-3">
          {sorted.map((pain) => (
            <PainPointCard key={pain.id} pain={pain} />
          ))}
        </div>

      </div>
    </div>
  );
}
