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

**AI provider interface** (`lib/ai/provider.ts`) is implemented today by `MockAIProvider` (`lib/ai/providers/mock.ts`) and can be swapped for `ClaudeAIProvider` (`lib/ai/providers/claude.ts`, stubbed) by changing one function: `getAIProvider()` in `lib/ai/index.ts`. No calling code needs to change.

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

Key variable: `NEXT_PUBLIC_AI_MODE` — `mock` (default) or `live` (requires implementing `lib/ai/providers/claude.ts`).

## 8. Mock AI mode

Every "AI" behavior in this prototype — scoring, research, outreach generation, reply classification, content ideation — runs through deterministic, seeded demo data (`lib/data/*`) or the `MockAIProvider`. This means:

- The app looks and behaves identically for every visitor and every reload (great for demos).
- Nothing calls an external API, so there is nothing to configure and nothing that can fail due to rate limits or missing keys.
- Every "Send" action (outreach, conversation replies) is explicitly labeled **mock** in the UI — no real message is ever sent anywhere.

## 9. Real AI integration roadmap

To move from prototype to production:

1. Implement `ClaudeAIProvider` in `lib/ai/providers/claude.ts` using `@anthropic-ai/sdk`, and flip `NEXT_PUBLIC_AI_MODE=live`.
2. Replace the static generators in `lib/data/*` with real data sources (a database, a prospect API) behind the same TypeScript types in `types/index.ts` — the UI never needs to change.
3. Implement the integration interfaces already stubbed in `lib/integrations/`:
   - `calendar.ts` → Google Calendar (real meeting booking for the Booking Agent)
   - `email.ts` → Gmail API (real sending for the Outreach Agent)
   - `crm.ts` → HubSpot/Pipedrive-compatible sync
   - `research.ts` → a web research or Apollo-style prospect API
   - `social.ts` → Instagram/TikTok/YouTube/LinkedIn publishing APIs
4. Add authentication and persistence (the prototype is stateless/in-memory by design).
5. Wire the Analytics page to real event tracking instead of derived demo numbers.

## 10. Project structure

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

## 11. Deployment

The app is a standard Next.js project and deploys to any Next.js-compatible host (Vercel, Netlify, a Node server, Docker).

```bash
npm run build
npm run start
```

For Vercel: connect the repository and deploy — no environment variables are required for the default (mock) mode.

## 12. GitHub instructions

```bash
git init
git add .
git commit -m "Initial Panna League AI Command Center"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
git push -u origin main
```

## 13. Future roadmap

1. Connect a real Claude API key and implement `ClaudeAIProvider` for live research, outreach and classification.
2. Persist data in a real database and add authentication for multi-organizer use.
3. Wire real calendar, email and CRM integrations so Booking/Outreach agents take real-world actions.
4. Connect social publishing APIs so the Content Agent can schedule and publish directly.
5. Add real-time analytics ingestion so the Analytics page reflects live event and campaign performance.

---

Built as a functional, demo-ready prototype — every page, table, board and agent described in the product brief is implemented and populated with realistic Swiss demo data.
