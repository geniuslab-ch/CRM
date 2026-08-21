// AI Provider interface — the contract every AI backend must satisfy.
// Swap `MockAIProvider` for a real `ClaudeAIProvider` (see providers/claude.ts)
// without changing any calling code: everything above this layer only
// depends on `AIProvider`, never on a concrete implementation.

export interface OutreachRequest {
  targetName: string;
  organization: string;
  researchInsight: string;
  personalizationAngle: string;
  category: "PLAYER" | "CLUB" | "SPONSOR" | "MEDIA";
}

export interface OutreachResult {
  researchInsight: string;
  personalizationAngle: string;
  message: string;
}

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
  generateOutreach(req: OutreachRequest): Promise<OutreachResult>;
  classifyReply(replyText: string): Promise<ClassificationResult>;
  generateContentIdea(trigger: string): Promise<ContentIdeaDraft>;
}
