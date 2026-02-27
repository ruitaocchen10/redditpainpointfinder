# UI/UX Specification — Reddit Pain Point Finder

**Version:** 2.0
**Date:** 2026-02-27
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Geist fonts

---

## 1. Product Overview

### Purpose
Reddit Pain Point Finder surfaces recurring complaints, frustrations, and unmet needs from Reddit communities. Users enter a topic or subreddit, and the app returns an AI-analysed digest of what people are struggling with — ranked by frequency and sentiment.

### Target Users
- **Indie hackers / founders** validating product ideas
- **Product managers** doing competitive and market research
- **Researchers** studying community-reported problems

### Core Value Proposition
Turn hours of manual Reddit scrolling into a 60-second structured report of real user pain points, complete with source links.

### Key Interactions (summary)
1. Enter one or more subreddit names (up to 5)
2. Optionally filter by time range and post count
3. View ranked list of pain point clusters
4. Drill into a cluster to see supporting Reddit posts
5. Save analyses and revisit them from the Dashboard
6. Export results as CSV, Markdown, or JSON

---

## 2. Information Architecture

```
/                         ← Landing / Home (search form, hero)
/analysis                 ← Analysis in-progress (polling state)
/results                  ← Results list (pain point clusters)
/results/[id]             ← Pain point detail (supporting posts)
/dashboard                ← Saved analyses (authenticated users)
```

> **Note:** `/analysis` and `/results` may be merged into a single route if the analysis is fast enough (< 5 s), using local state to toggle between skeleton and results. Keep separate routes if analysis is async/long-running so users can bookmark or share result URLs.

### Navigation Model
- **Unauthenticated:** No persistent nav bar. Each page provides its own contextual back action. Header is minimal: app name/logo (links to `/`) + optional theme toggle.
- **Authenticated:** Persistent `Header` across all pages. Header displays app logo/name (links to `/`), a **Dashboard** link (links to `/dashboard`), user avatar menu, and optional theme toggle.
- `Header` receives an `authenticated: boolean` prop to switch between the two variants.

---

## 3. User Flows

### 3.1 Primary Flow — Happy Path

```
Landing (/)
  │
  ├─ User types subreddit names into chip input (e.g. r/productivity, r/nocode)
  ├─ (Optional) Sets time range, post limit
  └─ Clicks "Analyse"
       │
       ▼
Analysis (/analysis)
  │
  ├─ Progress indicator visible
  ├─ Label shows "r/productivity, r/nocode" (all subreddits)
  ├─ Estimated time shown (e.g. "~20 seconds")
  └─ Analysis completes
       │
       ▼
Results (/results?q=…)
  │
  ├─ Pain point clusters listed, ranked by frequency
  ├─ Each cluster shows: title, frequency badge, sentiment chip, excerpt, SourceBadge chips
  ├─ SavedIndicator row confirms auto-save status
  └─ User clicks a cluster
       │
       ▼
Detail (/results/[id])
  │
  ├─ Full description of the pain point
  ├─ SourceBadge row showing contributing subreddits
  ├─ Supporting Reddit posts (title, score, link, relevant excerpt)
  └─ "Back to results" link
```

### 3.2 Error Flow — API / Network Failure

```
Analysis (/analysis)
  └─ Request fails
       │
       ▼
Inline error state on /analysis
  ├─ Error message (human-readable)
  ├─ "Try again" button (retries same query)
  └─ "Edit search" link (back to /)
```

### 3.3 Empty Results Flow

```
Results (/results)
  └─ No pain points found
       │
       ▼
Empty state on /results
  ├─ Illustration / icon
  ├─ "No pain points found for '[query]'"
  ├─ Suggestions: broaden query, try different subreddit
  └─ "Search again" button (back to /)
```

### 3.4 Dashboard Flow

