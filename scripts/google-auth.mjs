// One-time helper: mints a Google OAuth refresh token for the Calendar +
// Gmail integrations. Must be run locally on your own machine — it opens
// a URL you sign in to in a real browser, which this session can't do.
//
// Usage:
//   node scripts/google-auth.mjs
//
// Then paste the printed GOOGLE_REFRESH_TOKEN line into .env.local.

import { google } from "googleapis";
import http from "node:http";
import { config } from "dotenv";

config({ path: ".env.local" });

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET in .env.local first.");
  process.exit(1);
}

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const SCOPES = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/gmail.send"];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n1. Open this URL and sign in with the Google account Panna League should use:\n");
console.log(authUrl);
console.log("\n2. Approve access — you'll be redirected back here automatically.\n");

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get("code");
    if (!code) {
      res.writeHead(400).end("No authorization code in callback.");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Success — you can close this tab and return to the terminal.</h1>");
    server.close();

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
    process.exit(0);
  } catch (err) {
    console.error("Auth failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Waiting for sign-in to complete (listening on ${REDIRECT_URI})...`);
});
