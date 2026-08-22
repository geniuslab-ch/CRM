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
  created_at timestamptz not null default now(),
  age_group text,
  contact_email text,
  contact_phone text,
  instagram text,
  tiktok text,
  signup_note text,
  signup_source text,
  position_note text,
  nominated_by text
);

-- Safe to run against an already-created players table too — adds the
-- columns the public signup endpoint (app/api/public/player-signup)
-- writes to for real player-form / signal-campaign / nomination submissions.
alter table players add column if not exists age_group text;
alter table players add column if not exists contact_email text;
alter table players add column if not exists contact_phone text;
alter table players add column if not exists instagram text;
alter table players add column if not exists tiktok text;
alter table players add column if not exists signup_note text;
alter table players add column if not exists signup_source text;
alter table players add column if not exists position_note text;
alter table players add column if not exists nominated_by text;

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
  created_at timestamptz not null default now(),
  contact_phone text,
  organisation_type text,
  instagram text,
  tiktok text,
  inquiry_message text,
  signup_source text,
  kind text not null default 'CLUB'
);

-- Safe to run against an already-created clubs table too — adds the
-- columns the public signup endpoint (app/api/public/club-signup)
-- writes to for real partnership-form submissions.
alter table clubs add column if not exists contact_phone text;
alter table clubs add column if not exists organisation_type text;
alter table clubs add column if not exists instagram text;
alter table clubs add column if not exists tiktok text;
alter table clubs add column if not exists inquiry_message text;
alter table clubs add column if not exists signup_source text;

-- CLUB or SCHOOL — a real, top-level distinction, not just a label.
-- Schools get their own outreach tone/copy (a PE-department pitch, not a
-- "does your club have what it takes" challenge) and their own filter on
-- the Clubs page, while sharing the same table/pipeline/booking/contacts
-- machinery since the underlying record shape is identical.
alter table clubs add column if not exists kind text not null default 'CLUB';

-- Up to 3 real contacts: jsonb array of {name, email, role?, isPrimary}.
-- contact_name/contact_email above always mirror whichever one is
-- primary (kept in sync on every write), so every existing feature that
-- reads them keeps working unchanged. Backfills every existing club to a
-- single-entry contacts array from its current contact_name/contact_email
-- so nothing is lost.
alter table clubs add column if not exists contacts jsonb not null default '[]'::jsonb;
update clubs
set contacts = jsonb_build_array(jsonb_build_object('name', contact_name, 'email', contact_email, 'isPrimary', true))
where contacts = '[]'::jsonb and contact_email <> '';

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
  activation jsonb,
  created_at timestamptz not null default now()
);

-- Safe to run against an already-created sponsors table too.
alter table sponsors add column if not exists activation jsonb;
-- Free text: what was actually agreed with this sponsor (real negotiated
-- terms — not the generated proposal tier, which can drift from what a
-- real email back-and-forth settled on). Feeds the "suggest content ideas
-- from this deal" AI action. Null until the organizer fills it in.
alter table sponsors add column if not exists deal_terms text;

-- Up to 3 real contacts: jsonb array of {name, email, role?, isPrimary}.
-- research->'contactPerson' above always mirrors whichever one is
-- primary (kept in sync on every write), so every existing feature that
-- reads it keeps working unchanged. Backfills every existing sponsor to
-- a single-entry contacts array from its current research.contactPerson
-- so nothing is lost.
alter table sponsors add column if not exists contacts jsonb not null default '[]'::jsonb;
update sponsors
set contacts = jsonb_build_array(jsonb_build_object(
  'name', research->'contactPerson'->>'name',
  'email', research->'contactPerson'->>'email',
  'role', research->'contactPerson'->>'role',
  'isPrimary', true
))
where contacts = '[]'::jsonb and coalesce(research->'contactPerson'->>'email', '') <> '';

-- Activity log — one row per real message, either direction. Outbound rows
-- (direction='OUTBOUND') are messages actually sent through the app.
-- Inbound rows (direction='INBOUND') are real replies pulled in by the
-- inbox poller (see app/api/cron/poll-inbox) and classified by Claude —
-- never fabricated. gmail_message_id dedupes so a poll never double-logs
-- the same email. Rows sharing related_id are grouped into one thread by
-- getConversations().
create table if not exists conversations (
  id text primary key,
  contact_name text not null,
  organization text not null,
  category text not null,
  related_id text,
  message text not null,
  created_at timestamptz not null default now(),
  direction text not null default 'OUTBOUND',
  from_email text,
  gmail_message_id text unique,
  gmail_thread_id text,
  classification text,
  recommended_action text,
  ai_draft_response text,
  unread boolean not null default false
);

