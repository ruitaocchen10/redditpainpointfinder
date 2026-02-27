# UI/UX Specification — Reddit Pain Point Finder

**Version:** 1.0
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
1. Enter a topic or subreddit name
2. Optionally filter by time range and post count
3. View ranked list of pain point clusters
4. Drill into a cluster to see supporting Reddit posts

---

## 2. Information Architecture

```
/                         ← Landing / Home (search form, hero)
/analysis                 ← Analysis in-progress (polling state)
/results                  ← Results list (pain point clusters)
/results/[id]             ← Pain point detail (supporting posts)
```

> **Note:** `/analysis` and `/results` may be merged into a single route if the analysis is fast enough (< 5 s), using local state to toggle between skeleton and results. Keep separate routes if analysis is async/long-running so users can bookmark or share result URLs.

### Navigation Model
- No persistent nav bar. Each page provides its own contextual back action.
- Header is minimal: app name/logo (links to `/`) + optional theme toggle.

---

## 3. User Flows

### 3.1 Primary Flow — Happy Path

```
Landing (/)
  │
  ├─ User types topic or subreddit name
  ├─ (Optional) Sets time range, post limit
  └─ Clicks "Analyse"
       │
       ▼
Analysis (/analysis)
  │
  ├─ Progress indicator visible
  ├─ Estimated time shown (e.g. "~20 seconds")
  └─ Analysis completes
       │
       ▼
Results (/results?q=…)
  │
  ├─ Pain point clusters listed, ranked by frequency
  ├─ Each cluster shows: title, frequency badge, sentiment chip, excerpt
  └─ User clicks a cluster
       │
       ▼
Detail (/results/[id])
  │
  ├─ Full description of the pain point
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

---

## 4. Page Specifications

### 4.1 Landing / Home Page (`/`)

**Goal:** Communicate the tool's purpose and make it trivially easy to start a search.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  [Logo / App Name]                         [Theme ◐]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│           Reddit Pain Point Finder                      │  ← h1, centred
│                                                         │
│   Discover what your target audience complains about    │  ← subtitle
│                                                         │
│  ┌───────────────────────────────────────┐  ┌────────┐  │
│  │  Topic or subreddit (e.g. "SaaS")     │  │Analyse │  │  ← primary row
│  └───────────────────────────────────────┘  └────────┘  │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────────────┐ │
│  │  Time range ▾      │  │  Max posts ▾               │ │  ← secondary row
│  └────────────────────┘  └────────────────────────────┘ │
│  [+ Advanced options]                                   │  ← toggle (collapsed by default)
│                                                         │
│  ─────────────────── OR ───────────────────            │
│                                                         │
│  Recent searches:  [r/startups ×]  [productivity ×]    │  ← only if history exists
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Component states:**
- Input: default, focused, filled, error (red outline + error message below)
- Analyse button: default, hover, loading (spinner replaces text), disabled (empty input)
- Recent search chips: visible only if localStorage history exists; dismissible (×)

**Validation:**
- Required: non-empty query
- Min length: 2 characters
- Trim whitespace before submit
- If input starts with `r/`, treat as subreddit; otherwise treat as topic keyword

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
│           Analysing "productivity tools"                │  ← query echoed back
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
│  [← New search]    "productivity tools"    [Theme ◐]    │
├─────────────────────────────────────────────────────────┤
│  12 pain points found · r/productivity · Last 3 months  │  ← summary bar
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Sort by: [Frequency ▾]   Filter: [All ▾]              │  ← controls row
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  🔴  Overwhelming notification volume       47× │    │  ← pain point card
│  │      "There's no good way to manage…"           │    │
│  │      [Frustration]  [Productivity]              │    │
│  │                                        View →   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🟠  Poor cross-platform sync               31× │    │
│  │      "Every time I switch from phone to…"       │    │
│  │      [Frustration]  [Sync]                      │    │
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
- "View →" link: navigates to detail page

**Sort options:** Frequency (default), Sentiment score, Most recent

**Filter options:** All, High severity only, By category (if categories available)

**Mobile layout (< 768 px):** Cards go full-width; sort/filter controls collapse into a bottom sheet triggered by a filter icon button.

**Empty state:**

```
│                    🔍                                   │
│                                                         │
│        No pain points found for                         │
│        "productivity tools"                             │
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
│  │                                  [Open on Reddit ↗]  │
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
- "Open on Reddit" external link (opens in new tab, `rel="noopener noreferrer"`)

**Pagination:** Show first 10 posts; "Load more" button (not infinite scroll — avoids accidental scroll-past).

---

## 5. Component Inventory

