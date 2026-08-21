import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, ClassificationResult, OutreachRequest, OutreachResult } from "../provider";
import { brandVoice } from "@/lib/data/brand";

// Real AI provider — wired to the Claude API via the Anthropic SDK.
//
// SECURITY: this file imports "server-only" and must never be imported from
// a client component. It reads ANTHROPIC_API_KEY from the server
// environment (never a NEXT_PUBLIC_ variable). Client components call the
// Next.js route handlers under /app/api/ai/*, which import this file
// server-side and never expose the API key to the browser.
//
// Activate by setting ANTHROPIC_API_KEY and NEXT_PUBLIC_AI_MODE=live in
// your environment — see .env.example and README.md.

const DEFAULT_MODEL = "claude-opus-5";

function baseSystemPrompt(): string {
  return [
    `You are an AI teammate working for ${brandVoice.company}.`,
    brandVoice.description,
    `Tone: ${brandVoice.tone.join(", ")}.`,
    `Avoid: ${brandVoice.avoid.join(", ")}.`,
    `Preferred call to action when appropriate: "${brandVoice.preferredCta}"`,
  ].join(" ");
}

export class ClaudeAIProvider implements AIProvider {
  readonly name = "Claude AI";
  readonly isMock = false;
  private client: Anthropic;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    // With no apiKey passed, the SDK resolves ANTHROPIC_API_KEY (or an
    // `ant auth login` profile) from the environment automatically.
    this.client = new Anthropic(options?.apiKey ? { apiKey: options.apiKey } : {});
    this.model = options?.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  }

  async generateOutreach(req: OutreachRequest): Promise<OutreachResult> {
    const system = [
      baseSystemPrompt(),
      "Write a short, personalized outreach message (120-180 words) for the Outreach Agent.",
      "Never write a generic template — always reference the specific research insight and personalization angle given.",
      req.category === "CLUB"
        ? "This is a club — lead with player recruitment, never a commercial partnership ask."
        : req.category === "SPONSOR"
        ? "This is a sponsorship prospect — connect Panna League's audience and format to their brand goals."
        : "Write for a prospective player or media contact as appropriate.",
      "Return ONLY the message text — no preamble, no markdown, no quotation marks around it.",
    ].join(" ");

    const user = [
      `Recipient: ${req.targetName} at ${req.organization}.`,
      `Category: ${req.category}.`,
      `Research insight: ${req.researchInsight}`,
      `Personalization angle: ${req.personalizationAngle}`,
    ].join("\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
    });

    const message = extractText(response).trim();

    return {
      researchInsight: req.researchInsight,
      personalizationAngle: req.personalizationAngle,
      message: message || "(Claude returned an empty response — try again.)",
    };
  }

  async classifyReply(replyText: string): Promise<ClassificationResult> {
    const labels = [
      "INTERESTED",
      "NOT_INTERESTED",
      "NEEDS_INFORMATION",
      "SEND_PROPOSAL",
      "CALL_REQUEST",
      "OBJECTION",
      "FOLLOW_UP_LATER",
      "WRONG_PERSON",
    ];

    const system = [
      "You are the Conversation Manager agent for Panna League Switzerland.",
      `Classify the reply into exactly one of: ${labels.join(", ")}.`,
      "Then give one short, actionable recommended next step (under 20 words).",
      'Respond with ONLY a JSON object, no markdown, in this exact shape: {"classification": "...", "recommendedAction": "...", "confidence": 0.0}',
      "confidence is your certainty in the classification, between 0 and 1.",
    ].join(" ");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: replyText }],
    });

    const raw = extractText(response);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.classification === "string" && typeof parsed.recommendedAction === "string") {
          return {
            classification: parsed.classification,
            recommendedAction: parsed.recommendedAction,
            confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
          };
        }
      } catch {
        // fall through to default below
      }
    }

    return {
      classification: "NEEDS_INFORMATION",
      recommendedAction: "Could not parse AI classification — review manually.",
      confidence: 0,
    };
  }

  async generateContentIdea(trigger: string): Promise<string> {
    const system = [
      baseSystemPrompt(),
      "You are the Content Agent. Given an event trigger, write one short content idea",
      "(1-2 sentences: platform, hook, and format) ready to hand to the Content Command Center.",
    ].join(" ");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: `Trigger: ${trigger}` }],
    });

    return extractText(response).trim();
  }
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