alter table conversations add column if not exists direction text not null default 'OUTBOUND';
alter table conversations add column if not exists from_email text;
alter table conversations add column if not exists gmail_message_id text unique;
alter table conversations add column if not exists gmail_thread_id text;
alter table conversations add column if not exists classification text;
alter table conversations add column if not exists recommended_action text;
alter table conversations add column if not exists ai_draft_response text;
alter table conversations add column if not exists unread boolean not null default false;

-- Single-row table tracking the inbox poller's last successful run, so
-- each poll only asks Gmail for messages received since then instead of
-- re-scanning the whole inbox every time.
create table if not exists inbox_poll_state (
  id int primary key default 1,
  last_polled_at timestamptz not null default (now() - interval '1 day'),
  constraint inbox_poll_state_singleton check (id = 1)
);
insert into inbox_poll_state (id) values (1) on conflict (id) do nothing;

-- Real log — one row per meeting actually booked on the connected Google
-- Calendar, either by the organizer (via the Sponsor/Club detail page) or
-- by the contact themselves (via their own public /book/[category]/[id]
-- link). Never written for a mock (no-calendar-connected) booking.
create table if not exists meetings (
  id text primary key,
  contact_name text not null,
  organization text not null,
  category text not null,
  related_id text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text,
  event_link text,
  created_at timestamptz not null default now(),
  booked_by text not null default 'ORGANIZER'
);

alter table meetings add column if not exists booked_by text not null default 'ORGANIZER';

-- Content ideas actually generated by the Content Agent (Claude) and
-- saved by the organizer. Status/scheduling are tracked manually;
-- performance stays null until entered manually — no analytics API is
-- connected, so it's never fabricated.
create table if not exists content_ideas (
  id text primary key,
  title text not null,
  platform text not null,
  trigger text not null,
  hook text not null,
  caption text not null,
  cta text not null,
  suggested_footage text not null,
  sponsor_integration text,
  status text not null default 'IDEA',
  scheduled_date timestamptz,
  performance jsonb,
  created_at timestamptz not null default now()
);

-- Real events — the Event Control Center's data. Player/club/sponsor
-- recruitment isn't split per event yet (there's one shared pipeline), so
-- confirmed-count stats are only shown for the "primary" event (exactly
-- one row with is_primary = true) — any other event honestly starts at
-- zero confirmed rather than reusing or guessing numbers. checklist is a
-- jsonb array of {id, label, done}, toggled for real from the CRM.
create table if not exists events (
  id text primary key,
  name text not null,
  city text not null,
  venue text,
  event_date date,
  status text not null default 'PRE_LAUNCH',
  player_target int not null default 32,
  club_target int not null default 10,
  sponsor_target int not null default 8,
  digital_audience_target int not null default 10000,
  checklist jsonb not null default '[]'::jsonb,
  is_primary boolean not null default false,
  edition int,
  created_at timestamptz not null default now()
);

-- Safe to run against an already-created events table too. Nullable —
-- the marketing site shows "TBD" for an event until the organizer sets a
-- real edition number, rather than inventing one.
alter table events add column if not exists edition int;

-- The one real event this whole CRM has been built around so far —
-- Panna League First, Lausanne. Format (32 players / 1v1) and targets are
-- real organizer goals, not measurements; date/venue stay null (genuinely
-- TBD) until set for real from the Event Control Center. It's genuinely
-- the first edition.
insert into events (id, name, city, venue, event_date, status, player_target, club_target, sponsor_target, digital_audience_target, is_primary, edition)
values ('event-lausanne-001', 'Panna League First', 'Lausanne', null, null, 'PRE_LAUNCH', 32, 10, 8, 10000, true, 1)
on conflict (id) do nothing;

-- Backfills edition = 1 on the Lausanne row for installs where it
-- already existed before the edition column was added (the insert above
-- is skipped on conflict, so it wouldn't otherwise get set).
update events set edition = 1 where id = 'event-lausanne-001' and edition is null;

-- Lock every table down by default: only the service_role key (used
-- server-side only, never shipped to the browser) can read or write.
-- The anon key gets zero access unless you explicitly add a policy.
alter table players enable row level security;
alter table clubs enable row level security;
alter table sponsors enable row level security;
alter table conversations enable row level security;
alter table meetings enable row level security;
alter table content_ideas enable row level security;
alter table inbox_poll_state enable row level security;
alter table events enable row level security;