```
Dashboard (/dashboard)   ← requires authentication
  │
  ├─ Grid of AnalysisCards (up to 12 per page)
  │
  ├─ User clicks [View] on a card
  │     └─ Navigates to /results?savedId=[id]
  │
  ├─ User clicks [Re-run] on a card
  │     └─ Pre-fills landing chip input with saved subreddits
  │        via query params → /? subreddits=r/X,r/Y
  │
  ├─ User clicks [⋯] overflow menu
  │     ├─ "Rename" → inline AnalysisTitleInput (blur saves, Escape cancels)
  │     └─ "Delete" → DeleteConfirmPopover appears
  │           ├─ [Cancel] → closes popover, no change
  │           └─ [Delete] → card removed, success toast shown
  │
  ├─ User types in DashboardFilterBar search
  │     └─ Client-side filter by title / subreddits
  │
  ├─ User changes sort dropdown
  │     └─ Client-side re-sort (Newest / Oldest / Most pain points / Fewest)
  │
  └─ "Load more" button
        └─ Fetches next 12 analyses (appended to grid)
```

**Empty state:** When no saved analyses exist, show an illustration with the message "No saved analyses yet" and a CTA button linking to `/`.

### 3.5 Auto-Save Flow

```
Results (/results)
  │
  ├─ Backend auto-saves completed analysis on job completion
  │
  ├─ SavedIndicator polls for confirmation
  │     ├─ State: "saving…" (spinner)
  │     ├─ State: "Saved" (checkmark + relative timestamp)
  │     ├─ State: "Failed to save" (warning icon + retry link)
  │     └─ State: "stale" (when revisiting via ?savedId= and data may be outdated)
  │
  └─ On retry: SavedIndicator returns to "saving…" state
```

**Session-only fallback:** If the user is unauthenticated, SavedIndicator is hidden. Results are accessible via URL during the session but are not persisted to the Dashboard.

**Stale state:** When a user navigates to `/results?savedId=[id]`, the SavedIndicator shows a "stale" badge if the underlying subreddit data has been refreshed since the save.

### 3.6 Multi-Subreddit Search Flow

```
Landing (/)
  │
  ├─ User types "productivity" + Enter → chip added: [r/productivity ×]
  ├─ User types "nocode" + comma  → chip added: [r/nocode ×]
  ├─ User adds up to 5 chips total; counter shows "(3/5)"
  │     └─ At 5 chips: input is disabled, counter turns amber "(5/5)"
  │
  └─ Clicks "Analyse"
       │
       ▼
Analysis (/analysis)
  │
  ├─ Progress label: "Analysing r/productivity, r/nocode…"
  └─ On partial failure (one subreddit 404s):
       └─ PartialFailureBanner shown on /results:
             "r/badsubreddit could not be fetched. Results show data from r/productivity only."
             [Dismiss]
```

**Aggregated results:** PainPointCards and PostCards show `SourceBadge` chips indicating which subreddits contributed to each cluster. Filter dropdown gains a "By subreddit" group when more than one subreddit was searched.

### 3.7 Export Flow

```
Results (/results)
  │
  ├─ User clicks [Export ▾] ghost button in controls row
  │     └─ ExportDropdown opens with three options:
  │           ├─ CSV          — spreadsheet-friendly, one row per pain point
  │           ├─ Markdown     — formatted report, one ## section per cluster
  │           └─ JSON         — raw structured data for developers
  │
  └─ User selects a format
        └─ File generated (client-side or server-side)
             └─ Download triggered via Blob URL (revoked after download)
                  Filename pattern: redditpains-[subreddit]-[YYYY-MM-DD].[ext]
                  e.g. redditpains-productivity-2026-02-27.csv
```

**Disabled state:** `ExportButton` is disabled (greyed out, `aria-disabled="true"`) while results are not yet fully loaded.

---

## 4. Page Specifications

### 4.1 Landing / Home Page (`/`)

**Goal:** Communicate the tool's purpose and make it trivially easy to start a search with one or more subreddits.

**Layout (unauthenticated):**

