# Design System

Reddit Pain Point Finder — Minimal / Neutral design language.

Inspired by Linear and Vercel: zinc grays, white/black base, subtle orange accent. Clean, data-focused, and restrained.

---

## 1. Principles

- **Clarity** — every element earns its place; no decorative noise
- **Restraint** — neutral palette by default, color only for meaning
- **Consistency** — predictable spacing, type scale, and interaction patterns across all surfaces

---

## 2. Color Tokens

### Base (CSS custom properties in `app/globals.css`)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

These are surfaced into Tailwind via `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Use as `bg-background` / `text-foreground` in JSX.

### Zinc Scale

| Token         | Hex       | Light mode usage                     | Dark mode usage                  |
|---------------|-----------|--------------------------------------|----------------------------------|
| `zinc-50`     | `#fafafa` | Page canvas, subtle backgrounds      | —                                |
| `zinc-100`    | `#f4f4f5` | Hover states, card surfaces          | —                                |
| `zinc-200`    | `#e4e4e7` | Borders, dividers                    | —                                |
| `zinc-300`    | `#d4d4d8` | Disabled borders                     | —                                |
| `zinc-400`    | `#a1a1aa` | Placeholder text, muted labels       | Muted text on dark               |
| `zinc-500`    | `#71717a` | Secondary text                       | Secondary text on dark           |
| `zinc-600`    | `#52525b` | Body text (secondary)                | —                                |
| `zinc-700`    | `#3f3f46` | —                                    | Borders, dividers                |
| `zinc-800`    | `#27272a` | —                                    | Card surfaces                    |
| `zinc-900`    | `#18181b` | —                                    | Elevated surfaces                |
| `zinc-950`    | `#09090b` | High-contrast text                   | Page canvas                      |

Existing usage in `app/page.tsx`:
- `bg-zinc-50` — outer wrapper background (light)
- `text-zinc-600` — secondary body paragraph text (light)
- `text-zinc-400` — secondary body paragraph text (dark)
- `text-zinc-950` — strong link text (light)
- `text-zinc-50` — primary heading + strong link text (dark)

### Accent — Orange

| Purpose              | Class              | Hex       |
|----------------------|--------------------|-----------|
| Primary CTA bg       | `bg-orange-600`    | `#ea580c` |
| Primary CTA hover    | `bg-orange-700`    | `#c2410c` |
| Link color           | `text-orange-600`  | `#ea580c` |
| Focus ring           | `ring-orange-500`  | `#f97316` |
| Dark mode CTA bg     | `bg-orange-500`    | `#f97316` |
| Dark mode CTA hover  | `bg-orange-400`    | `#fb923c` |

### Semantic Status

| Semantic     | Light                                   | Dark                                      |
|--------------|-----------------------------------------|-------------------------------------------|
| Success      | `text-green-600` / `bg-green-50`        | `text-green-400` / `bg-green-950`         |
| Warning      | `text-amber-600` / `bg-amber-50`        | `text-amber-400` / `bg-amber-950`         |
| Destructive  | `text-red-600` / `bg-red-50`            | `text-red-400` / `bg-red-950`             |
| Info         | `text-orange-600` / `bg-orange-50`      | `text-orange-400` / `bg-orange-950`       |

---

## 3. Typography

### Fonts

```css
@theme inline {
  --font-sans: var(--font-geist-sans);  /* loaded via next/font/local */
  --font-mono: var(--font-geist-mono);
}
```

Use `font-sans` (default body) and `font-mono` (code, data values).

### Type Scale

