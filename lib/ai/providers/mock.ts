import { AIProvider, ClassificationResult, OutreachRequest, OutreachResult } from "../provider";
import { brandVoice } from "@/lib/data/brand";

const OPENERS: Record<OutreachRequest["category"], string[]> = {
  PLAYER: ["We've been watching your moves", "Your name keeps coming up in our scouting"],
  CLUB: ["We're building the Panna League Switzerland roster", "We're scouting players across the region"],
  SPONSOR: ["Panna League Switzerland is building its founding partner lineup", "We're putting together our sponsor lineup for launch"],
  MEDIA: ["We're building the media program for Panna League Switzerland"],
};

export class MockAIProvider implements AIProvider {
  readonly name = "Mock AI";
  readonly isMock = true;

  async generateOutreach(req: OutreachRequest): Promise<OutreachResult> {
    const opener = OPENERS[req.category][0];
    const tone = brandVoice.tone.join(", ").toLowerCase();
    const message = `Hi ${req.targetName.split(" ")[0]},\n\n${opener} — ${req.researchInsight} ${req.personalizationAngle}\n\nPanna League Switzerland is a live street-football competition with a strong digital content engine. ${
      req.category === "SPONSOR"
        ? "We'd love to explore a partnership that puts your brand in front of a highly engaged, youth-focused audience — on-site and across social."
        : req.category === "CLUB"
        ? "We're recruiting players first — no commercial ask here, just looking for standout talent from your squad."
        : "We think you'd be a great fit for the roster."
    }\n\n${brandVoice.preferredCta}\n\n— Panna League Team`;

    return {
      researchInsight: req.researchInsight,
      personalizationAngle: req.personalizationAngle,
      message,
    };
  }

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

  async generateContentIdea(trigger: string): Promise<string> {
    return `Content idea generated from: ${trigger}`;
  }
}

export const mockAI = new MockAIProvider();
