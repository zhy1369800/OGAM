import { calculateFreeBusy, CalendarEventItem } from '../../../src/services/calendar/calendarService';

describe('calculateFreeBusy', () => {
  const rangeStart = new Date('2026-10-11T09:00:00.000Z');
  const rangeEnd = new Date('2026-10-11T18:00:00.000Z');

  it('returns whole interval as free when there are no events', () => {
    const result = calculateFreeBusy([], rangeStart, rangeEnd);
    expect(result.busy_count).toBe(0);
    expect(result.free_count).toBe(1);
    expect(result.free_slots).toEqual([
      {
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
    ]);
  });

  it('correctly segments free time around a single busy event', () => {
    const events: CalendarEventItem[] = [
      {
        id: '1',
        title: 'Team Sync',
        start: '2026-10-11T10:00:00.000Z',
        end: '2026-10-11T11:00:00.000Z',
      },
    ];

    const result = calculateFreeBusy(events, rangeStart, rangeEnd);
    expect(result.busy_count).toBe(1);
    expect(result.free_count).toBe(2);
    expect(result.free_slots).toEqual([
      {
        start: rangeStart.toISOString(),
        end: '2026-10-11T10:00:00.000Z',
      },
      {
        start: '2026-10-11T11:00:00.000Z',
        end: rangeEnd.toISOString(),
      },
    ]);
  });

  it('merges and handles overlapping events properly', () => {
    const events: CalendarEventItem[] = [
      {
        id: '1',
        title: 'Meeting A',
        start: '2026-10-11T10:00:00.000Z',
        end: '2026-10-11T11:30:00.000Z',
      },
      {
        id: '2',
        title: 'Meeting B',
        start: '2026-10-11T11:00:00.000Z',
        end: '2026-10-11T12:00:00.000Z',
      },
    ];

    const result = calculateFreeBusy(events, rangeStart, rangeEnd);
    expect(result.busy_count).toBe(2);
    // Free slots: 09:00 - 10:00 and 12:00 - 18:00
    expect(result.free_count).toBe(2);
    expect(result.free_slots).toEqual([
      {
        start: rangeStart.toISOString(),
        end: '2026-10-11T10:00:00.000Z',
      },
      {
        start: '2026-10-11T12:00:00.000Z',
        end: rangeEnd.toISOString(),
      },
    ]);
  });

  it('ignores all-day events and events completely outside range', () => {
    const events: CalendarEventItem[] = [
      {
        id: '1',
        title: 'Holiday',
        start: '2026-10-11T00:00:00.000Z',
        end: '2026-10-11T23:59:59.000Z',
        isAllDay: true,
      },
      {
        id: '2',
        title: 'Yesterday',
        start: '2026-10-10T10:00:00.000Z',
        end: '2026-10-10T11:00:00.000Z',
      },
      {
        id: '3',
        title: 'Tomorrow',
        start: '2026-10-12T10:00:00.000Z',
        end: '2026-10-12T11:00:00.000Z',
      },
    ];

    const result = calculateFreeBusy(events, rangeStart, rangeEnd);
    expect(result.busy_count).toBe(0);
    expect(result.free_count).toBe(1);
  });
});
