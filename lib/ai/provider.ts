// AI Provider interface — the contract every AI backend must satisfy.
// Swap `MockAIProvider` for a real `ClaudeAIProvider` (see providers/claude.ts)
// without changing any calling code: everything above this layer only
// depends on `AIProvider`, never on a concrete implementation.

export interface ClassificationResult {
  classification: string;
  recommendedAction: string;
  confidence: number;
}

export interface ContentIdeaDraft {
  title: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "LinkedIn";
  hook: string;
  caption: string;
  cta: string;
  suggestedFootage: string;
  sponsorIntegration: string | null;
}

export interface AIProvider {
  readonly name: string;
  readonly isMock: boolean;
  classifyReply(replyText: string): Promise<ClassificationResult>;
  generateContentIdea(trigger: string): Promise<ContentIdeaDraft>;
}
