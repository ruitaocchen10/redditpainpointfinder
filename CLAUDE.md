# CLAUDE.md

RedditPains is a SaaS tool that helps indie hackers, founders, and marketers find pain points in Reddit niches to validate startup ideas and understand their target audience. It searches Reddit forums, aggregates posts and comments, and uses LLM-powered analysis to surface the most common frustrations, complaints, and unmet needs within a given niche — turning raw community chatter into actionable market insights.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

Tech Stack & Architecture
Frontend

Next.js (App Router) with TypeScript
Tailwind CSS for styling
shadcn/ui for component library

Backend

Next.js API routes — server-side logic and orchestration
Trigger.dev (or Inngest) — background job processing for async Reddit fetching and LLM analysis
Reddit API (snoowrap or native fetch) — data collection
Claude API (Anthropic) — LLM analysis and pain point labeling

Database & Auth

Supabase — managed PostgreSQL database + authentication

Billing

TBD — likely Stripe

Deployment

TBD — possible experiment with NexLayer