```
┌─────────────────────────────────────────────────────────┐
│  [Logo / App Name]                         [Theme ◐]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           Reddit Pain Point Finder                      │  ← h1, centred
│                                                         │
│   Discover what your target audience complains about    │  ← subtitle
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [r/productivity ×] [r/nocode ×] productivity▌    │   │  ← SubredditChipInput
│  │                                          (2/5)   │   │     chips + live input
│  └──────────────────────────────────────────────────┘   │
│                                              ┌────────┐  │
│                                              │Analyse │  │  ← primary CTA
│                                              └────────┘  │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────────────┐ │
│  │  Time range ▾      │  │  Max posts ▾               │ │  ← secondary row
│  └────────────────────┘  └────────────────────────────┘ │
│  [+ Advanced options]                                   │  ← toggle (collapsed)
│                                                         │
│  ─────────────────── OR ───────────────────            │
│                                                         │
│  Recent searches:  [r/startups ×]  [productivity ×]    │  ← only if history exists
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Layout (authenticated header variant):**

```
┌─────────────────────────────────────────────────────────┐
│  [Logo / App Name]   [Dashboard]         [Avatar ▾] [◐] │  ← authenticated header
├─────────────────────────────────────────────────────────┤
│  … (same body as above)                                 │
└─────────────────────────────────────────────────────────┘
```

**SubredditChipInput states:**
- **default** — placeholder text "e.g. productivity, SaaS, nocode"
- **focused** — blue outline; cursor in text area
- **chip-present** — one or more `SubredditChip` items rendered before the cursor
- **at-limit** — text input hidden; counter turns amber `(5/5)`; chip input shows tooltip "Maximum 5 subreddits"
- **chip-invalid** — invalid chip rendered in red with ⚠ icon before auto-removal

**Validation:**
- Subreddit names must match `/^[a-zA-Z0-9_]{2,21}$/`
- Duplicates are rejected silently (no chip added, no error shown)
- Input trimmed of leading `r/` prefix before validation
- Paste: split on commas and/or whitespace; each segment validated individually; invalid segments shown as a single consolidated error toast ("3 invalid subreddits were ignored")
- Analyse button disabled if chip input is empty

---

### 4.2 Analysis In-Progress Page (`/analysis`)

**Goal:** Keep the user informed that work is happening; prevent abandon.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]                              [Theme ◐]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ◌  (spinner)                         │
│                                                         │
│           Analysing r/productivity, r/nocode            │  ← subreddit chips echoed
│                                                         │
│           Fetching Reddit posts…                        │  ← step label (updates)
│                                                         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░  40%             │  ← progress bar
│                                                         │
│           Usually takes 15–30 seconds                   │  ← expectation
│                                                         │
│                                                         │
│  ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ── ──    │  ← skeleton cards
│  ── ── ── ── ── ─                                       │     foreshadow results
│  ── ── ── ── ── ── ── ── ── ── ── ──                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Progress steps (label updates as each completes):**
1. Fetching Reddit posts…
2. Filtering relevant content…
3. Clustering pain points…
4. Ranking results…

**Error state (replaces progress):**

```
│                    ⚠                                    │
│                                                         │
│           Something went wrong                         │
│   Could not fetch posts for "productivity tools"        │
│                                                         │
│        [Try again]          [Edit search]               │
```

---

### 4.3 Results Page (`/results`)

**Goal:** Present clustered pain points clearly; support quick scanning and drilling in.

**Layout (desktop, ≥ 768 px):**

```
┌─────────────────────────────────────────────────────────┐
│  [← New search]    "r/productivity, r/nocode" [Theme ◐] │
├─────────────────────────────────────────────────────────┤
│  12 pain points · r/productivity · r/nocode · 3 months  │  ← summary bar
├─────────────────────────────────────────────────────────┤
│  ✓ Saved  2 minutes ago                                 │  ← SavedIndicator row
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sort by: [Frequency ▾]  Filter: [All ▾]  [Export ▾]   │  ← controls row
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  🔴  Overwhelming notification volume       47× │    │  ← pain point card
│  │      "There's no good way to manage…"           │    │
│  │      [Frustration]  [Productivity]              │    │
│  │      [r/productivity]  [r/nocode]               │    │  ← SourceBadge chips
│  │                                        View →   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🟠  Poor cross-platform sync               31× │    │
│  │      "Every time I switch from phone to…"       │    │
│  │      [Frustration]  [Sync]                      │    │
│  │      [r/productivity]                           │    │  ← SourceBadge (1 source)
│  │                                        View →   │    │
│  └─────────────────────────────────────────────────┘    │
│  … (more cards)                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Pain point card anatomy:**
- Severity dot: red (high), orange (medium), yellow (low) — based on post frequency and negative sentiment ratio
- Title: concise label for the cluster (AI-generated)
- Frequency badge: `N×` (number of posts in cluster)
- Quote: most representative excerpt from the posts
- Tags: category chips (2–3 max)
- `SourceBadge` chips: indigo-coloured `r/name` pills; if more than 3 sources, show first 2 + `+N more` (`SourceBadgePill`)
- "View →" link: navigates to detail page

