import { Platform } from 'react-native';

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string; // ISO 8601 string
  end: string; // ISO 8601 string
  isAllDay?: boolean;
  location?: string;
  notes?: string;
  calendar?: string;
}

export interface FreeBusySlot {
  start: string;
  end: string;
}

export interface FreeBusyResult {
  start: string;
  end: string;
  busy_count: number;
  free_count: number;
  busy_slots: { title: string; start: string; end: string }[];
  free_slots: FreeBusySlot[];
}

/**
 * Pure function: calculates free and busy intervals within [rangeStart, rangeEnd].
 * Extracted from Kelivo's Swift implementation for testability and clarity.
 */
export function calculateFreeBusy(
  events: CalendarEventItem[],
  rangeStart: Date,
  rangeEnd: Date,
): FreeBusyResult {
  const sorted = events
    .filter(e => !e.isAllDay)
    .map(e => ({
      ...e,
      startDate: new Date(e.start),
      endDate: new Date(e.end),
    }))
    .filter(
      e =>
        !isNaN(e.startDate.getTime()) &&
        !isNaN(e.endDate.getTime()) &&
        e.endDate > rangeStart &&
        e.startDate < rangeEnd,
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const busySlots: { title: string; start: string; end: string }[] = [];
  const freeSlots: FreeBusySlot[] = [];

  let lastEnd = new Date(rangeStart);

  for (const e of sorted) {
    const effectiveStart =
      e.startDate > rangeStart ? e.startDate : new Date(rangeStart);
    const effectiveEnd = e.endDate < rangeEnd ? e.endDate : new Date(rangeEnd);

    if (effectiveStart > lastEnd) {
      freeSlots.push({
        start: lastEnd.toISOString(),
        end: effectiveStart.toISOString(),
      });
    }

    busySlots.push({
      title: e.title || '',
      start: effectiveStart.toISOString(),
      end: effectiveEnd.toISOString(),
    });

    if (effectiveEnd > lastEnd) {
      lastEnd = new Date(effectiveEnd);
    }
  }

  if (lastEnd < rangeEnd) {
    freeSlots.push({
      start: lastEnd.toISOString(),
      end: rangeEnd.toISOString(),
    });
  }

  return {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    busy_count: busySlots.count ?? busySlots.length,
    free_count: freeSlots.length,
    busy_slots: busySlots,
    free_slots: freeSlots,
  };
}

let nativeCalendarModule: any = null;

function getNativeCalendar() {
  if (nativeCalendarModule) return nativeCalendarModule;
  try {
    const mod = require('react-native-calendar-events');
    nativeCalendarModule = mod.default || mod;
  } catch {
    nativeCalendarModule = null;
  }
  return nativeCalendarModule;
}

export class CalendarService {
  private static async ensurePermission(): Promise<void> {
    const rncal = getNativeCalendar();
    if (!rncal) {
      throw new Error(
        'Calendar module is not available on this platform or runtime.',
      );
    }

    let status = await rncal.checkPermissions();
    if (status !== 'authorized') {
      status = await rncal.requestPermissions();
      if (status !== 'authorized') {
        throw new Error(
          `Calendar access permission was denied (status: ${status}). Please enable calendar permissions in system settings.`,
        );
      }
    }
  }

  static async listCalendars(): Promise<any[]> {
    await this.ensurePermission();
    const rncal = getNativeCalendar();
    const calendars = await rncal.findCalendars();
    return (calendars || []).map((cal: any) => ({
      id: cal.id,
      title: cal.title,
      type: cal.type,
      isPrimary: cal.isPrimary,
      allowsModifications: cal.allowsModifications,
    }));
  }

  static async listEvents(options: {
    days?: number;
    start?: string;
    end?: string;
    calendarName?: string;
    calendarId?: string;
  }): Promise<{ count: number; events: CalendarEventItem[] }> {
    await this.ensurePermission();
    const rncal = getNativeCalendar();

    const now = new Date();
    const days = options.days ?? 7;
    const startDate = options.start
      ? new Date(options.start)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = options.end
      ? new Date(options.end)
      : new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    let calendarsToSearch: string[] | undefined;
    if (options.calendarId) {
      calendarsToSearch = [options.calendarId];
    } else if (options.calendarName) {
      const allCalendars = await rncal.findCalendars();
      const target = allCalendars.find(
        (c: any) =>
          c.title?.toLowerCase() === options.calendarName?.toLowerCase() ||
          c.title?.toLowerCase().includes(options.calendarName?.toLowerCase()),
      );
      if (target) {
        calendarsToSearch = [target.id];
      }
    }

    const rawEvents = await rncal.fetchAllEvents(
      startDate.toISOString(),
      endDate.toISOString(),
      calendarsToSearch,
    );

    const events: CalendarEventItem[] = (rawEvents || [])
      .map((e: any) => ({
        id: e.id,
        title: e.title || '',
        start: e.startDate,
        end: e.endDate,
        isAllDay: !!e.allDay,
        location: e.location || '',
        notes: e.description || e.notes || '',
        calendar: e.calendar?.title || '',
      }))
      .sort(
        (a: CalendarEventItem, b: CalendarEventItem) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

    return {
      count: events.length,
      events,
    };
  }

  static async searchEvents(options: {
    query: string;
    days?: number;
  }): Promise<{ query: string; count: number; events: CalendarEventItem[] }> {
    await this.ensurePermission();
    const rncal = getNativeCalendar();

    const now = new Date();
    const days = options.days ?? 30;
    // Search from 7 days ago to `days` in the future (matching Kelivo's search window)
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const rawEvents = await rncal.fetchAllEvents(
      startDate.toISOString(),
      endDate.toISOString(),
    );

    const q = options.query.trim().toLowerCase();
    const matched: CalendarEventItem[] = (rawEvents || [])
      .filter((e: any) => {
        const title = (e.title || '').toLowerCase();
        const notes = (e.description || e.notes || '').toLowerCase();
        const loc = (e.location || '').toLowerCase();
        return !q || title.includes(q) || notes.includes(q) || loc.includes(q);
      })
      .map((e: any) => ({
        id: e.id,
        title: e.title || '',
        start: e.startDate,
        end: e.endDate,
        isAllDay: !!e.allDay,
        location: e.location || '',
        notes: e.description || e.notes || '',
        calendar: e.calendar?.title || '',
      }))
      .sort(
        (a: CalendarEventItem, b: CalendarEventItem) =>
          new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

    return {
      query: options.query,
      count: matched.length,
      events: matched,
    };
  }

  static async freebusy(options: {
    days?: number;
    start?: string;
    end?: string;
  }): Promise<FreeBusyResult> {
    await this.ensurePermission();
    const rncal = getNativeCalendar();

    const now = new Date();
    const days = options.days ?? 1;
    const rangeStart = options.start
      ? new Date(options.start)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const rangeEnd = options.end
      ? new Date(options.end)
      : new Date(rangeStart.getTime() + days * 24 * 60 * 60 * 1000);

    const rawEvents = await rncal.fetchAllEvents(
      rangeStart.toISOString(),
      rangeEnd.toISOString(),
    );

    const events: CalendarEventItem[] = (rawEvents || []).map((e: any) => ({
      id: e.id,
      title: e.title || '',
      start: e.startDate,
      end: e.endDate,
      isAllDay: !!e.allDay,
      location: e.location || '',
      notes: e.description || e.notes || '',
      calendar: e.calendar?.title || '',
    }));

    return calculateFreeBusy(events, rangeStart, rangeEnd);
  }

  static async createEvent(options: {
    title: string;
    start?: string;
    end?: string;
    location?: string;
    notes?: string;
    alarmMinutes?: number;
    calendarName?: string;
    calendarId?: string;
  }): Promise<{
    success: boolean;
    id: string;
    title: string;
    start: string;
    end: string;
    calendar?: string;
    message: string;
  }> {
    if (!options.title || !options.title.trim()) {
      throw new Error("Parameter 'title' is required to create a calendar event.");
    }

    await this.ensurePermission();
    const rncal = getNativeCalendar();

    const startDate = options.start
      ? new Date(options.start)
      : new Date(Date.now() + 60 * 60 * 1000);
    const endDate = options.end
      ? new Date(options.end)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    let targetCalendarId = options.calendarId;
    let targetCalendarTitle: string | undefined;

    if (!targetCalendarId && options.calendarName) {
      const calendars = await rncal.findCalendars();
      const target = calendars.find(
        (c: any) =>
          c.title?.toLowerCase() === options.calendarName?.toLowerCase() ||
          c.title?.toLowerCase().includes(options.calendarName?.toLowerCase()),
      );
      if (target) {
        targetCalendarId = target.id;
        targetCalendarTitle = target.title;
      }
    }

    const details: any = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: options.location,
      notes: options.notes,
      description: options.notes,
    };

    if (targetCalendarId) {
      details.calendarId = targetCalendarId;
    }

    if (
      typeof options.alarmMinutes === 'number' &&
      options.alarmMinutes >= 0
    ) {
      details.alarms = [{ date: -options.alarmMinutes }];
    }

    const eventId = await rncal.saveEvent(options.title.trim(), details);

    return {
      success: true,
      id: eventId,
      title: options.title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      calendar: targetCalendarTitle,
      message: `Calendar event '${options.title.trim()}' created successfully.`,
    };
  }

  static async updateEvent(options: {
    id: string;
    title?: string;
    start?: string;
    end?: string;
    location?: string;
    notes?: string;
    alarmMinutes?: number;
    calendarId?: string;
  }): Promise<{
    success: boolean;
    id: string;
    message: string;
  }> {
    if (!options.id) {
      throw new Error("Parameter 'id' is required to update an event.");
    }

    await this.ensurePermission();
    const rncal = getNativeCalendar();

    const details: any = {
      id: options.id,
    };

    if (options.title) details.title = options.title.trim();
    if (options.start) details.startDate = new Date(options.start).toISOString();
    if (options.end) details.endDate = new Date(options.end).toISOString();
    if (options.location !== undefined) details.location = options.location;
    if (options.notes !== undefined) {
      details.notes = options.notes;
      details.description = options.notes;
    }
    if (options.calendarId) details.calendarId = options.calendarId;
    if (typeof options.alarmMinutes === 'number') {
      details.alarms =
        options.alarmMinutes >= 0 ? [{ date: -options.alarmMinutes }] : [];
    }

    const titleToSave = options.title ? options.title.trim() : '';
    await rncal.saveEvent(titleToSave, details);

    return {
      success: true,
      id: options.id,
      message: `Calendar event (id: ${options.id}) updated successfully.`,
    };
  }

  static async deleteEvent(options: {
    id: string;
  }): Promise<{ success: boolean; id: string; message: string }> {
    if (!options.id) {
      throw new Error("Parameter 'id' is required to delete an event.");
    }

    await this.ensurePermission();
    const rncal = getNativeCalendar();
    await rncal.removeEvent(options.id);

    return {
      success: true,
      id: options.id,
      message: `Calendar event (id: ${options.id}) deleted successfully.`,
    };
  }
}
