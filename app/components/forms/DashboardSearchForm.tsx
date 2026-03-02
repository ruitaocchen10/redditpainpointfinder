"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubredditChipInput from "./SubredditChipInput";

export default function DashboardSearchForm() {
  const router = useRouter();
  const [chips, setChips] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [postLimit, setPostLimit] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyse = chips.length > 0 && !isValidating && !submitting;

  async function handleAnalyse() {
    if (!canAnalyse) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddits: chips,
          timeRange,
          postLimit: parseInt(postLimit, 10),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      const { id } = await res.json();
      router.push(`/results/${id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm flex flex-col gap-4">
      <SubredditChipInput
        onChipsChange={setChips}
        onValidatingChange={setIsValidating}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Secondary filters + Analyse */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
            <option value="all">All time</option>
          </select>

          <select
            value={postLimit}
            onChange={(e) => setPostLimit(e.target.value)}
            className="h-10 rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
          >
            <option value="50">50 posts</option>
            <option value="100">100 posts</option>
            <option value="250">250 posts</option>
            <option value="500">500 posts</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          className="bg-orange-600 dark:bg-orange-500 text-white h-11 px-7 rounded-full text-base font-semibold transition-all duration-200 hover:bg-orange-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 dark:hover:shadow-orange-400/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none inline-flex items-center gap-2"
        >
          {submitting && (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {submitting ? "Starting…" : "Analyse"}
        </button>
      </div>

      <button
        type="button"
        className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 w-fit transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
      >
        + Advanced options
      </button>
    </div>
  );
}
