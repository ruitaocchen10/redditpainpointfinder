alter table public.analyses
  add column min_upvotes      integer not null default 2,
  add column keyword_filter   text[]  not null default '{}',
  add column exclude_keywords text[]  not null default '{}';
