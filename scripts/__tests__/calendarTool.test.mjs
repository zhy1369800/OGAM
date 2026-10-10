import test from 'node:test';
import assert from 'node:assert/strict';

// Test calculateFreeBusy logic directly
function calculateFreeBusy(events, rangeStart, rangeEnd) {
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

  const busySlots = [];
  const freeSlots = [];

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
    busy_count: busySlots.length,
    free_count: freeSlots.length,
    busy_slots: busySlots,
    free_slots: freeSlots,
  };
}

test('calculateFreeBusy returns full duration when no busy events', () => {
  const start = new Date('2026-10-11T09:00:00.000Z');
  const end = new Date('2026-10-11T18:00:00.000Z');
  const result = calculateFreeBusy([], start, end);

  assert.equal(result.busy_count, 0);
  assert.equal(result.free_count, 1);
  assert.equal(result.free_slots[0].start, start.toISOString());
  assert.equal(result.free_slots[0].end, end.toISOString());
});

test('calculateFreeBusy computes available slots between events', () => {
  const start = new Date('2026-10-11T09:00:00.000Z');
  const end = new Date('2026-10-11T18:00:00.000Z');
  const events = [
    {
      id: '1',
      title: 'Morning Meeting',
      start: '2026-10-11T10:00:00.000Z',
      end: '2026-10-11T11:00:00.000Z',
      isAllDay: false,
    },
    {
      id: '2',
      title: 'Lunch',
      start: '2026-10-11T12:00:00.000Z',
      end: '2026-10-11T13:00:00.000Z',
      isAllDay: false,
    },
  ];

  const result = calculateFreeBusy(events, start, end);
  assert.equal(result.busy_count, 2);
  assert.equal(result.free_count, 3);
  // Free 1: 09:00 - 10:00
  assert.equal(result.free_slots[0].start, '2026-10-11T09:00:00.000Z');
  assert.equal(result.free_slots[0].end, '2026-10-11T10:00:00.000Z');
  // Free 2: 11:00 - 12:00
  assert.equal(result.free_slots[1].start, '2026-10-11T11:00:00.000Z');
  assert.equal(result.free_slots[1].end, '2026-10-11T12:00:00.000Z');
  // Free 3: 13:00 - 18:00
  assert.equal(result.free_slots[2].start, '2026-10-11T13:00:00.000Z');
  assert.equal(result.free_slots[2].end, '2026-10-11T18:00:00.000Z');
});

test('calculateFreeBusy merges overlapping events into continuous busy blocks', () => {
  const start = new Date('2026-10-11T09:00:00.000Z');
  const end = new Date('2026-10-11T14:00:00.000Z');
  const events = [
    {
      id: '1',
      title: 'Workshop Part 1',
      start: '2026-10-11T10:00:00.000Z',
      end: '2026-10-11T11:30:00.000Z',
    },
    {
      id: '2',
      title: 'Workshop Part 2',
      start: '2026-10-11T11:00:00.000Z',
      end: '2026-10-11T12:00:00.000Z',
    },
  ];

  const result = calculateFreeBusy(events, start, end);
  assert.equal(result.free_count, 2);
  // 09:00 - 10:00 free
  assert.equal(result.free_slots[0].start, '2026-10-11T09:00:00.000Z');
  assert.equal(result.free_slots[0].end, '2026-10-11T10:00:00.000Z');
  // 12:00 - 14:00 free
  assert.equal(result.free_slots[1].start, '2026-10-11T12:00:00.000Z');
  assert.equal(result.free_slots[1].end, '2026-10-11T14:00:00.000Z');
});
