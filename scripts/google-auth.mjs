// One-time helper: mints a Google OAuth refresh token for the Calendar +
// Gmail integrations.
//
// Uses the manual authorization-code flow (no local HTTP server) so it
// works the same whether you run it on your own laptop or inside a remote
// dev container — the only requirement is a real browser SOMEWHERE to sign
// in with, not on the same machine as this script.
//
// Usage:
//   node scripts/google-auth.mjs
//
// Then paste the printed GOOGLE_REFRESH_TOKEN line into .env.local.

import { google } from "googleapis";
import readline from "node:readline/promises";
import { config } from "dotenv";

config({ path: ".env.local" });

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

// Must exactly match a redirect URI registered on the OAuth client.
// "http://localhost" (no port/path) is what Google's "Desktop app" client
// type registers by default — Google will redirect here even though
// nothing is listening; we only need the ?code=... in the resulting URL.
const REDIRECT_URI = "http://localhost";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send",
  // Read-only inbox access for the Conversation Manager's inbox poller
  // (app/api/cron/poll-inbox) — it only reads, never modifies or deletes
  // anything, so the least-privilege readonly scope is enough.
  "https://www.googleapis.com/auth/gmail.readonly",
];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n1. Open this URL and sign in with the Google account Panna League should use:\n");
console.log(authUrl);
console.log(
  '\n2. Approve access. The browser will land on a "can\'t be reached" page at localhost — that\'s expected.\n' +
    "   Copy the value after \"code=\" (and before any \"&\") from that page's address bar.\n"
);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const code = (await rl.question("3. Paste the code here: ")).trim();
rl.close();

try {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    console.error(
      "\nNo refresh_token returned. This usually means you've authorized this app before.\n" +
        "Go to https://myaccount.google.com/permissions, remove access for this app, and run this script again.\n"
    );
    process.exit(1);
  }
  console.log("\nDone. Add this line to .env.local:\n");
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
} catch (err) {
  console.error("Auth failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