| Component | Description | Key States |
|---|---|---|
| `SearchInput` | Text input for topic/subreddit | default, focused, filled, error, disabled |
| `AnalyseButton` | Primary CTA | default, hover, loading (spinner), disabled |
| `ProgressBar` | Linear progress 0–100% | animated fill, indeterminate |
| `StepIndicator` | Current analysis step label | step 1–4, complete, error |
| `PainPointCard` | Result list item | default, hover, focused (keyboard) |
| `SeverityDot` | Coloured dot: red/orange/yellow | high, medium, low |
| `FrequencyBadge` | `N×` pill | — |
| `CategoryChip` | Tag pill | — |
| `SortSelect` | Dropdown for sort order | — |
| `FilterSelect` | Dropdown/sheet for filters | — |
| `PostCard` | Reddit post in detail view | default, hover |
| `ExternalLink` | Opens Reddit in new tab | default, hover, focus |
| `EmptyState` | Illustrated empty/error message | empty, error variants |
| `SkeletonCard` | Placeholder while loading | pulsing animation |
| `ThemeToggle` | Light/dark mode switch | light, dark |
| `Header` | Minimal top bar | — |
| `BackLink` | ← chevron + label | default, hover, focus |
| `SummaryBar` | Results count + context metadata | — |

---

## 6. Interaction Patterns

### 6.1 Loading States
- **Search submission:** Button shows spinner + "Analysing…" text; input is disabled.
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
- **Toast / transient:** Used only for non-critical feedback (e.g., "Link copied"). Dismiss after 3 s.

### 6.5 Transitions
- Page transitions: page fades in on mount. Use CSS only, no JS animation library.
- Card hover: cards lift slightly with a subtle shadow increase.
- Progress bar fill: the fill width transitions smoothly.

### 6.6 Form Behaviour
- Submit on Enter key from the search input.
- Prevent double-submit (disable button while request is in-flight).
- Persist last query in `localStorage` so it survives page refresh.
- Recent searches: last 5, stored in `localStorage`, shown as dismissible chips on the landing page.

---

## 7. Responsive Design

Breakpoint names (`sm`, `md`, `lg`) defer to the design system for their pixel values.

### Layout Shifts by Breakpoint

**Landing (`/`)**
- Below `sm`: Full-width input; Analyse button stacks below input
- `sm` and above: Input + button inline on one row; advanced options row beneath

**Results (`/results`)**
- Below `md`: Sort/filter as icon buttons → bottom sheet on tap
- `md` and above: Sort/filter dropdowns inline in controls row

**Detail (`/results/[id]`)**
- Below `sm`: Post cards full-width; "Open on Reddit" becomes icon-only link
- `sm` and above: Post cards with more generous padding; link shows full label

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
| `Enter` | Submit search form; activate buttons/links |
| `Escape` | Close modal, bottom sheet, or dropdown |
| `Tab` / `Shift+Tab` | Move through focusable elements |
| `Space` | Toggle checkbox / open select |
| `Arrow Up/Down` | Navigate dropdown options |

### ARIA
- Search input: `aria-label="Search topic or subreddit"` (visible label preferred)
- Progress bar: `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Analysis progress"`
- Loading region: `aria-live="polite"` around step label so screen readers announce updates
- Card list: `<ul>` with `<li>` wrappers; cards are `<article>` elements
- External links: append visually-hidden "(opens in new tab)" or use `aria-label`
- Severity dot: `aria-label="High severity"` (not just `title`)
- Error messages: `role="alert"` so they are announced immediately

### Colour Independence
- Severity is never communicated by colour alone — always pair the dot with a text label.
- Progress bar includes a percentage text label.

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
  layout.tsx               ← root layout (Geist fonts, metadata)
  globals.css              ← CSS variables, @theme, global resets
  page.tsx                 ← / Landing
  analysis/
    page.tsx               ← /analysis
  results/
    page.tsx               ← /results (list)
    [id]/
      page.tsx             ← /results/[id] (detail)
  components/
    SearchInput.tsx
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
```

---

## Appendix B — Open Questions

1. **Analysis speed:** Is the Reddit fetch + AI clustering synchronous (< 5 s) or async? This determines whether `/analysis` needs polling/SSE or can just be a loading overlay.
2. **Authentication:** Do users need accounts, or is it anonymous? If accounts, add login/signup flows to the IA.
3. **Rate limiting / quotas:** Should the UI expose a "remaining searches today" counter?
4. **Sharing / export:** Do users need to share results? If so, add a copy-link button and consider OG meta tags for the results page.
5. **Caching:** Should previous results for the same query be shown instantly from cache? If yes, the results page needs a "refreshed at" timestamp and a refresh button.
