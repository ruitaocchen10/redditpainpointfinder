"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubredditChipInput from "./SubredditChipInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export default function DashboardSearchForm() {
  const router = useRouter();
  const [chips, setChips] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [postLimit, setPostLimit] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minUpvotes, setMinUpvotes] = useState("2");
  const [keywordFilter, setKeywordFilter] = useState("");
  const [excludeKeywords, setExcludeKeywords] = useState("");

  const canAnalyse =
    chips.length > 0 && !isValidating && !submitting && !success;

  async function handleAnalyse() {
    if (!canAnalyse) return;
    setSubmitting(true);
    setError(null);

    const parseKeywords = (raw: string) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddits: chips,
          timeRange,
          postLimit: parseInt(postLimit, 10),
          minUpvotes: parseInt(minUpvotes, 10),
          keywordFilter: parseKeywords(keywordFilter),
          excludeKeywords: parseKeywords(excludeKeywords),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      const { id } = await res.json();
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 350));
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
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={postLimit} onValueChange={setPostLimit}>
            <SelectTrigger className="h-10 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 posts</SelectItem>
              <SelectItem value="100">100 posts</SelectItem>
              <SelectItem value="250">250 posts</SelectItem>
              <SelectItem value="500">500 posts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          className={`text-white h-11 px-7 rounded-full text-base font-semibold transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center gap-2 ${
            success
              ? "bg-green-600 dark:bg-green-500 focus-visible:ring-green-500 scale-95"
              : "bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/40 dark:hover:shadow-orange-400/30 focus-visible:ring-orange-500 disabled:opacity-50 disabled:hover:shadow-none"
          }`}
        >
          {success ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Done!
            </>
          ) : submitting ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
              Starting…
            </>
          ) : (
            "Analyse"
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="cursor-pointer text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 w-fit transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
      >
        {showAdvanced ? "− Advanced options" : "+ Advanced options"}
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Min. upvotes
              </label>
              <Select value={minUpvotes} onValueChange={setMinUpvotes}>
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (any)</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Keyword filter
              </label>
              <input
                type="text"
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                placeholder="saas, pricing, slow…"
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Exclude keywords
              </label>
              <input
                type="text"
                value={excludeKeywords}
                onChange={(e) => setExcludeKeywords(e.target.value)}
                placeholder="hiring, meta, ama…"
                className="h-9 rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
