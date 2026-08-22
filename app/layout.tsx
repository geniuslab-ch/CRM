import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { isAIModeLive } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Panna League AI Command Center",
  description:
    "One human. An AI team. Recruit players, find sponsors, build partnerships and create content for Panna League Switzerland.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AppShell aiLive={isAIModeLive()}>{children}</AppShell>
      </body>
    </html>
  );
}
