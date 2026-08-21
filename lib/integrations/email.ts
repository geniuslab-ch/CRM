// Email/outreach sending interface (future: Gmail API).

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<{ sent: boolean; mock: boolean }>;
}

export class MockEmailProvider implements EmailProvider {
  async send(_to: string, _subject: string, _body: string): Promise<{ sent: boolean; mock: boolean }> {
    return { sent: true, mock: true };
  }
}
