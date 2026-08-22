// Shared with the Panna League marketing site (geniuslab-ch/PL, a
// separate deployment) — the canonical public URL for player
// registration. panna-league.vercel.app is a stale deployment/alias that
// doesn't reflect the current site — update this again if the real site
// ever moves to a custom domain.
export const MARKETING_SITE_URL = "https://pl-three-pi.vercel.app";

// A club's own recruitment link — the ?club= tag is read by the
// marketing site's register.html (see script.js there) to pre-fill the
// player's club field, so registrations from this specific poster/QR
// are correctly attributed back to the club in the CRM automatically.
export function clubRegistrationUrl(clubName: string): string {
  return `${MARKETING_SITE_URL}/register.html?club=${encodeURIComponent(clubName)}`;
}
