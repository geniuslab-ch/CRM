"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children, aiLive }: { children: React.ReactNode; aiLive: boolean }) {
  const pathname = usePathname();

  // /login renders its own full-bleed layout — no nav chrome for an
  // unauthenticated visitor to see.
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar aiLive={aiLive} />
      <div className="lg:pl-60">
        <Topbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
