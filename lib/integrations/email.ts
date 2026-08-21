import "server-only";
import { google } from "googleapis";
import { getGoogleAuth, isGoogleConfigured } from "./google-client";

// Email sending — the Outreach Agent's "SEND" action calls this interface.
// getEmailProvider() switches between MockEmailProvider and
// GmailProvider automatically, same pattern as the Calendar and Claude
// integrations.

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<{ sent: boolean; mock: boolean }>;
}

export class MockEmailProvider implements EmailProvider {
  async send(_to: string, _subject: string, _body: string): Promise<{ sent: boolean; mock: boolean }> {
    return { sent: true, mock: true };
  }
}

function encodeMessage(to: string, subject: string, body: string): string {
  const message = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=utf-8", "", body].join("\n");
  return Buffer.from(message).toString("base64url");
}

export class GmailProvider implements EmailProvider {
  private gmail = google.gmail({ version: "v1", auth: getGoogleAuth() });

  async send(to: string, subject: string, body: string): Promise<{ sent: boolean; mock: boolean }> {
    await this.gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodeMessage(to, subject, body) },
    });
    return { sent: true, mock: false };
  }
}

export function getEmailProvider(): EmailProvider {
  return isGoogleConfigured() ? new GmailProvider() : new MockEmailProvider();
}
