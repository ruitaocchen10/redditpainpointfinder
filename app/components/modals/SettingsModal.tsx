"use client";

import { useEffect } from "react";
import { useTheme } from "../providers/ThemeProvider";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { preference, setPreference } = useTheme();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-900/60" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Appearance */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Appearance</p>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((opt) => (
              <label key={opt} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="appearance"
                  value={opt}
                  checked={preference === opt}
                  onChange={() => setPreference(opt)}
                  className="sr-only peer"
                />
                <div className="flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 peer-checked:border-orange-500 peer-checked:text-orange-600 dark:peer-checked:text-orange-400 transition-colors capitalize">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Account */}
        <div className="px-5 py-4 flex flex-col gap-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Account</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">user@example.com</p>
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Plan */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Plan</p>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Free · 2 of 3 searches used</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full w-2/3 bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            className="self-start bg-orange-600 dark:bg-orange-500 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
