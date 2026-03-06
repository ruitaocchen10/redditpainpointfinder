"use client";

import { useEffect, useRef, useState } from "react";
import ResultsView, { ResultData } from "./ResultsView";

type AnalysisStatus = "pending" | "fetching" | "analyzing" | "completed" | "failed";

const STEPS: { status: AnalysisStatus[]; label: string; description: string }[] = [
  {
    status: ["pending"],
    label: "Queuing",
    description: "Setting up your analysis…",
  },
  {
    status: ["fetching"],
    label: "Fetching posts",
    description: "Pulling top posts from Reddit…",
  },
  {
    status: ["analyzing"],
    label: "Analyzing",
    description: "Claude is clustering pain points…",
  },
  {
    status: ["completed"],
    label: "Done",
    description: "Results ready!",
  },
];

function getStepIndex(status: AnalysisStatus): number {
  return STEPS.findIndex((s) => s.status.includes(status));
}

interface PollingViewProps {
  analysisId: string;
  initialStatus: AnalysisStatus;
}

export default function PollingView({
  analysisId,
  initialStatus,
}: PollingViewProps) {
  const [status, setStatus] = useState<AnalysisStatus>(initialStatus);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevStepIndexRef = useRef(getStepIndex(initialStatus));

  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    async function poll() {
      try {
        const res = await fetch(`/api/analyses/${analysisId}`);
        if (!res.ok) return;
        const json = await res.json();

        setStatus(json.status);

        if (json.status === "completed" && json.data) {
          setResultData(json.data);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (json.status === "failed") {
          setErrorMessage(json.error ?? "Analysis failed. Please try again.");
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // silently ignore network errors; keep polling
      }
    }

    poll(); // immediate first poll
    intervalRef.current = setInterval(poll, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [analysisId, status]);

  const currentStepIndex = getStepIndex(status);

  useEffect(() => {
    if (currentStepIndex > prevStepIndexRef.current) {
      setJustCompletedStep(prevStepIndexRef.current);
      prevStepIndexRef.current = currentStepIndex;
      const t = setTimeout(() => setJustCompletedStep(null), 700);
      return () => clearTimeout(t);
    }
    prevStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  if (status === "completed" && resultData) {
    return <ResultsView data={resultData} />;
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full mx-auto px-8 py-12 text-center flex flex-col gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 mx-auto">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
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
          </div>
          <h2 className="text-xl font-semibold">Analysis failed</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {errorMessage ?? "Something went wrong. Please try again from the dashboard."}
          </p>
          <a
            href="/dashboard"
            className="mt-2 inline-flex items-center justify-center h-10 px-5 rounded-full bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-zinc-900 dark:text-zinc-100">
      <div className="max-w-sm w-full mx-auto px-8 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold">Analyzing your subreddits</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This usually takes 30–90 seconds depending on post volume.
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex flex-col gap-0">
          {STEPS.filter((s) => !s.status.includes("completed")).map(
            (step, i) => {
              const isDone = currentStepIndex > i;
              const isActive = currentStepIndex === i;

              return (
                <div key={i} className="flex gap-4">
                  {/* Connector line + icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone
                          ? "border-orange-500 bg-orange-500"
                          : isActive
                          ? "border-orange-500 bg-white dark:bg-zinc-900"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      {isDone && i === justCompletedStep && (
                        <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75" />
                      )}
                      {isDone ? (
                        <svg
                          className="h-4 w-4 text-white"
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
                      ) : isActive ? (
                        <svg
                          className="h-4 w-4 animate-spin text-orange-500"
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
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                      )}
                    </div>
                    {i < STEPS.filter((s) => !s.status.includes("completed")).length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[24px] transition-colors ${
                          isDone
                            ? "bg-orange-500"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="pb-6 pt-1 flex flex-col gap-0.5">
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : isDone
                          ? "text-zinc-500 dark:text-zinc-400"
                          : "text-zinc-400 dark:text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {step.description}
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