| Level       | Size            | Weight          | Line Height     | Tracking           | Usage                      |
|-------------|-----------------|-----------------|-----------------|--------------------|-----------------------------|
| Display     | `text-5xl`      | `font-semibold` | `leading-tight` | `tracking-tighter` | Hero headings               |
| H1          | `text-4xl`      | `font-semibold` | `leading-tight` | `tracking-tight`   | Page titles                 |
| H2          | `text-3xl`      | `font-semibold` | `leading-10`    | `tracking-tight`   | Section headings            |
| H3          | `text-2xl`      | `font-medium`   | `leading-8`     | `tracking-tight`   | Subsection headings         |
| H4          | `text-xl`       | `font-medium`   | `leading-7`     | `tracking-normal`  | Card titles                 |
| Body LG     | `text-lg`       | `font-normal`   | `leading-8`     | `tracking-normal`  | Lead paragraphs             |
| Body        | `text-base`     | `font-normal`   | `leading-7`     | `tracking-normal`  | Default prose               |
| Small       | `text-sm`       | `font-normal`   | `leading-6`     | `tracking-normal`  | Helper text, labels         |
| Caption     | `text-xs`       | `font-normal`   | `leading-5`     | `tracking-wide`    | Timestamps, metadata        |
| Mono        | `text-sm font-mono` | `font-normal` | `leading-6`   | `tracking-normal`  | Code, numeric data          |

Existing usage in `app/page.tsx`:
- `text-3xl font-semibold leading-10 tracking-tight` → H2 level heading
- `text-lg leading-8` → Body LG paragraph

### Weights

| Class           | Value | Usage                         |
|-----------------|-------|-------------------------------|
| `font-normal`   | 400   | Body text, descriptions       |
| `font-medium`   | 500   | Emphasis, nav items, labels   |
| `font-semibold` | 600   | Headings, CTA labels          |

---

## 4. Spacing Scale

Base unit: **4px** (`1` in Tailwind = 4px).

| Name | Tailwind  | px  | Usage                                 |
|------|-----------|-----|---------------------------------------|
| xs   | `gap-1`   | 4   | Tight icon-to-label spacing           |
| sm   | `gap-2`   | 8   | Inline element gaps                   |
| md   | `gap-4`   | 16  | Default component padding             |
| lg   | `gap-6`   | 24  | Card internal padding, section gaps   |
| xl   | `gap-8`   | 32  | Between major content blocks          |
| 2xl  | `gap-12`  | 48  | Section-level vertical rhythm         |
| 3xl  | `gap-16`  | 64  | Page-level vertical padding           |

Page padding: `py-32 px-16` (128px vertical, 64px horizontal) as seen in `app/page.tsx`.

---

## 5. Border Radius

| Name | Class          | Value  | Usage                            |
|------|----------------|--------|----------------------------------|
| none | `rounded-none` | 0      | Tables, flush layouts            |
| sm   | `rounded`      | 4px    | Inputs, small badges             |
| md   | `rounded-md`   | 8px    | Cards, dropdowns                 |
| lg   | `rounded-lg`   | 12px   | Modals, larger cards             |
| full | `rounded-full` | 9999px | Pills, avatar circles, icon btns |

Existing usage: `rounded-full` on primary and secondary buttons in `app/page.tsx`.

---

## 6. Elevation / Shadows

| Level   | Class       | Usage                               |
|---------|-------------|-------------------------------------|
| surface | `shadow-sm` | Cards, inputs on non-white bg       |
| overlay | `shadow-md` | Dropdowns, popovers, tooltips       |
| modal   | `shadow-xl` | Dialogs, drawers, command palette   |

In dark mode, prefer `border border-zinc-800` over shadows for elevation — shadows are less visible on dark backgrounds.

---

## 7. Component Patterns

### Button

All buttons: `h-12`, `rounded-full`, `font-medium`, `text-base`, `transition-colors`, `px-5`.

```
Primary     — bg-orange-600 text-white hover:bg-orange-700
              dark: bg-orange-500 hover:bg-orange-400

Secondary   — border border-black/[.08] hover:bg-black/[.04] hover:border-transparent
              dark: border-white/[.145] hover:bg-[#1a1a1a]

Ghost       — no border, no background; hover:bg-zinc-100 dark:hover:bg-zinc-800

Destructive — bg-red-600 text-white hover:bg-red-700
              dark: bg-red-500 hover:bg-red-400
```

