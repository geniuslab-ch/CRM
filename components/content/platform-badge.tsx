import { Instagram, Youtube, Linkedin, Music2 } from "lucide-react";
import { ContentPlatform } from "@/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<ContentPlatform, { icon: typeof Instagram; color: string }> = {
  Instagram: { icon: Instagram, color: "text-accent bg-accent/15" },
  TikTok: { icon: Music2, color: "text-foreground bg-surface-2" },
  YouTube: { icon: Youtube, color: "text-danger bg-danger/15" },
  LinkedIn: { icon: Linkedin, color: "text-info bg-info/15" },
};

export function PlatformBadge({ platform }: { platform: ContentPlatform }) {
  const { icon: Icon, color } = CONFIG[platform];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", color)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {platform}
    </span>
  );
}
