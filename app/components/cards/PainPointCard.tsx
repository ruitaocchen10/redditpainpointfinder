"use client";

import { useState } from "react";

export interface RedditPost {
  title: string;
  upvotes: number;
  excerpt: string;
  url: string;
}

export interface PainPoint {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  frequency: number;
  topQuote: string;
  categories: string[];
  aiSummary: string;
  posts: RedditPost[];
}

const SEVERITY_DOT: Record<PainPoint["severity"], string> = {
  high: "bg-red-500",
  medium: "bg-orange-500",
  low: "bg-yellow-500",
};

export default function PainPointCard({ pain }: { pain: PainPoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        {/* Severity dot */}
        <span
          className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${SEVERITY_DOT[pain.severity]}`}
        />

        <div className="flex-1 min-w-0">
          {/* Title + frequency + chevron */}
          <div className="flex items-center gap-2 justify-between">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {pain.title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
                {pain.frequency}×
              </span>
              <svg
                className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Top quote */}
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic">
            &ldquo;{pain.topQuote}&rdquo;
          </p>

          {/* Category chips */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pain.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 pb-5 pt-4 flex flex-col gap-4">
          {/* AI Summary */}
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {pain.aiSummary}
          </p>

          {/* Supporting posts */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Supporting posts
            </h4>
            {pain.posts.map((post, i) => (
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
      )}
    </div>
  );
}
