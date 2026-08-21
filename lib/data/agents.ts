import { Agent, AgentTask } from "@/types";
import { makeRng } from "./seed";
import { players } from "./players";
import { clubs } from "./clubs";
import { sponsors } from "./sponsors";
import { conversations } from "./conversations";
import { meetings } from "./meetings";
import { contentOpportunities } from "./content";

const rng = makeRng(8800);

const playerActivity: AgentTask[] = [
  { id: "act-pr-1", agentId: "player-recruiter", summary: "Identified 5 new player candidates in Geneva.", timestamp: rng.daysAgoISO(2, 0), reasoning: "High street-relevance scores from social scouting pass." },
  { id: "act-pr-2", agentId: "player-recruiter", summary: "Scored Lucas Martin 92/100 — flagged as high priority.", timestamp: rng.daysAgoISO(3, 1), reasoning: "Strong technical score and 8.4k social audience." },
  { id: "act-pr-3", agentId: "player-recruiter", summary: "Updated status for 3 players to CONTACTED.", timestamp: rng.daysAgoISO(4, 1) },
];

const clubActivity: AgentTask[] = [
  { id: "act-cf-1", agentId: "club-finder", summary: "Identified FC Bulle as a new player-recruitment target.", timestamp: rng.daysAgoISO(3, 0), reasoning: "Club has an active U21 squad with strong street-football crossover." },
  { id: "act-cf-2", agentId: "club-finder", summary: "Logged 2 clubs as INTERESTED after outreach follow-up.", timestamp: rng.daysAgoISO(5, 1) },
];

const sponsorFinderActivity: AgentTask[] = [
  { id: "act-sf-1", agentId: "sponsor-finder", summary: "Identified a Swiss sports retailer as a new prospect.", timestamp: rng.daysAgoISO(1, 0), reasoning: "High audience overlap with Panna League's youth demographic." },
  { id: "act-sf-2", agentId: "sponsor-finder", summary: "Scored Decathlon Switzerland 94/100 sponsor fit.", timestamp: rng.daysAgoISO(2, 0) },
  { id: "act-sf-3", agentId: "sponsor-finder", summary: "Found marketing director contact at 3 new prospects.", timestamp: rng.daysAgoISO(3, 1) },
];

const researcherActivity: AgentTask[] = [
  { id: "act-rs-1", agentId: "sponsor-researcher", summary: "Researched On Running — found recent youth campaign launch.", timestamp: rng.daysAgoISO(2, 0), reasoning: "Recent marketing activity signals active sponsorship budget." },
  { id: "act-rs-2", agentId: "sponsor-researcher", summary: "Completed research brief for 4 new sponsor prospects.", timestamp: rng.daysAgoISO(4, 1) },
];

const outreachActivity: AgentTask[] = [
  { id: "act-oa-1", agentId: "outreach", summary: "Generated personalized outreach for 6 sponsor prospects.", timestamp: rng.daysAgoISO(1, 0) },
  { id: "act-oa-2", agentId: "outreach", summary: "Drafted follow-up sequence for 4 unresponsive clubs.", timestamp: rng.daysAgoISO(3, 1) },
];

const conversationActivity: AgentTask[] = [
  { id: "act-cm-1", agentId: "conversation-manager", summary: "Classified 4 new replies — 2 INTERESTED, 1 NEEDS_INFORMATION, 1 OBJECTION.", timestamp: rng.daysAgoISO(1, 0) },
];

const bookingActivity: AgentTask[] = [
  { id: "act-bk-1", agentId: "booking", summary: "Qualified 2 sponsor opportunities from conversation signals.", timestamp: rng.daysAgoISO(2, 0), reasoning: "Detected buying intent phrase 'let's discuss numbers'." },
  { id: "act-bk-2", agentId: "booking", summary: "Booked a meeting with Zurich Insurance for Thursday 14:00.", timestamp: rng.daysAgoISO(3, 0) },
];

const contentActivity: AgentTask[] = [
  { id: "act-ct-1", agentId: "content", summary: "Generated 8 content opportunities from this week's activity.", timestamp: rng.daysAgoISO(1, 0) },
  { id: "act-ct-2", agentId: "content", summary: "Flagged a sponsor activation reel opportunity for Decathlon.", timestamp: rng.daysAgoISO(2, 0) },
];

const researchedSponsors = sponsors.filter((s) => s.stage !== "PROSPECT").length;
const outreachSent = sponsors.filter((s) => !["PROSPECT", "RESEARCH"].includes(s.stage)).length;
const qualifiedMeetings = meetings.length;
const avgSponsorScore = Math.round(
  sponsors.reduce((sum, s) => sum + s.fit.overall, 0) / sponsors.length
);
const potentialPipeline = sponsors
  .filter((s) => !["LOST"].includes(s.stage))
  .reduce((sum, s) => sum + s.potentialValue, 0);

