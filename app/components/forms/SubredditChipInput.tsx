"use client";

import { useState, KeyboardEvent, useRef, useCallback, useEffect } from "react";

interface SubredditChipInputProps {
  onChipsChange?: (chips: string[]) => void;
  onValidatingChange?: (isValidating: boolean) => void;
}

type ChipState = "validating" | "valid" | "invalid";

const MAX_CHIPS = 5;
const SUBREDDIT_RE = /^[a-zA-Z0-9_]{2,21}$/;

export default function SubredditChipInput({
  onChipsChange,
  onValidatingChange,
}: SubredditChipInputProps) {
  const [chips, setChips] = useState<string[]>([]);
  const [chipStates, setChipStates] = useState<Map<string, ChipState>>(
    new Map()
  );
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const getValidChips = useCallback(
    (cs: Map<string, ChipState>, allChips: string[]) =>
      allChips.filter((c) => cs.get(c) === "valid"),
    []
  );

  const getIsValidating = useCallback(
    (cs: Map<string, ChipState>, allChips: string[]) =>
      allChips.some((c) => {
        const s = cs.get(c);
        return s === "validating" || s === "invalid";
      }),
    []
  );

  const updateStates = useCallback(
    (newChips: string[], newStates: Map<string, ChipState>) => {
      setChips(newChips);
      setChipStates(newStates);
    },
    []
  );

  useEffect(() => {
    onChipsChange?.(getValidChips(chipStates, chips));
    onValidatingChange?.(getIsValidating(chipStates, chips));
  }, [chips, chipStates, onChipsChange, onValidatingChange, getValidChips, getIsValidating]);

  const addChip = useCallback(
    async (raw: string) => {
      const name = raw.replace(/^r\//, "").trim();
      if (!SUBREDDIT_RE.test(name)) return;
      if (chips.includes(name)) return;
      if (chips.length >= MAX_CHIPS) return;

      const newChips = [...chips, name];
      const newStates = new Map(chipStates);
      newStates.set(name, "validating");
      updateStates(newChips, newStates);
      setValue("");

      try {
        const res = await fetch(
          `/api/subreddit/check?name=${encodeURIComponent(name)}`
        );
        const json = await res.json();

        setChipStates((currentStates) => {
          if (!currentStates.has(name)) return currentStates; // chip was removed while validating
          const next = new Map(currentStates);
          if (json.exists) {
            next.set(name, "valid");
          } else {
            next.set(name, "invalid");
            setTimeout(() => {
              setChips((c) => c.filter((x) => x !== name));
              setChipStates((cs) => {
                const ns = new Map(cs);
                ns.delete(name);
                return ns;
              });
            }, 1500);
          }
          return next;
        });
      } catch {
        // On network error, assume valid to not block the user
        setChipStates((cs) => {
          const next = new Map(cs);
          if (next.has(name)) next.set(name, "valid");
          return next;
        });
      }
    },
    [chips, chipStates, updateStates]
  );

  const removeChip = useCallback(
    (name: string) => {
      const newChips = chips.filter((c) => c !== name);
      const newStates = new Map(chipStates);
      newStates.delete(name);
      updateStates(newChips, newStates);
    },
    [chips, chipStates, updateStates]
  );

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
      {chips.map((chip) => {
        const state = chipStates.get(chip) ?? "valid";
        return (
          <span
            key={chip}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium transition-colors ${
              state === "validating"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                : state === "invalid"
                ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                : "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300"
            }`}
          >
            {state === "validating" ? (
              <svg
                className="h-3 w-3 animate-spin shrink-0"
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
            ) : state === "invalid" ? (
              <svg
                className="h-3 w-3 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : null}
            r/{chip}
            {state === "invalid" && (
              <span className="text-xs opacity-75">not found</span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChip(chip);
              }}
              className="ml-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5 leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
              aria-label={`Remove r/${chip}`}
            >
              ×
            </button>
          </span>
        );
      })}

      {!atLimit && (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (value) addChip(value);
          }}
          placeholder={
            chips.length === 0
              ? "e.g. startups, SaaS, productivity"
              : "Add subreddit…"
          }
          className="flex-1 min-w-[140px] bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
        />
      )}

      <span
        className={`ml-auto text-xs ${
          atLimit
            ? "text-amber-500 dark:text-amber-400"
            : "text-zinc-400 dark:text-zinc-500"
        }`}
      >
        ({chips.length}/{MAX_CHIPS})
      </span>
    </div>
  );
}
