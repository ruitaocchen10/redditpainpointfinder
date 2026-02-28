"use client";

import { useEffect, useRef, useState } from "react";

interface ProfileDropdownProps {
  compact?: boolean;
}

export default function ProfileDropdown({ compact = false }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={
          "absolute bottom-full left-0 mb-1 z-40 transition-all duration-150 origin-bottom " +
          (compact ? "w-56" : "right-0") +
          " " +
          (open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none")
        }
      >
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
          <div className="px-3 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">U</span>
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">user@example.com</span>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          <button
            type="button"
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={compact ? "Account" : undefined}
        aria-label={compact ? "Account" : undefined}
        className={
          "rounded-md py-2 w-full text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 flex items-center " +
          (compact ? "justify-center px-2" : "gap-2.5 px-3")
        }
      >
        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">U</span>
        </div>
        {!compact ? (
          <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate">user@example.com</span>
        ) : null}
      </button>
    </div>
  );
}
