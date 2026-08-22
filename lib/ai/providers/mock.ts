import { AIProvider, ClassificationResult, ContentIdeaDraft } from "../provider";

export class MockAIProvider implements AIProvider {
  readonly name = "Mock AI";
  readonly isMock = true;

  async classifyReply(replyText: string): Promise<ClassificationResult> {
    const lower = replyText.toLowerCase();
    if (lower.includes("more information") || lower.includes("deck") || lower.includes("details")) {
      return { classification: "NEEDS_INFORMATION", recommendedAction: "Send sponsorship deck + propose a 15-minute call.", confidence: 0.88 };
    }
    if (lower.includes("call") || lower.includes("talk") || lower.includes("chat")) {
      return { classification: "CALL_REQUEST", recommendedAction: "Offer available time slots via Booking Agent.", confidence: 0.84 };
    }
    if (lower.includes("proposal") || lower.includes("numbers") || lower.includes("pricing")) {
      return { classification: "SEND_PROPOSAL", recommendedAction: "Generate and send tailored sponsorship proposal.", confidence: 0.86 };
    }
    if (lower.includes("not") && (lower.includes("interested") || lower.includes("fit"))) {
      return { classification: "NOT_INTERESTED", recommendedAction: "Log as declined and archive.", confidence: 0.81 };
    }
    if (lower.includes("budget") || lower.includes("expensive") || lower.includes("already")) {
      return { classification: "OBJECTION", recommendedAction: "Address concern directly, then re-offer a smaller package.", confidence: 0.77 };
    }
    if (lower.includes("later") || lower.includes("q4") || lower.includes("next quarter")) {
      return { classification: "FOLLOW_UP_LATER", recommendedAction: "Schedule automatic follow-up in 2 weeks.", confidence: 0.79 };
    }
    if (lower.includes("wrong") || lower.includes("not my department") || lower.includes("forward")) {
      return { classification: "WRONG_PERSON", recommendedAction: "Ask for the correct contact and re-route outreach.", confidence: 0.9 };
    }
    return { classification: "INTERESTED", recommendedAction: "Move to next stage and propose a concrete next step.", confidence: 0.72 };
  }

  async generateContentIdea(trigger: string): Promise<ContentIdeaDraft> {
    return {
      title: trigger,
      platform: "Instagram",
      hook: `This is why "${trigger}" matters.`,
      caption: `Content idea generated from: ${trigger}. (Mock AI — set ANTHROPIC_API_KEY for a real draft.)`,
      cta: "Follow for more.",
      suggestedFootage: "Relevant clip or photo from the event",
      sponsorIntegration: null,
    };
  }
}

export const mockAI = new MockAIProvider();
