import { AIMemoryEntry, BrandVoice } from "@/types";

export const brandVoice: BrandVoice = {
  company: "Panna League",
  description:
    "Panna League is a competitive 1v1 / small-sided street-football competition built for Switzerland — combining live physical events with a digital-first content engine.",
  tone: ["Bold", "Urban", "Sporting", "Professional", "Energetic"],
  avoid: ["Corporate jargon", "Generic sales language", "Overly formal language"],
  preferredCta: "Let's talk.",
};

export const aiMemory: AIMemoryEntry[] = [
  {
    key: "event",
    label: "Event",
    value: "Panna League Switzerland — Lausanne launch event, pre-launch phase, targeting 32 confirmed players.",
  },
  {
    key: "audience",
    label: "Target audience",
    value: "Football fans, youth & young adults (16–35), urban/street sports culture, Swiss digital audience.",
  },
  {
    key: "market",
    label: "Target market",
    value: "Switzerland — French, German and Italian-speaking regions.",
  },
  {
    key: "sponsorship_budget",
    label: "Sponsorship budget range",
    value: "CHF 5,000 – 50,000+ per partner, tiered by activation scope.",
  },
  {
    key: "digital_target",
    label: "Digital audience target",
    value: "10,000 combined digital reach (Instagram, TikTok, YouTube, LinkedIn) for the launch event.",
  },
  {
    key: "messaging_rule_clubs",
    label: "Messaging rule — clubs",
    value: "Always lead club outreach with player recruitment, never commercial partnership, unless the club has already confirmed players.",
  },
  {
    key: "messaging_rule_tone",
    label: "Messaging rule — tone",
    value: "Every outbound message must reflect Panna League's brand voice: bold, urban, sporting, professional, energetic. Avoid corporate jargon.",
  },
  {
    key: "positioning",
    label: "Positioning statement",
    value: "Panna League turns street football into a media property — a compact physical activation format combined with high-frequency digital content.",
  },
];
