-- Panna League AI Command Center — Supabase schema
-- Paste this into Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: uses IF NOT EXISTS / drop-and-recreate policies.

create table if not exists players (
  id text primary key,
  name text not null,
  age int not null,
  city text not null,
  club text,
  "position" text not null,
  player_score int not null,
  score_breakdown jsonb not null,
  social_audience int not null,
  status text not null,
  last_contact timestamptz,
  ai_recommendation text not null,
  ai_why text not null,
  avatar_seed text not null,
  created_at timestamptz not null default now()
);

create table if not exists clubs (
  id text primary key,
  name text not null,
  city text not null,
  contact_name text not null,
  contact_email text not null,
  website text not null,
  players_identified int not null,
  status text not null,
  potential text not null,
  last_contact timestamptz,
  engagement_type text not null,
  ai_note text not null,
  created_at timestamptz not null default now()
);

create table if not exists sponsors (
  id text primary key,
  name text not null,
  category text not null,
  city text not null,
  fit jsonb not null,
  fit_why text not null,
  potential_value int not null,
  stage text not null,
  last_activity text not null,
  last_activity_date timestamptz not null,
  next_action text not null,
  research jsonb not null,
  ai_recommendation text not null,
  created_at timestamptz not null default now()
);

-- Lock every table down by default: only the service_role key (used
-- server-side only, never shipped to the browser) can read or write.
-- The anon key gets zero access unless you explicitly add a policy.
alter table players enable row level security;
alter table clubs enable row level security;
alter table sponsors enable row level security;
