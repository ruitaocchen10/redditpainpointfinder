# Data Schema

## Schema Overview

```
auth.users  (Supabase-managed)
    │
    ├── profiles           (1:1 — user identity extension)
    ├── subscriptions      (1:1 — billing + quota tracking)
    └── analyses           (1:N — one row per "Analyse" click)
          │
          └── pain_points  (1:N — one clustered pain per row)
                │
                └── pain_point_posts  (N:M join table)
                      │
                      └── reddit_posts  (shared post cache)
```

---

## Enum Types

```sql
create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

create type public.plan_id as enum ('free', 'pro', 'team');

create type public.analysis_status as enum (
  'pending', 'fetching', 'analyzing', 'completed', 'failed'
);

create type public.time_range as enum (
  'week', 'month', '3months', 'year', 'all'
);

create type public.severity_level as enum ('high', 'medium', 'low');
```

---

## Shared Trigger Function

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

---

## Table 1: `profiles`

Extends `auth.users` with app-level identity. Auto-created by a trigger on signup.

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Users can read and update their own profile
create policy "profiles: select own"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);
```

---

## Table 2: `subscriptions`

Billing + quota tracking. All Stripe columns are nullable so this works at launch
without Stripe wired in. Powers the "2 of 3 searches used" UI in SettingsModal.

```sql
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.profiles(id) on delete cascade,

  -- Plan + status
  plan                    public.plan_id not null default 'free',
  status                  public.subscription_status not null default 'active',

  -- Quota (used for gating without a COUNT query)
  searches_used           integer not null default 0,
  searches_limit          integer not null default 3,   -- 3 for free, higher for paid

  -- Stripe (nullable until billing is wired)
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- Users can only read their own subscription
create policy "subscriptions: select own"
  on public.subscriptions for select using (auth.uid() = user_id);
-- All writes are service-role only (Stripe webhooks, job runner)
```

---

## Table 3: `analyses`

One row per user-submitted analysis. Status drives Supabase Realtime polling on the
results page. Denormalized fields (pain_count, top_pain) power history list cards
without a JOIN.

```sql
create table public.analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,

  -- Search parameters (captured from home page form)
  subreddits      text[] not null,                      -- max 5 items
  time_range      public.time_range not null default 'month',
  post_limit      integer not null default 100
                    check (post_limit in (50, 100, 250, 500)),

  -- Job tracking
  status          public.analysis_status not null default 'pending',
  job_id          text,                                 -- Trigger.dev / Inngest run ID
  error_message   text,                                 -- populated on 'failed'

  -- Denormalized result summary (written once on job completion)
  post_count      integer,                              -- actual posts fetched
  pain_count      integer,                              -- total pain_points rows
  top_pain        text,                                 -- top pain point title for history cards

  created_at      timestamptz not null default now(),
  completed_at    timestamptz,
  updated_at      timestamptz not null default now()
);

alter table public.analyses enable row level security;

create trigger analyses_set_updated_at
  before update on public.analyses
  for each row execute function public.set_updated_at();

-- History page: all analyses for a user, newest first
create index analyses_user_id_created_at_idx
  on public.analyses(user_id, created_at desc);

-- Job runner looks up by job_id to update status
create index analyses_job_id_idx
  on public.analyses(job_id) where job_id is not null;

-- Admin / queue-recovery: find stuck jobs
create index analyses_status_idx
  on public.analyses(status)
  where status in ('pending', 'fetching', 'analyzing');

-- Users can read and insert their own analyses
create policy "analyses: select own"
  on public.analyses for select using (auth.uid() = user_id);

create policy "analyses: insert own"
  on public.analyses for insert with check (auth.uid() = user_id);
-- Updates (status changes) are service-role only (job runner)
```

---

## Table 4: `pain_points`

One row per clustered pain point produced by the Claude LLM step.
Maps exactly to the `PainPoint` interface in `PainPointCard.tsx`.

```sql
create table public.pain_points (
  id            uuid primary key default gen_random_uuid(),
  analysis_id   uuid not null references public.analyses(id) on delete cascade,

  title         text not null,
  severity      public.severity_level not null,
  frequency     integer not null default 1 check (frequency >= 1),
  top_quote     text not null,
  categories    text[] not null default '{}',     -- LLM-generated tags, e.g. ["Onboarding","UX"]
  ai_summary    text not null,
  sort_order    integer not null default 0,        -- preserves LLM output ordering

  created_at    timestamptz not null default now()
);

alter table public.pain_points enable row level security;

create index pain_points_analysis_id_sort_order_idx
  on public.pain_points(analysis_id, sort_order);

create index pain_points_analysis_id_frequency_idx
  on public.pain_points(analysis_id, frequency desc);

create index pain_points_analysis_id_severity_idx
  on public.pain_points(analysis_id, severity);