export const agents: Agent[] = [
  {
    id: "player-recruiter",
    name: "Player Recruiter",
    role: "Finds and scores potential Panna players across Switzerland.",
    status: "ACTIVE",
    headline: `${players.length} prospects analyzed`,
    tasksCompleted: 94,
    metricLabel: "Players identified",
    metricValue: String(players.length),
    averageScore: Math.round(players.reduce((s, p) => s + p.playerScore, 0) / players.length),
    recentActivity: playerActivity,
    reasoningExamples: [
      "High-priority recruitment target — elite technical score and strong local audience.",
      "Street-relevance score outweighs raw technical ability for panna-specific formats.",
      "Local relevance matters — a Lausanne-based player has outsized value for the launch event.",
    ],
    color: "primary",
  },
  {
    id: "club-finder",
    name: "Club Finder",
    role: "Identifies football clubs that can supply players or become partners.",
    status: "ACTIVE",
    headline: `${clubs.length} clubs identified`,
    tasksCompleted: 61,
    metricLabel: "Clubs identified",
    metricValue: String(clubs.length),
    recentActivity: clubActivity,
    reasoningExamples: [
      "Leads with player recruitment, not commercial partnership, on first contact.",
      "Prioritizes clubs with active youth squads for street-football crossover.",
    ],
    color: "accent",
  },
  {
    id: "sponsor-finder",
    name: "Sponsor Finder",
    role: "Identifies companies that could sponsor Panna League and scores fit.",
    status: "ACTIVE",
    headline: `${sponsors.length} prospects found`,
    tasksCompleted: 128,
    metricLabel: "Prospects found",
    metricValue: String(sponsors.length),
    averageScore: avgSponsorScore,
    potentialPipeline,
    recentActivity: sponsorFinderActivity,
    reasoningExamples: [
      "High audience overlap with Panna League's core demographic drives fit score up.",
      "Existing sports sponsorships are a positive signal for activation readiness.",
    ],
    color: "primary",
  },
  {
    id: "sponsor-researcher",
    name: "Researcher",
    role: "Builds a deep company brief for every sponsor prospect.",
    status: "ACTIVE",
    headline: `${researchedSponsors} companies researched`,
    tasksCompleted: 73,
    metricLabel: "Companies researched",
    metricValue: String(researchedSponsors),
    recentActivity: researcherActivity,
    reasoningExamples: [
      "Recent youth campaign launches signal active marketing budget and timing.",
      "Swiss presence and existing sponsorships shape the recommended package tier.",
    ],
    color: "info",
  },
  {
    id: "outreach",
    name: "Outreach",
    role: "Writes personalized, on-brand outreach for every qualified contact.",
    status: "ACTIVE",
    headline: `${outreachSent} messages generated`,
    tasksCompleted: 102,
    metricLabel: "Messages generated",
    metricValue: String(outreachSent),
    recentActivity: outreachActivity,
    reasoningExamples: [
      "Never sends generic messages — always references specific company research.",
      "Matches Panna League's bold, urban tone while staying professional.",
    ],
    color: "accent",
  },
  {
    id: "conversation-manager",
    name: "Conversation Manager",
    role: "Classifies incoming replies and recommends the next action.",
    status: "WAITING",
    headline: `${conversations.length} conversations tracked`,
    tasksCompleted: 88,
    metricLabel: "Conversations tracked",
    metricValue: String(conversations.length),
    recentActivity: conversationActivity,
    reasoningExamples: [
      "'Can you send more information' classifies as NEEDS_INFORMATION, not INTERESTED.",
      "Objections about budget are routed to a scaled-down package suggestion.",
    ],
    color: "warning",
  },
  {
    id: "booking",
    name: "Booking Agent",
    role: "Detects buying intent and schedules qualified meetings.",
    status: "RUNNING",
    headline: `${qualifiedMeetings} qualified`,
    tasksCompleted: 34,
    metricLabel: "Meetings booked",
    metricValue: String(qualifiedMeetings),
    recentActivity: bookingActivity,
    reasoningExamples: [
      "Phrases like 'let's discuss' or 'send a proposal' trigger qualification.",
      "Suggests the earliest 3 mutually available slots to reduce back-and-forth.",
    ],
    color: "success",
  },
  {
    id: "content",
    name: "Content Agent",
    role: "Turns event activity into a content calendar across platforms.",
    status: "ACTIVE",
    headline: `${contentOpportunities.length} content ideas`,
    tasksCompleted: 57,
    metricLabel: "Content ideas",
    metricValue: String(contentOpportunities.length),
    recentActivity: contentActivity,
    reasoningExamples: [
      "Every player win becomes a short-form clip within the same content cycle.",
      "Sponsor integrations are only suggested where the activation is a natural fit.",
    ],
    color: "info",
  },
];

export const allAgentActivity: AgentTask[] = [
  ...playerActivity,
  ...clubActivity,
  ...sponsorFinderActivity,
  ...researcherActivity,
  ...outreachActivity,
  ...conversationActivity,
  ...bookingActivity,
  ...contentActivity,
].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
