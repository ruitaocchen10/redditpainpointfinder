"use client";

import { useState, KeyboardEvent, useRef } from "react";

interface SubredditChipInputProps {
  onChipsChange?: (chips: string[]) => void;
}

const MAX_CHIPS = 5;
const SUBREDDIT_RE = /^[a-zA-Z0-9_]{2,21}$/;

export default function SubredditChipInput({ onChipsChange }: SubredditChipInputProps) {
  const [chips, setChips] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addChip = (raw: string) => {
    const name = raw.replace(/^r\//, "").trim();
    if (!SUBREDDIT_RE.test(name)) return;
    if (chips.includes(name)) return;
    if (chips.length >= MAX_CHIPS) return;
    const next = [...chips, name];
    setChips(next);
    onChipsChange?.(next);
    setValue("");
  };

  const removeChip = (name: string) => {
    const next = chips.filter((c) => c !== name);
    setChips(next);
    onChipsChange?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === ",") {
      e.preventDefault();
      addChip(value);
    } else if (e.key === "Backspace" && value === "" && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
  };

  const atLimit = chips.length >= MAX_CHIPS;

  return (
    <div
      className="rounded-md border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 px-4 py-3 min-h-[60px] flex flex-wrap gap-2 items-center cursor-text focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-0"
      onClick={() => inputRef.current?.focus()}
    >
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/30 px-2.5 py-0.5 text-sm font-medium text-orange-700 dark:text-orange-300"
        >
          r/{chip}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeChip(chip); }}
            className="ml-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5 leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
            aria-label={`Remove r/${chip}`}
          >
            ×
          </button>
        </span>
      ))}

      {!atLimit && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (value) addChip(value); }}
          placeholder={chips.length === 0 ? "e.g. startups, SaaS, productivity" : "Add subreddit…"}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
        />
      )}

      <span className={`ml-auto text-xs ${atLimit ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}`}>
        ({chips.length}/{MAX_CHIPS})
      </span>
    </div>
  );
}