**SavedIndicator states:**
- `saving` — spinner + "Saving…"
- `saved` — ✓ icon + "Saved [relative timestamp]" (e.g. "2 minutes ago"); timestamp refreshes every 60 s
- `failed` — ⚠ icon + "Failed to save" + "Retry" link
- `stale` — ⏱ icon + "Data may be outdated" (shown when viewing via `?savedId=`)

**Sort options:** Frequency (default), Sentiment score, Most recent

**Filter options:**
- All
- High severity only
- By category (if categories available)
- **By subreddit** (multi-select group; only shown when more than one subreddit was searched)

**Export dropdown anatomy:**

| Option | Description |
|--------|-------------|
| CSV | Spreadsheet-friendly; one row per pain point |
| Markdown | Formatted report; one `##` section per cluster |
| JSON | Raw structured data for developers |

**CSV column spec:** `title`, `severity`, `frequency`, `categories`, `quote`, `post_count`, `subreddits`

**Markdown report structure:**
```
# Pain Point Report — r/[subreddit] — [date]

## [Cluster title]
**Severity:** High · **Frequency:** 47×
**Subreddits:** r/productivity, r/nocode

> "[representative quote]"

[AI summary paragraph]

---
```

**Mobile layout (< 768 px):** Cards go full-width; sort/filter/export controls collapse into a bottom sheet triggered by a filter icon button.

**Empty state:**

```
│                    🔍                                   │
│                                                         │
│        No pain points found for                         │
│        "r/productivity"                                 │
│                                                         │
│   Try a broader topic, a different subreddit,           │
│   or a longer time range.                               │
│                                                         │
│              [Search again]                             │
```

---

### 4.4 Pain Point Detail (`/results/[id]`)

**Goal:** Show the evidence (actual Reddit posts) behind a single pain point cluster.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  [← Back to results]                    [Theme ◐]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔴  Overwhelming notification volume                   │  ← h1
│                                                         │
│  47 posts  ·  High severity  ·  Frustration / UX        │  ← meta row
│                                                         │
│  [r/productivity]  [r/nocode]                           │  ← SourceBadge row
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Summary                                        │    │  ← AI summary card
│  │                                                 │    │
│  │  Users consistently report being overwhelmed    │    │
│  │  by notification volume with no granular…       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Supporting posts (47)                                  │  ← section header
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  ↑ 342  How do you all deal with the constant   │    │  ← post card
│  │         notification spam in [app name]?        │    │
│  │                                                 │    │
│  │  "…I've tried everything but there's no way…"  │    │
│  │  [r/productivity]              [Open on Reddit ↗]   │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  … (more post cards, paginated)                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Post card anatomy:**
- Upvote score (with ↑ icon)
- Post title
- Relevant excerpt (the sentence(s) that matched the cluster)
- `SourceBadge` chip indicating which subreddit the post came from
- "Open on Reddit" external link (opens in new tab, `rel="noopener noreferrer"`)

**SourceBadge row** (below meta line): shown for multi-subreddit analyses; lists the subreddits that contributed posts to this specific cluster. Hidden for single-subreddit analyses.

**Pagination:** Show first 10 posts; "Load more" button (not infinite scroll — avoids accidental scroll-past).

---

### 4.5 Dashboard (`/dashboard`)

**Goal:** Let authenticated users revisit, manage, and re-run past analyses.

**Layout (desktop, ≥ 768 px):**

