// Shared with the Panna League marketing site (geniuslab-ch/panna-league,
// a separate deployment) — the canonical public URL for player
// registration. Update this if that site ever moves to a custom domain.
export const MARKETING_SITE_URL = "https://panna-league.vercel.app";

// A club's own recruitment link — the ?club= tag is read by the
// marketing site's register.html (see script.js there) to pre-fill the
// player's club field, so registrations from this specific poster/QR
// are correctly attributed back to the club in the CRM automatically.
export function clubRegistrationUrl(clubName: string): string {
  return `${MARKETING_SITE_URL}/register.html?club=${encodeURIComponent(clubName)}`;
}
