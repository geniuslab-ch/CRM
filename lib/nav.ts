import {
  LayoutDashboard,
  Users,
  Shield,
  Handshake,
  MessagesSquare,
  Clapperboard,
  BarChart3,
  CalendarDays,
  Bot,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/players", label: "Players", icon: Users },
  { href: "/clubs", label: "Clubs", icon: Shield },
  { href: "/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/content", label: "Content", icon: Clapperboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/event", label: "Event", icon: CalendarDays },
  { href: "/agents", label: "AI Team", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];
