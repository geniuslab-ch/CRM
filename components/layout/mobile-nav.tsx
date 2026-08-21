"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 focus-ring"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav
            aria-label="Mobile"
            className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-surface p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold">PANNA LEAGUE</p>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="focus-ring rounded-lg p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
                      active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:bg-surface-2"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
