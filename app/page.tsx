import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Nav */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight">RedditPains</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            Built for indie hackers &amp; founders
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Find what Reddit
            <br />
            <span className="text-orange-600">really complains about</span>
          </h1>

          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
            Turn hours of Reddit scrolling into a 60-second structured report of real user
            pain points. Validate startup ideas and understand your target audience — fast.
          </p>

          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base px-8 h-12 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Get started for free
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Free plan available · No credit card required
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-20 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              ),
              title: "Reddit-native research",
              body: "Searches the subreddits your audience lives in, not curated review sites.",
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              ),
              title: "LLM-powered analysis",
              body: "Claude clusters raw complaints into structured, actionable pain points.",
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: "Validated insights",
              body: "Every pain point is backed by real Reddit posts you can drill into.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col gap-3"
            >
              <div className="w-9 h-9 rounded-md bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                {f.icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
