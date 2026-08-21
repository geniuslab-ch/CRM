import "server-only";
import { google } from "googleapis";
import { getGoogleAuth, isGoogleConfigured } from "./google-client";

// Calendar integration — the Booking Agent calls this interface.
// getCalendarProvider() switches between MockCalendarProvider and
// GoogleCalendarProvider automatically based on whether Google OAuth is
// configured (see .env.local / README "Real AI mode" section for the
// equivalent Claude pattern this mirrors).

export interface CalendarSlot {
  day: string; // e.g. "Tuesday" — human-readable label for the UI
  time: string; // e.g. "10:00" — human-readable label for the UI
  startISO: string; // real start timestamp used for booking
  endISO: string;
}

export interface CalendarProvider {
  getAvailableSlots(): Promise<CalendarSlot[]>;
  bookMeeting(slot: CalendarSlot, withName: string, notes?: string): Promise<{ confirmed: boolean; eventLink?: string }>;
}

export class MockCalendarProvider implements CalendarProvider {
  async getAvailableSlots(): Promise<CalendarSlot[]> {
    const now = Date.now();
    const days = [
      { day: "Tuesday", time: "10:00", offsetDays: 1 },
      { day: "Wednesday", time: "14:00", offsetDays: 2 },
      { day: "Thursday", time: "09:30", offsetDays: 3 },
    ];
    return days.map(({ day, time, offsetDays }) => {
      const start = new Date(now + offsetDays * 86400000);
      const end = new Date(start.getTime() + 30 * 60000);
      return { day, time, startISO: start.toISOString(), endISO: end.toISOString() };
    });
  }

  async bookMeeting(): Promise<{ confirmed: boolean }> {
    return { confirmed: true };
  }
}

const BUSINESS_HOURS = { startHour: 9, endHour: 17 };
const SLOT_MINUTES = 30;

export class GoogleCalendarProvider implements CalendarProvider {
  private calendar = google.calendar({ version: "v3", auth: getGoogleAuth() });

  async getAvailableSlots(): Promise<CalendarSlot[]> {
    const timeMin = new Date();
    const timeMax = new Date(timeMin.getTime() + 7 * 86400000);

    const { data } = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: "primary" }],
      },
    });
    const busy = (data.calendars?.primary?.busy ?? []).map((b) => ({
      start: new Date(b.start!).getTime(),
      end: new Date(b.end!).getTime(),
    }));

    const slots: CalendarSlot[] = [];
    for (let dayOffset = 1; dayOffset <= 7 && slots.length < 6; dayOffset++) {
      const day = new Date(timeMin.getTime() + dayOffset * 86400000);
      if (day.getDay() === 0 || day.getDay() === 6) continue; // skip weekends

      for (let hour = BUSINESS_HOURS.startHour; hour < BUSINESS_HOURS.endHour && slots.length < 6; hour++) {
        const start = new Date(day);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start.getTime() + SLOT_MINUTES * 60000);

        const overlaps = busy.some((b) => start.getTime() < b.end && end.getTime() > b.start);
        if (!overlaps) {
          slots.push({
            day: start.toLocaleDateString("en-GB", { weekday: "long" }),
            time: start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            startISO: start.toISOString(),
            endISO: end.toISOString(),
          });
        }
      }
    }
    return slots;
  }

  async bookMeeting(slot: CalendarSlot, withName: string, notes?: string): Promise<{ confirmed: boolean; eventLink?: string }> {
    const { data } = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: `Panna League x ${withName}`,
        description: notes ?? "Booked automatically by the Panna League AI Command Center.",
        start: { dateTime: slot.startISO },
        end: { dateTime: slot.endISO },
      },
    });
    return { confirmed: true, eventLink: data.htmlLink ?? undefined };
  }
}

export function getCalendarProvider(): CalendarProvider {
  return isGoogleConfigured() ? new GoogleCalendarProvider() : new MockCalendarProvider();
}
