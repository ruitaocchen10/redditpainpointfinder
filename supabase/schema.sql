-- ============================================================
-- ENUM TYPES
-- ============================================================

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

-- ============================================================
-- SHARED TRIGGER FUNCTION (auto-updates updated_at)
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE 1: profiles
-- ============================================================

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

create policy "profiles: select own"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- TABLE 2: subscriptions
-- ============================================================

create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.profiles(id) on delete cascade,
  plan                    public.plan_id not null default 'free',
  status                  public.subscription_status not null default 'active',
  searches_used           integer not null default 0,
  searches_limit          integer not null default 3,
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

create policy "subscriptions: select own"
  on public.subscriptions for select using (auth.uid() = user_id);

-- ============================================================
-- TABLE 3: analyses
-- ============================================================

create table public.analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  subreddits      text[] not null,
  time_range      public.time_range not null default 'month',
  post_limit      integer not null default 100
                    check (post_limit in (50, 100, 250, 500)),
  status          public.analysis_status not null default 'pending',
  job_id          text,
  error_message   text,
  post_count      integer,
  pain_count      integer,
  top_pain        text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz,
  updated_at      timestamptz not null default now()
);

alter table public.analyses enable row level security;

create trigger analyses_set_updated_at
  before update on public.analyses
  for each row execute function public.set_updated_at();

create index analyses_user_id_created_at_idx
  on public.analyses(user_id, created_at desc);

create index analyses_job_id_idx
  on public.analyses(job_id) where job_id is not null;

create index analyses_status_idx
  on public.analyses(status)
  where status in ('pending', 'fetching', 'analyzing');

create policy "analyses: select own"
  on public.analyses for select using (auth.uid() = user_id);

create policy "analyses: insert own"
  on public.analyses for insert with check (auth.uid() = user_id);

-- ============================================================
-- TABLE 4: pain_points
-- ============================================================

create table public.pain_points (
  id            uuid primary key default gen_random_uuid(),
  analysis_id   uuid not null references public.analyses(id) on delete cascade,
  title         text not null,
  severity      public.severity_level not null,
  frequency     integer not null default 1 check (frequency >= 1),
  top_quote     text not null,
  categories    text[] not null default '{}',
  ai_summary    text not null,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.pain_points enable row level security;

create index pain_points_analysis_id_sort_order_idx
  on public.pain_points(analysis_id, sort_order);

create index pain_points_analysis_id_frequency_idx
  on public.pain_points(analysis_id, frequency desc);

create index pain_points_analysis_id_severity_idx
  on public.pain_points(analysis_id, severity);

create policy "pain_points: select via analysis ownership"
  on public.pain_points for select
  using (
    exists (
      select 1 from public.analyses a
      where a.id = pain_points.analysis_id
        and a.user_id = auth.uid()
    )
  );

-- ============================================================
-- TABLE 5: reddit_posts
-- ============================================================

create table public.reddit_posts (
  id              uuid primary key default gen_random_uuid(),
  reddit_post_id  text not null unique,
  subreddit       text not null,
  title           text not null,
  url             text not null,
  upvotes         integer not null default 0,
  excerpt         text,
  author          text,
  score           integer,
  num_comments    integer,
  body_text       text,
  posted_at       timestamptz,
  fetched_at      timestamptz not null default now()
);

alter table public.reddit_posts enable row level security;

create unique index reddit_posts_reddit_post_id_idx
  on public.reddit_posts(reddit_post_id);

create index reddit_posts_subreddit_idx
  on public.reddit_posts(subreddit);

-- ============================================================
-- TABLE 6: pain_point_posts (join table)
-- ============================================================

create table public.pain_point_posts (
  pain_point_id   uuid not null references public.pain_points(id) on delete cascade,
  post_id         uuid not null references public.reddit_posts(id) on delete cascade,
  relevance_score numeric(4,3),
  primary key (pain_point_id, post_id)
);

alter table public.pain_point_posts enable row level security;

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

-- Deferred: reddit_posts RLS depends on pain_point_posts existing
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

-- ============================================================
-- AUTH BOOTSTRAP TRIGGER
-- Auto-creates profiles + subscriptions rows on every new signup
-- ============================================================

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
