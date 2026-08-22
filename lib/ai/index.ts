import "server-only";
import { AIProvider } from "./provider";
import { mockAI } from "./providers/mock";

// Central switch — server-side only. Client components must never import
// this file directly (it can construct a real Anthropic client); they call
// the route handlers under /app/api/ai/*, which import getAIProvider() here.
//
// Live whenever ANTHROPIC_API_KEY is set — the same single rule every other
// AI feature in the app uses (see isProspectingConfigured/isActivationLabConfigured).
// Missing key falls back to MockAIProvider so the app always runs.
let cached: AIProvider | null = null;

export function isAIModeLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const live = isAIModeLive();

  if (live) {
    // Lazy require so the Anthropic SDK is never pulled in when running in
    // mock mode (keeps the mock path dependency-free and fast to cold start).
    const { ClaudeAIProvider } = require("./providers/claude") as typeof import("./providers/claude");
    cached = new ClaudeAIProvider();
  } else {
    cached = mockAI;
  }

  return cached;
}

export * from "./provider";
