import "server-only";
import { google } from "googleapis";
import { getGoogleAuth, isGoogleConfigured } from "./google-client";

// Email sending — the Outreach Agent's "SEND" action calls this interface.
// getEmailProvider() switches between MockEmailProvider and
// GmailProvider automatically, same pattern as the Calendar and Claude
// integrations.

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface EmailProvider {
  send(
    to: string,
    subject: string,
    body: string,
    attachment?: EmailAttachment
  ): Promise<{ sent: boolean; mock: boolean }>;
}

export class MockEmailProvider implements EmailProvider {
  async send(
    _to: string,
    _subject: string,
    _body: string,
    _attachment?: EmailAttachment
  ): Promise<{ sent: boolean; mock: boolean }> {
    return { sent: true, mock: true };
  }
}

// Email headers must be plain ASCII (RFC 5322) — a subject with any
// non-ASCII character (accents, em dashes, umlauts...) has to be wrapped
// in an RFC 2047 encoded-word or mail clients render it as mojibake.
// The body doesn't need this: its charset is declared separately via the
// Content-Type header, which the raw header bytes can't carry.
function encodeSubject(subject: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;
}

function encodeMessage(to: string, subject: string, body: string, attachment?: EmailAttachment): string {
  const encodedSubject = encodeSubject(subject);

  if (!attachment) {
    const message = [`To: ${to}`, `Subject: ${encodedSubject}`, "Content-Type: text/plain; charset=utf-8", "", body].join(
      "\n"
    );
    return Buffer.from(message).toString("base64url");
  }

  const boundary = `panna-${Date.now().toString(36)}`;
  const parts = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
    "",
    `--${boundary}`,
    `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    "",
    attachment.content.toString("base64"),
    "",
    `--${boundary}--`,
  ];
  return Buffer.from(parts.join("\n")).toString("base64url");
}

export class GmailProvider implements EmailProvider {
  private gmail = google.gmail({ version: "v1", auth: getGoogleAuth() });

  async send(
    to: string,
    subject: string,
    body: string,
    attachment?: EmailAttachment
  ): Promise<{ sent: boolean; mock: boolean }> {
    await this.gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodeMessage(to, subject, body, attachment) },
    });
    return { sent: true, mock: false };
  }
}

export function getEmailProvider(): EmailProvider {
  return isGoogleConfigured() ? new GmailProvider() : new MockEmailProvider();
}
