"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PainPointCard, { PainPoint, RedditPost } from "../../components/cards/PainPointCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

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

const SEVERITY_DOT: Record<PainPoint["severity"], string> = {
  high: "bg-red-500",
  medium: "bg-orange-500",
  low: "bg-yellow-500",
};

export default function ResultsView({ data }: { data: ResultData }) {
  const [sort, setSort] = useState<SortKey>("frequency");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => data.painPoints[0]?.id ?? null
  );

  const sorted = useMemo(() => {
    const pts = [...data.painPoints];
    if (sort === "frequency") return pts.sort((a, b) => b.frequency - a.frequency);
    if (sort === "severity") return pts.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    return pts; // "recent" = original order
  }, [data.painPoints, sort]);

  const selectedPain = useMemo(
    () => data.painPoints.find(p => p.id === selectedId) ?? null,
    [data.painPoints, selectedId]
  );

  const severityCounts = useMemo(() => ({
    high: data.painPoints.filter(p => p.severity === "high").length,
    medium: data.painPoints.filter(p => p.severity === "medium").length,
    low: data.painPoints.filter(p => p.severity === "low").length,
  }), [data.painPoints]);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    data.painPoints.forEach(p => p.categories.forEach(c => { counts[c] = (counts[c] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [data.painPoints]);

  const topPain = useMemo(() =>
    [...data.painPoints].sort((a, b) => b.frequency - a.frequency)[0],
    [data.painPoints]
  );

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-8">

        {/* Back link */}
        <Link
          href="/dashboard"
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

        {/* Insights Summary */}
        <div className="flex flex-col gap-3">
          {/* Severity distribution + top categories */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-4">
            {/* Severity bar */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Severity distribution
              </span>
              <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5">
                {severityCounts.high > 0 && (
                  <div
                    className="bg-red-500 rounded-l-full"
                    style={{ flexGrow: severityCounts.high }}
                  />
                )}
                {severityCounts.medium > 0 && (
                  <div
                    className="bg-orange-500"
                    style={{ flexGrow: severityCounts.medium }}
                  />
                )}
                {severityCounts.low > 0 && (
                  <div
                    className="bg-yellow-500 rounded-r-full"
                    style={{ flexGrow: severityCounts.low }}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" />
                  High ({severityCounts.high})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500" />
                  Medium ({severityCounts.medium})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-500" />
                  Low ({severityCounts.low})
                </span>
              </div>
            </div>

            {/* Top categories */}
            {topCategories.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Top themes
                </span>
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {topCategories.map(([cat, count]) => (
                    <span
                      key={cat}
                      className="shrink-0 inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full px-3 py-1 text-sm"
                    >
                      {cat}
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* #1 Pain spotlight */}
          {topPain && (
            <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-5 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-orange-500 dark:text-orange-400">
                #1 Most Reported Pain
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex-1 min-w-0">
                  {topPain.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
                    {topPain.frequency}×
                  </span>
                  <span className={`h-2.5 w-2.5 rounded-full ${topPain.severity === "high" ? "bg-red-500" : topPain.severity === "medium" ? "bg-orange-500" : "bg-yellow-500"}`} />
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">{topPain.severity}</span>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed line-clamp-2">
                &ldquo;{topPain.topQuote}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Sort by</span>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequency">Frequency</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: single column accordion list */}
        <div key={`mobile-${sort}`} className="md:hidden flex flex-col gap-3">
          {sorted.map((pain, i) => (
            <div key={pain.id} className="animate-fade-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <PainPointCard pain={pain} />
            </div>
          ))}
        </div>

        {/* Desktop: two-column split panel */}
        <div className="hidden md:flex gap-6 items-start">
          {/* Left: compact card list */}
          <div key={`desktop-${sort}`} className="w-[380px] shrink-0 flex flex-col gap-3">
            {sorted.map((pain, i) => (
              <div key={pain.id} className="animate-fade-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <PainPointCard
                  pain={pain}
                  isSelected={selectedId === pain.id}
                  onSelect={() => setSelectedId(pain.id)}
                />
              </div>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 min-w-0">
            {selectedPain ? (
              <DetailPanel pain={selectedPain} />
            ) : (
              <div className="sticky top-8 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center h-48 text-sm text-zinc-400">
                Select a pain point to see details
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function DetailPanel({ pain }: { pain: PainPoint }) {
  return (
    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 flex-wrap">
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex-1 min-w-0 leading-snug">
            {pain.title}
          </span>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
              {pain.frequency}×
            </span>
            <span className={`h-2.5 w-2.5 rounded-full ${SEVERITY_DOT[pain.severity]}`} />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">
              {pain.severity}
            </span>
          </div>
        </div>
        <p className="text-sm italic text-zinc-500 dark:text-zinc-400 leading-relaxed">
          &ldquo;{pain.topQuote}&rdquo;
        </p>
        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          {pain.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100 dark:border-zinc-800" />

      {/* AI Summary */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          AI Summary
        </span>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {pain.aiSummary}
        </p>
      </div>

      {/* Supporting posts */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Supporting posts
        </h4>
        {pain.posts.map((post: RedditPost, i: number) => (
          <a
            key={i}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
          >
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5 tabular-nums">
              ↑{post.upvotes}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {post.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                {post.excerpt}
              </p>
            </div>
            <svg
              className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