```
┌─────────────────────────────────────────────────────────┐
│  [Logo / App Name]   [Dashboard]         [Avatar ▾] [◐] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  My Analyses                          [+ New Analysis]  │  ← page header
│                                                         │
│  ┌─────────────────────────────────┐                    │
│  │ 🔍 Search analyses…  Sort: [▾]  │                    │  ← DashboardFilterBar
│  └─────────────────────────────────┘                    │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ [r/productivity]│  │ [r/nocode]      │              │  ← AnalysisCard grid
│  │ [r/nocode]      │  │                 │              │     2-col (md), 3-col (lg+)
│  │                 │  │ Productivity    │              │
│  │ SaaS Pain Pts   │  │ Pain Themes     │              │  ← editable title
│  │ 12 pain points  │  │ 8 pain points   │              │
│  │ Feb 27, 2026    │  │ Feb 26, 2026    │              │
│  │ [View] [Re-run] │  │ [View] [Re-run] │              │
│  │              [⋯]│  │              [⋯]│              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ …               │  │ …               │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│                    [Load more]                          │  ← pagination CTA
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**AnalysisCard anatomy:**
- Subreddit pills (`SourceBadgePill` row, max 3 visible + `+N more`)
- Editable title (`AnalysisTitleInput` when in renaming state)
- Pain point count (e.g. "12 pain points")
- Date of analysis (e.g. "Feb 27, 2026")
- `[View]` button — navigates to `/results?savedId=[id]`
- `[Re-run]` button — navigates to `/?subreddits=r/X,r/Y` (pre-fills chip input)
- `[⋯]` overflow menu (`OverflowMenu`) — contains "Rename" and "Delete"

**AnalysisCard states:**

| State | Description |
|-------|-------------|
| default | Normal card with shadow |
| hover | Elevated shadow; action buttons become more prominent |
| renaming | Title replaced by `AnalysisTitleInput`; blur saves; Escape cancels |
| deleting | Card fades to 50% opacity while delete request is in-flight |
| delete-confirm | `DeleteConfirmPopover` overlays the card: "Delete this analysis?" [Cancel] [Delete] |

**Empty state:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                      📊                                 │
│                                                         │
│            No saved analyses yet                        │
│                                                         │
│   Run your first analysis to see it here.               │
│                                                         │
│              [Start your first analysis →]              │  ← links to /
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**DashboardFilterBar:**
- Text search input: client-side filter by analysis title and subreddit names
- Sort dropdown: Newest (default) / Oldest / Most pain points / Fewest pain points

**Pagination:** 12 cards per page by default. "Load more" appends the next 12 cards (no full page reload).

---

## 5. Component Inventory

| Component | Description | Key States |
|---|---|---|
| `SearchInput` | *(superseded by `SubredditChipInput`)* Legacy text input | default, focused, filled, error, disabled |
| `SubredditChipInput` | Chip-based multi-subreddit input (max 5) | default, focused, chip-present, at-limit, chip-invalid |
| `SubredditChip` | Individual chip within `SubredditChipInput` | default, focused, removing |
| `AnalyseButton` | Primary CTA | default, hover, loading (spinner), disabled |
| `ProgressBar` | Linear progress 0–100% | animated fill, indeterminate |
| `StepIndicator` | Current analysis step label | step 1–4, complete, error |
| `PainPointCard` | Result list item | default, hover, focused (keyboard) |
| `SeverityDot` | Coloured dot: red/orange/yellow | high, medium, low |
| `FrequencyBadge` | `N×` pill | — |
| `CategoryChip` | Tag pill | — |
| `SourceBadge` | Container for indigo `r/name` source pills | — |
| `SourceBadgePill` | Single `r/name` indigo chip; overflow variant `+N more` | default, overflow |
| `SavedIndicator` | Auto-save status row on results page | saving, saved, failed, stale |
| `ExportButton` | Ghost button `[Export ▾]` that opens `ExportDropdown` | default, hover, disabled |
| `ExportDropdown` | Menu with CSV / Markdown / JSON download options | open, closed |
| `SortSelect` | Dropdown for sort order | — |
| `FilterSelect` | Dropdown/sheet for filters | — |
| `PostCard` | Reddit post in detail view | default, hover |
| `ExternalLink` | Opens Reddit in new tab | default, hover, focus |
| `EmptyState` | Illustrated empty/error message | empty, error variants |
| `SkeletonCard` | Placeholder while loading | pulsing animation |
| `ThemeToggle` | Light/dark mode switch | light, dark |
| `Header` | Top bar; authenticated and unauthenticated variants | authenticated, unauthenticated |
| `BackLink` | ← chevron + label | default, hover, focus |
| `SummaryBar` | Results count + context metadata | — |
| `AnalysisCard` | Dashboard card for a saved analysis | default, hover, renaming, deleting, delete-confirm |
| `AnalysisTitleInput` | Inline editable title field within `AnalysisCard` | default, editing, saved, error |
| `DeleteConfirmPopover` | Confirmation popover before deleting an analysis | open, closed |
| `OverflowMenu` | `[⋯]` button with Rename/Delete menu | open, closed |
| `DashboardFilterBar` | Search + sort controls for the Dashboard | — |
| `PartialFailureBanner` | Warning banner when one subreddit could not be fetched | visible, dismissed |

---

## 6. Interaction Patterns

### 6.1 Loading States
- **Search submission:** Button shows spinner + "Analysing…" text; chip input is disabled.
- **Analysis page:** Progress bar animates; step label updates every few seconds via polling or SSE.
- **Results loading:** Skeleton cards (3–4) pulse in place of real cards.
- **Detail page loading:** Skeleton for summary card and 3 post cards.

### 6.2 Skeleton Pattern
Skeletons use a shimmer animation. Match the shape of the real content to minimise layout shift.

### 6.3 Empty States
Every list view must handle the empty case explicitly — never show a blank page. Include:
- An icon or illustration (SVG inline, no external fetch)
- A human message explaining what happened
- At least one action the user can take next

### 6.4 Error States
- **Inline field error:** Red border + message below the field (not a toast).
- **Page-level error:** Replaces the in-progress content with error card (icon + message + retry CTA).
- **Toast / transient:** Used only for non-critical feedback (e.g., "Link copied", "Analysis deleted"). Dismiss after 3 s.

### 6.5 Transitions
- Page transitions: page fades in on mount. Use CSS only, no JS animation library.
- Card hover: cards lift slightly with a subtle shadow increase.
- Progress bar fill: the fill width transitions smoothly.

### 6.6 Form Behaviour
- Submit on Enter key from the search chip input.
- Prevent double-submit (disable button while request is in-flight).
- Persist last query in `localStorage` so it survives page refresh.
- Recent searches: last 5, stored in `localStorage`, shown as dismissible chips on the landing page.

### 6.7 Chip Input
- **Add chip:** Press `Enter`, `Tab`, or `,` (comma) while text is in the input field.
- **Remove last chip:** Press `Backspace` on an empty input field.
- **Navigate chips:** `←` / `→` arrow keys move focus between existing chips.
- **Remove focused chip:** `Delete` key removes the currently focused chip.
- **Paste:** Content is split on commas and/or whitespace; each segment is validated. Invalid segments are discarded and a single consolidated error toast is shown: "N invalid subreddits were ignored."
- **Duplicate handling:** Silently ignored — no chip added, no error shown.
- **At-limit (5 chips):** Text input is hidden; further keyboard input is ignored; tooltip shown on hover of the input area.

### 6.8 Auto-Save Indicator
- `SavedIndicator` mounts in the `saving` state immediately after results load.
- On successful save: transitions to `saved` state with a checkmark and a relative timestamp (e.g., "2 minutes ago").
- Timestamp string re-computed every 60 s via `setInterval`; interval cleared on unmount.
- On save failure: transitions to `failed` state with a "Retry" link that re-triggers the save.
- Unauthenticated users: `SavedIndicator` is not rendered; a session-only notice ("Results available this session only") may appear in a dismissible banner instead.
- Stale state: rendered when results are loaded from a `?savedId=` URL and the data is older than the freshness threshold.

### 6.9 Export
- `ExportButton` has `aria-haspopup="menu"` and `aria-expanded` toggled on open/close.
- File generation may be client-side (CSV, Markdown) or server-side (JSON with full raw data); server-side exports receive a pre-signed URL.
- Client-side downloads: create a `Blob`, generate an object URL via `URL.createObjectURL`, trigger download via a temporary `<a>` element, then call `URL.revokeObjectURL` immediately after.
- **Filename pattern:** `redditpains-[subreddit]-[YYYY-MM-DD].[ext]`
  - Single subreddit: `redditpains-productivity-2026-02-27.csv`
  - Multi-subreddit: `redditpains-productivity+nocode-2026-02-27.csv`
- `ExportButton` is disabled (`aria-disabled="true"`, pointer-events none) while results are not fully loaded.

### 6.10 Dashboard Cards
- **Inline rename:** Clicking "Rename" in `OverflowMenu` replaces the title text with `AnalysisTitleInput`. Blur (focus lost) triggers a PATCH save. `Escape` cancels and restores the previous title.
- **Delete confirmation:** `DeleteConfirmPopover` opens anchored to the card. Focus is trapped within the popover (Tab cycles between [Cancel] and [Delete]). Pressing `Escape` closes the popover without deleting.
- **Re-run:** Navigates to `/?subreddits=r/X,r/Y` using query params; the landing page reads these params on mount and pre-populates the `SubredditChipInput`.
- **Optimistic delete:** Card fades to 50% opacity immediately on [Delete] click; removed from DOM on server confirmation; restored (with error toast) on failure.

---

## 7. Responsive Design

Breakpoint names (`sm`, `md`, `lg`) defer to the design system for their pixel values.

### Layout Shifts by Breakpoint

**Landing (`/`)**
- Below `sm`: Full-width chip input (wraps to multiple lines as chips accumulate); Analyse button stacks below input
- `sm` and above: Chip input occupies full width; chips flow in a single horizontally scrollable row; Analyse button inline beneath

**Results (`/results`)**
- Below `md`: Sort/filter/export as icon buttons → bottom sheet on tap
- `md` and above: Sort/filter/export dropdowns inline in controls row

**Detail (`/results/[id]`)**
- Below `sm`: Post cards full-width; "Open on Reddit" becomes icon-only link
- `sm` and above: Post cards with more generous padding; link shows full label

**Dashboard (`/dashboard`)**
- Below `md` (< 768 px): 1-column card grid; `[View]`, `[Re-run]`, `[⋯]` action buttons become icon-only with `aria-label`
- `md` and above: 2-column card grid
- `lg` and above: 3-column card grid

### Touch Targets
All interactive elements must be at least 44×44 px on mobile (WCAG 2.5.5).

---

## 8. Accessibility

### Target
WCAG 2.1 Level AA

### Focus Management
- On page navigation (client-side route change), move focus to the page `<h1>` or the first meaningful interactive element.
- On modal/sheet open, trap focus within the modal. Restore focus to the trigger element on close.
- Visible focus outline on all interactive elements (do not `outline: none` without a replacement style). Use `ring-2 ring-offset-2` (Tailwind) as the standard focus ring.

### Keyboard Navigation
| Key | Action |
|---|---|
| `Enter` | Submit search form; activate buttons/links; add chip (in chip input) |
| `Escape` | Close modal, bottom sheet, or dropdown; cancel rename in Dashboard |
| `Tab` / `Shift+Tab` | Move through focusable elements |
| `Space` | Toggle checkbox / open select |
| `Arrow Up/Down` | Navigate dropdown options |
| `,` (comma) | Add chip from current text in `SubredditChipInput` |
| `Tab` | Add chip from current text in `SubredditChipInput` (as well as moving focus) |
| `Backspace` | Remove last chip when input field is empty |
| `←` / `→` | Navigate between chips in `SubredditChipInput` |
| `Delete` | Remove currently focused chip in `SubredditChipInput` |

### ARIA
- Search input: `aria-label="Search topic or subreddit"` (visible label preferred)
- `SubredditChipInput`: `role="group"` with `aria-label="Subreddits to analyse"`
- `SubredditChip`: `role="option"` with `aria-selected="true"` and `aria-label="r/[name], press Delete to remove"`
- Progress bar: `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Analysis progress"`
- Loading region: `aria-live="polite"` around step label so screen readers announce updates
- Card list: `<ul>` with `<li>` wrappers; cards are `<article>` elements
- External links: append visually-hidden "(opens in new tab)" or use `aria-label`
- Severity dot: `aria-label="High severity"` (not just `title`)
- Error messages: `role="alert"` so they are announced immediately
- `ExportButton`: `aria-haspopup="menu"`, `aria-expanded` toggled on open/close
- `DeleteConfirmPopover`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the popover heading
- `SavedIndicator`: `aria-live="polite"` so state changes are announced to screen readers