> Note: `app/page.tsx` uses `bg-foreground text-background` for its primary button, mapping to
> `#171717` / `#ffffff` (light) and `#ededed` / `#0a0a0a` (dark). New primary CTAs should use
> orange instead.

Focus state (all buttons): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2`

### Input / Textarea

```
h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2
text-sm text-zinc-950 placeholder:text-zinc-400
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500

dark: border-zinc-700 bg-zinc-900 text-zinc-50 placeholder:text-zinc-500
```

### Card

Surface container for grouped content.

```
rounded-md border border-zinc-200 bg-white p-6
dark: border-zinc-800 bg-zinc-900
```

Optional: add `shadow-sm` when the card sits on a non-white background.

### Badge

Compact status label.

```
inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium

Neutral:     bg-zinc-100 text-zinc-700      dark: bg-zinc-800 text-zinc-300
Success:     bg-green-50 text-green-700     dark: bg-green-950 text-green-400
Warning:     bg-amber-50 text-amber-700     dark: bg-amber-950 text-amber-400
Destructive: bg-red-50 text-red-700         dark: bg-red-950 text-red-400
Info:        bg-orange-50 text-orange-700   dark: bg-orange-950 text-orange-400
```

### Skeleton (loading state)

```
animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800
```

Use with explicit `h-*` and `w-*` to reserve layout space before content loads.

---

## 8. Layout

### Breakpoints (Tailwind defaults)

| Name | Min-width |
|------|-----------|
| sm   | 640px     |
| md   | 768px     |
| lg   | 1024px    |
| xl   | 1280px    |
| 2xl  | 1536px    |

### Container Max-widths

| Purpose           | Class       | Max-width |
|-------------------|-------------|-----------|
| Reading / content | `max-w-3xl` | 768px     |
| Dashboard / data  | `max-w-6xl` | 1152px    |
| Full bleed        | (none)      | 100%      |

The existing page uses `max-w-3xl` centered content, consistent with the reading container.

---

## 9. Dark Mode

Dark mode is driven by `prefers-color-scheme: dark` via CSS media query — **no JS toggle, no class-based dark mode**.

### How tokens flip

```css
/* globals.css */
:root {
  --background: #ffffff;   /* light */
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;  /* dark */
    --foreground: #ededed;
  }
}
```

Tailwind's `dark:` prefix (class-based) can still be used for zinc/orange palette shifts (e.g., `dark:text-zinc-400`), which is the pattern in `app/page.tsx`.

### Rules

- **Do** use `bg-background` / `text-foreground` for base surfaces and text
- **Do** use `dark:` variants for zinc/orange palette shifts
- **Do** prefer borders over shadows for elevation in dark mode
- **Don't** hard-code light-mode hex values without a `dark:` counterpart
- **Don't** add a JS-based theme toggle unless explicitly requested

---

## 10. Implementation Notes

### Tailwind v4 `@theme inline`

Tailwind v4 uses CSS-first configuration. Tokens live in `app/globals.css` inside `@theme inline {}` — there is no `tailwind.config.ts` for design tokens.

```css
/* app/globals.css */
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Adding new tokens

To extend the design system, add tokens to the `@theme inline` block:

```css
@theme inline {
  /* existing */
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* new accent tokens */
  --color-accent: #ea580c;        /* orange-600 */
  --color-accent-hover: #c2410c;  /* orange-700 */
}
```

These become available as `bg-accent`, `text-accent`, etc.

### Font loading

Geist fonts are loaded via `next/font/local` in `app/layout.tsx` and injected as CSS variables (`--font-geist-sans`, `--font-geist-mono`). Do not import them elsewhere — reference only through `font-sans` and `font-mono` utility classes.

### Path alias

Use `@/` for all internal imports (resolves to project root):

```ts
import { Button } from "@/app/components/Button";
```
