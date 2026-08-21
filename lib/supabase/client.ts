import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service_role key — bypasses Row
// Level Security, so this must never be imported from a client component
// (the "server-only" import enforces that at build time).

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseServerClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
      // Next.js patches the global fetch() and, within a single request,
      // deduplicates/caches calls with an identical signature — including
      // ones made by third-party SDKs like this one. Without cache:
      // "no-store" here, two identical Supabase reads in the same request
      // (e.g. a count taken before and after a write) can silently return
      // the same stale response instead of hitting the database twice.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  }
  return client;
}
