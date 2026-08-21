# Panna League AI Command Center

**One human. An AI team.**

An internal AI operating system for launching, running and growing a Swiss Panna football league — recruiting players, finding sponsors, building club partnerships, managing conversations, and turning the event into a media property, all from one command center.

The application runs **entirely on mock data and a mock AI provider** — no API keys required. It is architected so real integrations (Claude, a research API, a calendar, a CRM, social platforms) can be dropped in later without touching the UI layer.

---

## 1. Product overview

Panna League is a competitive 1v1 / small-sided street-football competition. The organizer should be able to say:

> "I need 32 players, 3 sponsors, 5 club partners and 10,000 digital viewers."

...and have an AI team identify, research, contact, follow up on and track those opportunities — while a human stays in the loop for every approval and send.

## 2. Features

- **Dashboard** — hero, KPI grid, live event summary, AI Team status panel, a "RUN AI TEAM" simulation, and an investor-ready Demo Mode.
- **Player Database** — 50 scouted players, AI player score (technical, experience, street relevance, social audience, local relevance, competitive potential), status pipeline, search & filters.
- **Club Database** — 20 clubs with a recruitment-first pipeline (`IDENTIFIED → CONTACTED → INTERESTED → PLAYERS_PROPOSED → CONFIRMED → PARTNER`), clearly separating player recruitment from commercial partnership.
- **Sponsor CRM** — a 10-stage Kanban board (`PROSPECT → RESEARCH → CONTACTED → REPLIED → INTERESTED → MEETING → PROPOSAL → NEGOTIATION → WON/LOST`) across 50 sponsor prospects.
- **Sponsor Detail Page** — sponsor fit score, full company research, "Why Panna League?", brand alignment breakdown, activation opportunities, a Commercial Opportunity Generator (proposal builder with edit/save/export), an Outreach Agent composer (research → personalization → message → approve/send), and communication history.
- **Conversation Center** — a unified inbox across players, clubs, sponsors and media, with AI classification, recommended next action, and an editable AI-drafted reply (approve / edit / send-mock).
- **Content Command Center** — content opportunities generated from event triggers (player wins, milestones, sponsor activations), a weekly content calendar, and performance stats.
- **Analytics** — recruitment funnels (players, clubs, sponsors), content performance, and AI productivity per agent.
- **Event Control Center** — event snapshot and an interactive launch-readiness checklist.
- **AI Team** — a page per agent (status, tasks completed, key metric, reasoning examples, recent activity).
- **Settings** — brand voice configuration and the shared AI memory layer every agent reads from.

## 3. AI agent architecture

Eight specialist agents share one memory layer — this is **one AI organization**, not eight disconnected chatbots.

| Agent | Role |
|---|---|
| Player Recruiter | Finds and scores potential Panna players |
| Club Finder | Finds clubs that can supply players or become partners |
| Sponsor Finder | Finds and scores companies that could sponsor the league |
| Researcher | Builds a full company brief for every sponsor prospect |
| Outreach | Writes personalized, on-brand outreach — never generic |
| Conversation Manager | Classifies replies and recommends the next action |
| Booking Agent | Detects buying intent and simulates meeting scheduling |
| Content Agent | Turns event activity into a cross-platform content calendar |

**Shared memory** (`lib/data/brand.ts`) holds the event description, target audience, brand voice, and messaging rules (e.g. "always lead club outreach with player recruitment, never a commercial ask") that every agent reads before acting.

**Orchestrator** (`lib/ai/orchestrator.ts`) is the seam where a real task/workflow engine plugs in later. It's a deterministic state machine today, e.g.:

```
New sponsor prospect
  → Sponsor Finder
  → Researcher
  → Outreach
  → Conversation Manager (classification + objection handling)
  → Booking Agent
  → CRM stage update
```

**AI provider interface** (`lib/ai/provider.ts`) has two implementations: `MockAIProvider` (`lib/ai/providers/mock.ts`, the default) and a fully working `ClaudeAIProvider` (`lib/ai/providers/claude.ts`) that calls the real Claude API. `getAIProvider()` in `lib/ai/index.ts` picks between them based on `NEXT_PUBLIC_AI_MODE` and whether `ANTHROPIC_API_KEY` is set — see §9. Both are server-only (`import "server-only"`); the browser only ever calls the `/app/api/ai/*` Route Handlers, never a provider directly.

