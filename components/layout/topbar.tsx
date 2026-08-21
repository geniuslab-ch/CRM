"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { MobileNav } from "./mobile-nav";
import { Zap } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(
    (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <MobileNav />
        <h1 className="text-lg font-semibold tracking-tight">{current?.label ?? "Dashboard"}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          146 AI hours saved
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold">
          NS
        </div>
      </div>
    </header>
  );
}
