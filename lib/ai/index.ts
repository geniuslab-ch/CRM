import "server-only";
import { AIProvider } from "./provider";
import { mockAI } from "./providers/mock";

// Central switch — server-side only. Client components must never import
// this file directly (it can construct a real Anthropic client); they call
// the route handlers under /app/api/ai/*, which import getAIProvider() here.
//
// Set NEXT_PUBLIC_AI_MODE=live and ANTHROPIC_API_KEY to use the real Claude
// provider. Any other value (or a missing key) falls back to MockAIProvider
// so the app always runs.
let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const live = process.env.NEXT_PUBLIC_AI_MODE === "live" && Boolean(process.env.ANTHROPIC_API_KEY);

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