## 4. Tech stack

- **Next.js 14** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** with a small hand-rolled shadcn/ui-style component set (`components/ui`)
- **Lucide React** for icons
- **Recharts** for analytics charts
- **Framer Motion** for the Run AI Team simulation and micro-interactions

No backend, database, or paid API is required to run the prototype.

## 5. Installation

```bash
npm install
```

## 6. Running locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run lint    # ESLint
npm run build   # production build
npm run start   # run the production build
```

## 7. Environment variables

Copy `.env.example` to `.env.local` if you want to start wiring up real integrations. **The app runs with zero environment variables set.**

```bash
cp .env.example .env.local
```

Key variable: `NEXT_PUBLIC_AI_MODE` — `mock` (default) or `live`.

## 8. Mock AI mode

Every "AI" behavior in this prototype — scoring, research, reply classification, content ideation — runs through deterministic, seeded demo data (`lib/data/*`) or the `MockAIProvider` by default. This means:

- The app looks and behaves identically for every visitor and every reload (great for demos).
- Nothing calls an external API, so there is nothing to configure and nothing that can fail due to rate limits or missing keys.
- Every "Send" action (outreach, conversation replies) is explicitly labeled **mock** in the UI — no real message is ever sent anywhere.

## 9. Real AI mode (Claude API) — already wired up

`lib/ai/providers/claude.ts` is a **working implementation**, not a stub — it calls the real Claude API via `@anthropic-ai/sdk` for outreach generation, reply classification and content ideation. To turn it on:

1. Get an API key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) (new accounts get a small free credit grant; usage beyond that is pay-per-token — see cost note below).
2. In `.env.local`, set:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_AI_MODE=live
   ```
3. Restart `npm run dev`. The Sponsor Detail page's Outreach Agent now calls Claude and shows **"via Claude AI"** on the generated message instead of "via Mock AI".

**Why this required a server route, not just a provider swap:** an API key must never reach the browser. `lib/ai/providers/claude.ts` and `lib/ai/index.ts` are marked `import "server-only"` — Next.js will fail the build if a client component ever imports them. Client components instead call `POST /app/api/ai/outreach` (and `/api/ai/classify`, `/api/ai/content-idea`, wired for future use), a server Route Handler that reads `ANTHROPIC_API_KEY` from `process.env` and returns only the result. If `NEXT_PUBLIC_AI_MODE` isn't `live` or the key is missing, `getAIProvider()` transparently falls back to `MockAIProvider` — the app never breaks from a missing key.

**Model & cost:** defaults to `claude-opus-5` (override with `ANTHROPIC_MODEL`, e.g. `claude-sonnet-5` for a cheaper/faster option well-suited to this kind of short text generation — see pricing in the Anthropic docs). Each outreach message is a few hundred input/output tokens, so cost per generation is a small fraction of a cent to a few cents depending on the model.

## 10. Real AI integration roadmap — what's left

1. ~~Implement `ClaudeAIProvider`~~ — done (`lib/ai/providers/claude.ts`, see §9).
2. Replace the static generators in `lib/data/*` with a real database behind the same TypeScript types in `types/index.ts` — the UI never needs to change. See §11 below for a concrete plan.
3. Implement the integration interfaces already stubbed in `lib/integrations/`:
   - ~~`calendar.ts` → Google Calendar~~ — done, see §12.
   - ~~`email.ts` → Gmail API~~ — done, see §12.
   - `crm.ts` → HubSpot/Pipedrive-compatible sync (optional — see §13, the app's own Sponsor CRM usually covers this)
   - `research.ts` → a web research or Apollo-style prospect API
   - `social.ts` → Instagram/TikTok/YouTube/LinkedIn publishing APIs (see §14)
4. Add authentication and persistence (the prototype is stateless/in-memory by design).
5. Wire the Analytics page to real event tracking instead of derived demo numbers.

## 11. Adding a real database (players, clubs, sponsors)

The app currently generates `Player[]`, `Club[]`, `Sponsor[]` in memory (`lib/data/players.ts`, `clubs.ts`, `sponsors.ts`) using the types in `types/index.ts`. To persist real data:

1. **Pick a free-tier Postgres host** — [Neon](https://neon.tech) or [Supabase](https://supabase.com) both have a free tier that's plenty for this app's scale (tens of thousands of rows). Supabase additionally gives you a hosted auth system and a browsable table UI if you want that later.
2. **Add [Prisma](https://www.prisma.io) as the ORM** (`npm install prisma @prisma/client`, `npx prisma init`). Define models that mirror the existing types, e.g.:
   ```prisma
   model Player {
     id             String   @id @default(cuid())
     name           String
     age            Int
     city           String
     club           String?
     position       String
     playerScore    Int
     socialAudience Int
     status         String
     lastContact    DateTime?
     aiRecommendation String
     aiWhy          String
   }
   ```
   (Do the same for `Club` and `Sponsor`, matching `types/index.ts`.)
3. **Point `DATABASE_URL`** (add this var to `.env.local`) at the free-tier connection string, run `npx prisma migrate dev` to create the tables, optionally `npx prisma db seed` using the existing generators in `lib/data/*` as seed data.
4. **Swap the data layer, not the UI**: replace the exported arrays in `lib/data/players.ts` etc. with async functions backed by `prisma.player.findMany()` and convert the pages that import them (`app/players/page.tsx`, `app/clubs/page.tsx`, `app/sponsors/page.tsx`, `app/sponsors/[id]/page.tsx`) to `async function Page()` components that `await` the query — Next.js Server Components support this natively, no client-side data-fetching needed.
5. Add write actions (confirm a player, move a sponsor stage, log a contact) as [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) that call `prisma.<model>.update(...)`.

This is a few hours of focused work, not a rebuild — the types and every page/component already assume this exact shape.

## 12. Real Calendar & Gmail (Google) — already wired up

`lib/integrations/calendar.ts` and `lib/integrations/email.ts` are working implementations, not stubs. They compute real free/busy slots and create real Calendar events and Gmail sends via `googleapis`, using a single organizer's OAuth refresh token — the right model for a one-person tool (no per-visitor Google login flow). To turn them on:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), enable the **Google Calendar API** and **Gmail API**, then create an OAuth **Desktop app** client. Put its Client ID/Secret in `.env.local` as `GOOGLE_CALENDAR_CLIENT_ID` / `GOOGLE_CALENDAR_CLIENT_SECRET`.
2. Run `npm run google:auth` locally. It prints a URL — open it, sign in with the Google account Panna League should use, approve access. The script then prints a `GOOGLE_REFRESH_TOKEN` line; paste it into `.env.local`.
3. Restart the dev server. `getCalendarProvider()` / `getEmailProvider()` (in `lib/integrations/calendar.ts` / `email.ts`) now return the real Google-backed classes instead of the mocks — no other code changes needed.

Available now as server routes (not yet wired to a UI control, same as `/api/ai/classify`): `GET /api/calendar/slots` (real free/busy for the next 7 business days), `POST /api/calendar/book`, `POST /api/email/send`. This step 2 (`npm run google:auth`) can't be done from inside an AI session — it needs your interactive Google login in a real browser — everything else is already built.

## 13. Which pieces are free to wire up

| Integration | Free tier? |
|---|---|
| Database (Neon / Supabase Postgres) | Yes — generous free tier, no card required for Neon |
| Google Calendar API | Yes — free, generous quota, just needs OAuth consent setup |
| Gmail API (sending) | Yes — free, daily send-quota limits apply |
| External CRM (HubSpot etc.) | Optional — the app's own Sponsor CRM page (Kanban, stages, notes) already is the CRM for this use case. Only wire an external one if you need to sync with a separate sales team's tool. If you do: HubSpot's private-app tokens require org superadmin — either ask your org admin, or sign up a brand-new free HubSpot account (you're automatically admin there), or use Pipedrive/Zoho's free tiers instead. |
| YouTube Data API | Yes — free, with a daily quota |
| Instagram/Facebook Graph API (posting) | Free to use, but requires a Meta Business/Developer account and App Review before it can post on behalf of a real Page |
| TikTok API | Free to use, but requires a developer application and app review before publishing is unlocked |
| LinkedIn API (posting) | Requires LinkedIn Marketing Developer Platform partner approval — not self-serve |
| Anthropic Claude API | **Not free ongoing** — new accounts get a small free credit grant, then pay-per-token (see §9) |

Net: the database and calendar/email/CRM integrations are realistically free to build today. Social **publishing** APIs are free of charge but gated by each platform's developer approval process (see §14) — budget days-to-weeks of lead time, not code time, for those.

## 14. Connecting social publishing

Each platform's real posting API sits behind the same interface already stubbed in `lib/integrations/social.ts` (`SocialProvider.publish(platform, caption)`), so wiring one in follows the same pattern as §9's Claude integration: implement it server-side, call it from a Route Handler, never expose tokens to the browser.

- **Instagram / Facebook** (Meta Graph API): create a Meta Developer app, convert the target Instagram account to a Business/Creator account linked to a Facebook Page, complete App Review for the `instagram_content_publish` permission, then post via `POST /{ig-user-id}/media` (create a media container) followed by `POST /{ig-user-id}/media_publish`.
- **TikTok**: register a TikTok for Developers app, apply for the Content Posting API scope (review required), then use their direct-post or upload endpoint with an OAuth access token obtained via TikTok Login Kit.
- **YouTube**: enable the YouTube Data API v3 in Google Cloud Console, use OAuth 2.0 (a channel owner must authorize your app), then call `videos.insert` to upload.
- **LinkedIn**: requires acceptance into the Marketing Developer Platform partner program before the Community Management API will let you post as a Page — plan for a manual approval step, not just a signup.

Store each platform's OAuth tokens server-side (env vars for a single organizer account, or a database table if you support multiple accounts later), implement `MockSocialProvider`'s real counterpart per platform, and swap it in the same way `getAIProvider()` switches between mock and live — behind one function, never scattered through the UI.

## 15. Project structure

```
/app                      Next.js App Router pages
  /players, /clubs, /sponsors, /sponsors/[id]
  /conversations, /content, /analytics, /event
  /agents, /agents/[id], /settings
/components
  /ui                     hand-rolled shadcn/ui-style primitives
  /layout                 sidebar, topbar, mobile nav, page header
  /dashboard              hero, KPI grid, AI team panel, Run AI Team, demo mode
  /players, /clubs, /sponsors, /conversations, /content, /analytics, /event
/lib
  /ai                     provider interface, mock + claude providers, orchestrator, run simulation
  /agents                 per-agent logic/metadata modules
  /data                   deterministic demo data generators (players, clubs, sponsors, …)
  /integrations           stubbed interfaces for calendar/email/CRM/research/social
  nav.ts, utils.ts
/types                    shared TypeScript domain types
```

## 16. Deployment

The app is a standard Next.js project and deploys to any Next.js-compatible host (Vercel, Netlify, a Node server, Docker).

```bash
npm run build
npm run start
```

For Vercel: connect the repository and deploy — no environment variables are required for the default (mock) mode.

## 17. GitHub instructions

```bash
git init
git add .
git commit -m "Initial Panna League AI Command Center"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

## 18. Future roadmap

1. ~~Connect a real Claude API key and implement `ClaudeAIProvider`~~ — done, see §9.
2. Persist data in a real database (§11) and add authentication for multi-organizer use.
3. ~~Wire real calendar and email integrations~~ — done, see §12. Wire a UI control (Booking Agent "confirm meeting" button, Outreach "send real email") to call the now-working `/api/calendar/*` and `/api/email/send` routes.
4. Connect social publishing APIs (§14) so the Content Agent can schedule and publish directly.
5. Add real-time analytics ingestion so the Analytics page reflects live event and campaign performance.

---

Built as a functional, demo-ready prototype — every page, table, board and agent described in the product brief is implemented and populated with realistic Swiss demo data.