-- Future: GIN index for category filtering
-- create index pain_points_categories_gin_idx on public.pain_points using gin(categories);

-- Readable if parent analysis belongs to the current user
create policy "pain_points: select via analysis ownership"
  on public.pain_points for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = pain_points.analysis_id
        and a.user_id = auth.uid()
    )
  );
-- All writes are service-role only
```

---

## Table 5: `reddit_posts`

Deduplicated cache of Reddit posts. Shared across analyses — if two analyses cover the
same subreddit, posts are upserted (not duplicated) via `reddit_post_id`.
Maps to the `RedditPost` interface in `PainPointCard.tsx`.

```sql
create table public.reddit_posts (
  id              uuid primary key default gen_random_uuid(),

  -- Reddit's own identifier — unique constraint enables upsert-based deduplication
  reddit_post_id  text not null unique,
  subreddit       text not null,
  title           text not null,
  url             text not null,
  upvotes         integer not null default 0,
  excerpt         text,                           -- snippet shown in the expanded pain point card
  author          text,                           -- redditor username (nullable for deleted accounts)
  score           integer,                        -- raw Reddit score at time of fetch
  num_comments    integer,
  body_text       text,                           -- full body stored for re-analysis without re-fetching

  posted_at       timestamptz,                    -- when originally published on Reddit
  fetched_at      timestamptz not null default now()
);

alter table public.reddit_posts enable row level security;

create unique index reddit_posts_reddit_post_id_idx
  on public.reddit_posts(reddit_post_id);

create index reddit_posts_subreddit_idx
  on public.reddit_posts(subreddit);

-- Readable if linked to one of the current user's pain points
create policy "reddit_posts: select via pain_point ownership"
  on public.reddit_posts for select
  using (
    exists (
      select 1
      from public.pain_point_posts ppp
      join public.pain_points pp on pp.id = ppp.pain_point_id
      join public.analyses a on a.id = pp.analysis_id
      where ppp.post_id = reddit_posts.id
        and a.user_id = auth.uid()
    )
  );
-- All writes are service-role only
```

---

## Table 6: `pain_point_posts` (join table)

Resolves the many-to-many between `pain_points` and `reddit_posts`.
A single Reddit post can support multiple pain points; a pain point is backed by
multiple posts.

```sql
create table public.pain_point_posts (
  pain_point_id   uuid not null references public.pain_points(id) on delete cascade,
  post_id         uuid not null references public.reddit_posts(id) on delete cascade,
  relevance_score numeric(4,3),                  -- optional LLM confidence score (0.0–1.0)

  primary key (pain_point_id, post_id)
);

alter table public.pain_point_posts enable row level security;

-- Reverse index for "which pain points cite this post?" queries
create index pain_point_posts_post_id_idx on public.pain_point_posts(post_id);

create policy "pain_point_posts: select via pain_point ownership"
  on public.pain_point_posts for select
  using (
    exists (
      select 1
      from public.pain_points pp
      join public.analyses a on a.id = pp.analysis_id
      where pp.id = pain_point_posts.pain_point_id
        and a.user_id = auth.uid()
    )
  );
```

---

## Auth Bootstrap Trigger

Auto-creates `profiles` and `subscriptions` rows when a user signs up via Supabase Auth.

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.subscriptions (user_id, plan, status, searches_used, searches_limit)
  values (new.id, 'free', 'active', 0, 3);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## Primary API Query

Fetches a complete analysis result — replaces MOCK_DATA in `app/results/[id]/page.tsx`.
Produces the exact shape of the `ResultData` TypeScript interface.

```sql
select
  a.id,
  a.subreddits,
  a.time_range,
  a.post_count,
  a.created_at,
  a.status,
  json_agg(
    json_build_object(
      'id',         pp.id,
      'title',      pp.title,
      'severity',   pp.severity,
      'frequency',  pp.frequency,
      'topQuote',   pp.top_quote,
      'categories', pp.categories,
      'aiSummary',  pp.ai_summary,
      'posts', (
        select json_agg(
          json_build_object(
            'title',   rp.title,
            'upvotes', rp.upvotes,
            'excerpt', rp.excerpt,
            'url',     rp.url
          ) order by ppp.relevance_score desc nulls last
        )
        from public.pain_point_posts ppp
        join public.reddit_posts rp on rp.id = ppp.post_id
        where ppp.pain_point_id = pp.id
      )
    ) order by pp.sort_order
  ) as pain_points
from public.analyses a
join public.pain_points pp on pp.analysis_id = a.id
where a.id = $1
  and a.user_id = auth.uid()
group by a.id;
```

---

## History List Query

Replaces HISTORY_ITEMS in `app/history/page.tsx`. Reads only denormalized columns — no JOIN needed.

```sql
select id, subreddits, created_at, pain_count, top_pain
from public.analyses
where user_id = auth.uid()
  and status = 'completed'
order by created_at desc;
```
