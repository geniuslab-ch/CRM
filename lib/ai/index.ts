import { AIProvider } from "./provider";
import { mockAI } from "./providers/mock";

// Central switch: flip NEXT_PUBLIC_AI_MODE=live once a real provider is
// implemented in providers/claude.ts. Everything else in the app calls
// getAIProvider() and never imports a concrete provider directly.
export function getAIProvider(): AIProvider {
  return mockAI;
}

export * from "./provider";