### Colour Independence
- Severity is never communicated by colour alone — always pair the dot with a text label.
- Progress bar includes a percentage text label.
- `SourceBadge` chips use indigo colour plus the `r/name` text label — never colour alone.

### Motion
Add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

The shimmer skeleton animation must also be suppressed under this media query.

---

## Appendix A — File / Route Mapping

```
app/
  layout.tsx                    ← root layout (Geist fonts, metadata)
  globals.css                   ← CSS variables, @theme, global resets
  page.tsx                      ← / Landing
  analysis/
    page.tsx                    ← /analysis
  results/
    page.tsx                    ← /results (list)
    [id]/
      page.tsx                  ← /results/[id] (detail)
  dashboard/
    page.tsx                    ← /dashboard (authenticated)
  components/
    SubredditChipInput.tsx      ← replaces SearchInput.tsx
    SubredditChip.tsx
    SourceBadge.tsx
    SourceBadgePill.tsx
    SavedIndicator.tsx
    ExportButton.tsx
    ExportDropdown.tsx
    AnalysisCard.tsx
    AnalysisTitleInput.tsx
    DeleteConfirmPopover.tsx
    OverflowMenu.tsx
    DashboardFilterBar.tsx
    PartialFailureBanner.tsx
    AnalyseButton.tsx
    ProgressBar.tsx
    StepIndicator.tsx
    PainPointCard.tsx
    SeverityDot.tsx
    FrequencyBadge.tsx
    CategoryChip.tsx
    SortSelect.tsx
    FilterSelect.tsx
    PostCard.tsx
    ExternalLink.tsx
    EmptyState.tsx
    SkeletonCard.tsx
    ThemeToggle.tsx
    Header.tsx
    BackLink.tsx
    SummaryBar.tsx
    SearchInput.tsx             ← superseded by SubredditChipInput.tsx; keep until migration complete
```

