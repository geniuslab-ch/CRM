import "server-only";
import { google } from "googleapis";

// Shared Google OAuth2 client for the Calendar + Gmail integrations.
// Uses a single organizer's refresh token (minted once via
// `npm run google:auth`) rather than a full per-user OAuth login flow —
// the right tradeoff for a single-organizer internal tool.

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN
  );
}

export function getGoogleAuth() {
  const client = new google.auth.OAuth2(process.env.GOOGLE_CALENDAR_CLIENT_ID, process.env.GOOGLE_CALENDAR_CLIENT_SECRET);
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}
