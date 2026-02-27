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

FastAPI (Python) — async-native REST API
Celery + Redis — background job queue for async Reddit data fetching and LLM analysis
PRAW — Reddit API client for data collection
BERTopic / sentence-transformers — NLP clustering of pain points
Claude API (Anthropic) — LLM summarization and pain point labeling

Database & Caching

PostgreSQL — primary database for storing users, searches, cached posts, and analysis results
Redis — short-term request-level cache (TTL-based) and Celery broker

Auth & Billing

TBD — likely Clerk (auth) + Stripe (billing)

Deployment

TBD — likely Railway or Render