---

## Appendix B — Open Questions

1. **Analysis speed:** Is the Reddit fetch + AI clustering synchronous (< 5 s) or async? This determines whether `/analysis` needs polling/SSE or can just be a loading overlay.
2. **Authentication:** Do users need accounts, or is it anonymous? If accounts, add login/signup flows to the IA.
3. **Rate limiting / quotas:** Should the UI expose a "remaining searches today" counter?
4. ~~**Sharing / export:** Do users need to share results? If so, add a copy-link button and consider OG meta tags for the results page.~~ **Resolved:** Export is implemented (CSV/Markdown/JSON via ExportDropdown). Sharing via URL (`?savedId=`) is supported for authenticated users. OG meta tags are deferred.
5. **Caching:** Should previous results for the same query be shown instantly from cache? If yes, the results page needs a "refreshed at" timestamp and a refresh button.
6. **Auth provider:** Which authentication provider should be used? Candidates: Clerk (easiest DX), NextAuth/Auth.js (open-source), or Supabase Auth. Choice affects Dashboard route protection and session handling.
7. **Dashboard pagination strategy:** Should the Dashboard use cursor-based pagination (better for real-time inserts) or offset-based pagination (simpler)? "Load more" UX works with either, but cursor is preferred to avoid duplicate cards when new analyses are added.
8. **Export generation location:** Should CSV/Markdown exports be generated client-side (simpler, no server cost) or server-side (needed for JSON exports with full raw post data)? Hybrid approach: CSV/Markdown client-side, JSON via a server endpoint returning a pre-signed download URL.
9. **Subreddit live-validation:** Should the chip input validate subreddit existence against the Reddit API on-the-fly (as the user types), or only on submit? Live validation improves UX but adds latency and rate-limit risk; on-submit validation is safer.
10. **Saved analysis data model:** Should the backend store raw Reddit posts alongside the analysis results? Storing raw posts enables re-running analysis without re-fetching Reddit, but significantly increases storage cost. Alternative: store only the cluster results and re-fetch posts on re-run.
