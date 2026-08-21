// Real AI provider stub — wire this up to swap MockAIProvider for live
// Claude API calls without changing any calling code.
//
// To activate:
//   1. Set ANTHROPIC_API_KEY in .env.local
//   2. Set NEXT_PUBLIC_AI_MODE=live
//   3. Implement the methods below using @anthropic-ai/sdk
//
// This file intentionally ships unimplemented — the app runs entirely on
// MockAIProvider until you connect a real key.

import { AIProvider, ClassificationResult, OutreachRequest, OutreachResult } from "../provider";

export class ClaudeAIProvider implements AIProvider {
  readonly name = "Claude AI";
  readonly isMock = false;

  constructor(private apiKey: string) {}

  async generateOutreach(_req: OutreachRequest): Promise<OutreachResult> {
    throw new Error(
      "ClaudeAIProvider is not implemented yet. Add @anthropic-ai/sdk and implement generateOutreach(), or keep NEXT_PUBLIC_AI_MODE=mock."
    );
  }

  async classifyReply(_replyText: string): Promise<ClassificationResult> {
    throw new Error(
      "ClaudeAIProvider is not implemented yet. Add @anthropic-ai/sdk and implement classifyReply(), or keep NEXT_PUBLIC_AI_MODE=mock."
    );
  }

  async generateContentIdea(_trigger: string): Promise<string> {
    throw new Error(
      "ClaudeAIProvider is not implemented yet. Add @anthropic-ai/sdk and implement generateContentIdea(), or keep NEXT_PUBLIC_AI_MODE=mock."
    );
  }
}
