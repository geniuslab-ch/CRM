// Calendar integration interface (future: Google Calendar).
// The Booking Agent calls this interface — swap MockCalendarProvider for
// a real Google Calendar adapter without touching UI code.

export interface CalendarSlot {
  day: string;
  time: string;
}

export interface CalendarProvider {
  getAvailableSlots(): Promise<CalendarSlot[]>;
  bookMeeting(slot: CalendarSlot, withName: string): Promise<{ confirmed: boolean }>;
}

export class MockCalendarProvider implements CalendarProvider {
  async getAvailableSlots(): Promise<CalendarSlot[]> {
    return [
      { day: "Tuesday", time: "10:00" },
      { day: "Wednesday", time: "14:00" },
      { day: "Thursday", time: "09:30" },
    ];
  }

  async bookMeeting(_slot: CalendarSlot, _withName: string): Promise<{ confirmed: boolean }> {
    return { confirmed: true };
  }
}
